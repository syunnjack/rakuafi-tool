<?php
declare(strict_types=1);

function loadReports(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

function sumReports(array $reports): array
{
    $sum = ['clicks' => 0, 'orders' => 0, 'sales' => 0, 'reward' => 0];
    foreach ($reports as $report) {
        $sum['clicks'] += (int) ($report['clicks'] ?? 0);
        $sum['orders'] += (int) ($report['orders'] ?? 0);
        $sum['sales'] += (int) ($report['sales'] ?? 0);
        $sum['reward'] += (int) ($report['reward'] ?? 0);
    }
    return $sum;
}

function last7Reports(array $reports, DateTimeImmutable $today): array
{
    return array_values(array_filter($reports, function ($report) use ($today) {
        $date = $report['date'] ?? null;
        if (!$date) {
            return false;
        }
        $reportDate = DateTimeImmutable::createFromFormat('!Y-m-d', $date, $today->getTimezone());
        if (!$reportDate) {
            return false;
        }
        return $reportDate <= $today && $today->diff($reportDate)->days < 7;
    }));
}

function formatYen(int $value): string
{
    return '¥' . number_format($value);
}

function buildReportMessage(array $reports, DateTimeImmutable $today): string
{
    if (empty($reports)) {
        return "【楽天アフィリエイト日報】\n記録がまだありません。rakuafi-toolで日次レポートを入力してください。";
    }

    usort($reports, fn($a, $b) => strcmp((string) $a['date'], (string) $b['date']));
    $latest = end($reports);

    $last7Sum = sumReports(last7Reports($reports, $today));

    $lines = [
        '【楽天アフィリエイト日報】' . $today->format('n/j'),
        '',
        '最新記録: ' . $latest['date'],
        'クリック: ' . number_format((int) $latest['clicks']),
        '注文: ' . number_format((int) $latest['orders']),
        '売上: ' . formatYen((int) $latest['sales']),
        '報酬: ' . formatYen((int) $latest['reward']),
        '',
        '直近7日 クリック: ' . number_format($last7Sum['clicks']),
        '直近7日 報酬: ' . formatYen($last7Sum['reward']),
    ];

    $latestDate = DateTimeImmutable::createFromFormat('!Y-m-d', (string) $latest['date'], $today->getTimezone());
    $daysSinceLatest = $latestDate ? $today->diff($latestDate)->days : null;
    if ($daysSinceLatest !== null && $latest['date'] !== $today->format('Y-m-d') && $daysSinceLatest >= 1) {
        $lines[] = '';
        $lines[] = '※ 直近の記録が' . $daysSinceLatest . '日前です。今日の分をrakuafi-toolに入力してください。';
    }

    return implode("\n", $lines);
}

function pushLineMessage(string $apiBase, string $accessToken, string $userId, string $text): array
{
    $url = rtrim($apiBase, '/') . '/v2/bot/message/push';
    $payload = json_encode([
        'to' => $userId,
        'messages' => [
            ['type' => 'text', 'text' => $text],
        ],
    ], JSON_UNESCAPED_UNICODE);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $accessToken,
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
    ]);
    $responseBody = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    return ['status' => $status, 'body' => $responseBody, 'error' => $error];
}

// Only runs when this file is executed directly (e.g. by cron), not when required for tests.
if (php_sapi_name() === 'cli' && isset($argv[0]) && realpath($argv[0]) === __FILE__) {
    $config = require __DIR__ . '/config.php';
    $reports = loadReports(__DIR__ . '/data/reports.json');
    $today = new DateTimeImmutable('today', new DateTimeZone('Asia/Tokyo'));
    $message = buildReportMessage($reports, $today);
    $result = pushLineMessage(
        $config['line_api_base'],
        $config['line_channel_access_token'],
        $config['line_user_id'],
        $message
    );

    $logLine = sprintf(
        "[%s] status=%s error=%s body=%s\n",
        (new DateTimeImmutable('now', new DateTimeZone('Asia/Tokyo')))->format('Y-m-d H:i:s'),
        $result['status'],
        $result['error'],
        substr((string) $result['body'], 0, 300)
    );
    file_put_contents(__DIR__ . '/data/send-log.txt', $logLine, FILE_APPEND);
}
