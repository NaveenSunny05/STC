import { useState, useEffect, useRef } from 'react'
import { Send, X, MessageSquare } from 'lucide-react'
import api from '../services/api'
import socket from '../services/socket'

export default function CommitteeChat({ user, onClose, isFullPage = false }) {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const messagesEndRef = useRef(null)

    // Use a fixed channel ID for the "Common Committee Chat"
    // In a real app, this might be fetched from DB or config
    const COMMITTEE_CHANNEL_ID = 'committee-general'

    useEffect(() => {
        fetchMessages()

        // Connect socket
        if (!socket.connected) {
            socket.auth = { token: localStorage.getItem('token') }
            socket.connect()
        }

        socket.emit('join_channel', COMMITTEE_CHANNEL_ID)

        // Listen for new messages
        socket.on('new_channel_message', (message) => {
            // Only append if it's for this channel
            // (The backend emit should ideally include channel_id, or we trust the event)
            setMessages(prev => [...prev, message])
            scrollToBottom()
        })

        return () => {
            socket.off('new_channel_message')
            socket.emit('leave_channel', COMMITTEE_CHANNEL_ID)
        }
    }, [])

    const fetchMessages = async () => {
        try {
            // Ensure the channel exists first (idempotent check)
            // For now, we assume it exists or the backend handles it.
            // Or we can just fetch messages filtering by this ID if we used a different DB structure.
            // BE: router.get('/channel/:id')

            const { data } = await api.get(`/messages/channel/${COMMITTEE_CHANNEL_ID}`)
            setMessages(data || [])
            setLoading(false)
            scrollToBottom()
        } catch (error) {
            console.error('Failed to fetch messages:', error)
            setLoading(false)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        try {
            await api.post('/messages', {
                channel_id: COMMITTEE_CHANNEL_ID,
                content: newMessage
            })
            setNewMessage('')
        } catch (error) {
            console.error('Failed to send message:', error)
            alert('Failed to send message')
        }
    }

    return (
        <div className={`${isFullPage
            ? 'w-full h-[calc(100vh-64px)] bg-gray-900 flex flex-col'
            : 'fixed bottom-24 right-6 w-96 h-[500px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col z-50'
            }`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-white">Committee Chat</h3>
                </div>
                {!isFullPage && (
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="text-center text-gray-500">Loading chat...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <p>Welcome to Committee Chat!</p>
                        <p className="text-sm">Start the conversation...</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={msg.id || idx}
                            className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${msg.sender_id === user.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-200'
                                    }`}
                            >
                                {msg.sender_id !== user.id && (
                                    <p className="text-xs text-blue-300 font-bold mb-1">
                                        {msg.sender_name}
                                    </p>
                                )}
                                <p className="text-sm">{msg.content}</p>
                                <div className="text-[10px] opacity-70 mt-1 text-right">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-gray-800 rounded-b-xl">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg text-white transition disabled:opacity-50"
                        disabled={!newMessage.trim()}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    )
}
