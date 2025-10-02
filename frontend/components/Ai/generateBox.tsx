'use client'

import { useState } from 'react'

export default function GenerateBox() {
    const [content, setContent] = useState('')
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
    }
  return <div>
    <textarea value={content} onChange={(e) => setContent(e.target.value)} />
    <button onClick={handleSubmit}>Generate</button>
  </div>;
}