import { useState } from 'react'
import './Gate.css'

const UNLOCK_KEY = 'kiwami.unlocked'
const ACCESS_PIN = 'KIWAMI2026'

export default function Gate({ children }) {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(UNLOCK_KEY) === '1')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  if (unlocked) return children

  const handleSubmit = (event) => {
    event.preventDefault()
    if (pin.trim() === ACCESS_PIN) {
      localStorage.setItem(UNLOCK_KEY, '1')
      setUnlocked(true)
    } else {
      setError('合言葉が違います。購入時にお伝えした合言葉をご確認ください。')
    }
  }

  return (
    <div className="gate-screen">
      <form className="gate-form" onSubmit={handleSubmit}>
        <p className="gate-eyebrow">極 / 楽天ROOMクリック改善ツール</p>
        <h1>合言葉を入力してください</h1>
        <p className="gate-lead">購入者専用ツールです。購入時にお伝えした合言葉を入力すると、この端末では次回から自動的に開きます。</p>
        <input
          type="password"
          value={pin}
          onChange={(event) => { setPin(event.target.value); setError('') }}
          placeholder="合言葉"
          autoFocus
        />
        <button type="submit">開く</button>
        {error && <p className="gate-error" role="alert">{error}</p>}
      </form>
    </div>
  )
}
