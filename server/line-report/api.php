<?php
declare(strict_types=1);

$config = require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && hash_equals($config['allowed_origin'], $origin)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Sync-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

$token = $_SERVER['HTTP_X_SYNC_TOKEN'] ?? '';
if (!hash_equals($config['sync_shared_secret'], $token)) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'invalid_token']);
    exit;
}

$body = json_decode((string) file_get_contents('php://input'), true);

if (!is_array($body) || !isset($body['reports']) || !is_array($body['reports'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid_payload']);
    exit;
}

$clean = [];
foreach (array_slice($body['reports'], -90) as $report) {
    if (!is_array($report)) {
        continue;
    }
    $date = isset($report['date']) ? (string) $report['date'] : '';
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        continue;
    }
    $clean[] = [
        'date' => $date,
        'clicks' => (int) ($report['clicks'] ?? 0),
        'orders' => (int) ($report['orders'] ?? 0),
        'sales' => (int) ($report['sales'] ?? 0),
        'reward' => (int) ($report['reward'] ?? 0),
    ];
}

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0770, true);
}

file_put_contents($dataDir . '/reports.json', json_encode($clean, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode(['ok' => true, 'count' => count($clean)]);
