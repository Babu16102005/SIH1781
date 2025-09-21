import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Chat.css'

const Chat = () => {
  const { isAuthenticated, token } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const streamRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login')
      return
    }
  }, [isAuthenticated, token, navigate])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input }
    setMessages((m) => [...m, userMsg, { role: 'assistant', content: '' }])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMsg.content }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.')
        }
        throw new Error(`Failed to start stream: ${response.status} ${response.statusText}`)
      }
      
      if (!response.body) {
        throw new Error('No response body received')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      streamRef.current = reader

      let aiText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        aiText += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].role === 'assistant') {
              updated[i] = { ...updated[i], content: aiText }
              break
            }
          }
          return updated
        })
      }
    } catch (error) {
      console.error('Error during streaming:', error)
      setMessages((m) => {
        const updated = [...m]
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === 'assistant') {
            updated[i] = { ...updated[i], content: '[Error receiving stream]' }
            break
          }
        }
        return updated
      })
    } finally {
      setLoading(false)
      streamRef.current = null
    }
  }

  if (!isAuthenticated || !token) {
    return (
      <div className="chat">
        <div className="chat-window">
          <div className="msg assistant">
            <div className="bubble">Please log in to access the chat feature.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat">
      <div className="chat-header">
        <h2>AI Career Assistant</h2>
        <p>Ask me anything about careers, skills, or job opportunities!</p>
      </div>
      <div className="chat-window">
        {messages.length === 0 && (
          <div className="msg assistant">
            <div className="bubble">Hello! I'm your AI career assistant. How can I help you today?</div>
          </div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`msg ${m.role}`}>
            <div className="bubble">{m.content}</div>
          </div>
        ))}
      </div>
      <form className="chat-input" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Ask anything about careers..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? 'Generating...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default Chat
