import { useState, type FormEvent } from 'react'

interface TextToolPanelProps {
  onConfirm: (text: string) => void
  onCancel: () => void
}

export function TextToolPanel({ onConfirm, onCancel }: TextToolPanelProps) {
  const [text, setText] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (trimmed) onConfirm(trimmed)
    else onCancel()
  }

  return (
    <form className="canvas-area__hint canvas-area__hint--form" onSubmit={handleSubmit}>
      <label>
        Text
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
      </label>
      <div className="canvas-area__hint-actions">
        <button type="submit">Add</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
