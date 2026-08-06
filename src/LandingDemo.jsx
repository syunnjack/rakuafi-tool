import { useState } from 'react'
import { buildRoomPost } from './lib/postBuilder.js'

const ROOM_POST_URL = 'https://room.rakuten.co.jp/'

const initialDraft = {
  productName: '先生のためのAI＆ICT働き方革命術',
  productLink: 'https://item.rakuten.co.jp/book/17900720/',
  audience: '授業準備や校務に追われている先生',
  problem: '毎日の準備と事務作業に時間が足りない',
  benefit: 'AIとICTで今日からすぐ真似できる働き方の見直し方がまとまっています',
  proof: '実際に読んで、明日から使える手順が多く実用的でした',
  priceHook: '',
  hashtags: '#教員 #働き方改革 #AI活用',
}

export default function LandingDemo() {
  const [draft, setDraft] = useState(initialDraft)
  const [message, setMessage] = useState('')

  const update = (field) => (event) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }))
  }

  const generatedPost = buildRoomPost(draft)

  const copyAndOpenRoom = async () => {
    window.open(ROOM_POST_URL, '_blank', 'noopener')
    try {
      await navigator.clipboard.writeText(generatedPost)
      setMessage('投稿文をコピーしました。開いたROOMのタブに貼り付けて投稿してください。')
    } catch {
      setMessage('コピーできませんでした。プレビューの文章を選択してコピーしてください。')
    }
  }

  return (
    <div className="demo-widget">
      <div className="demo-widget-form">
        <p className="demo-text-label">試しに入力してみてください</p>
        <label>
          商品名
          <input value={draft.productName} onChange={update('productName')} placeholder="例: 軽量コードレス掃除機" />
        </label>
        <label>
          誰向け
          <input value={draft.audience} onChange={update('audience')} placeholder="例: 忙しい一人暮らしの方" />
        </label>
        <label>
          悩み
          <input value={draft.problem} onChange={update('problem')} placeholder="例: 毎日の床掃除が面倒" />
        </label>
        <label>
          使うメリット・実感
          <textarea value={draft.benefit} onChange={update('benefit')} placeholder="例: 軽くて片手で扱え、気づいた時にすぐ掃除できます" />
        </label>
        <label>
          ハッシュタグ
          <input value={draft.hashtags} onChange={update('hashtags')} />
        </label>
      </div>
      <div className="demo-widget-preview">
        <p className="demo-text-label">生成された投稿文（リアルタイム）</p>
        <p className="demo-post">{generatedPost}</p>
        <div className="demo-widget-actions">
          <button type="button" className="demo-link-btn" onClick={copyAndOpenRoom}>コピーしてROOMを開く</button>
          <a className="demo-link-btn secondary" href={draft.productLink || undefined} target="_blank" rel="noreferrer sponsored">商品ページを見る ↗</a>
        </div>
        {message && <p className="demo-note" role="status">{message}</p>}
      </div>
    </div>
  )
}
