"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Send, Users, Smile, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
  isTeacher: boolean
  avatar?: string
}

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
  isTeacher?: boolean
  messages: Message[]
  onSendMessage: (content: string) => void
  participantCount: number
  typingUsers: string[]
  unreadCount: number
}

export default function ChatPanel({
  isOpen,
  onClose,
  isTeacher = false,
  messages,
  onSendMessage,
  participantCount,
  typingUsers,
  unreadCount
}: ChatPanelProps) {
  const [messageInput, setMessageInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const maxCharacters = 280

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageInput.trim() && messageInput.length <= maxCharacters) {
      onSendMessage(messageInput.trim())
      setMessageInput('')
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const emojis = ['😊', '👍', '❤️', '😂', '🎉', '👏', '🤔', '😮']

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
          
          {/* Chat Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col md:max-w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    Live Chat
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {participantCount} online
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.isTeacher ? 'flex-row' : 'flex-row'
                    }`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(message.sender)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${
                          message.isTeacher ? 'text-primary' : 'text-foreground'
                        }`}>
                          {message.sender}
                          {message.isTeacher && (
                            <span className="ml-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                              Teacher
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      
                      <div className={`inline-block p-3 rounded-lg text-sm ${
                        message.isTeacher
                          ? 'bg-accent/50 text-accent-foreground border border-accent'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicators */}
                {typingUsers.length > 0 && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 flex items-center justify-center">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 h-1 bg-muted-foreground/60 rounded-full"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-muted-foreground italic">
                        {typingUsers.length === 1
                          ? `${typingUsers[0]} is typing...`
                          : typingUsers.length === 2
                          ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                          : `${typingUsers.length} people are typing...`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Emoji Picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="px-4 py-2 border-t border-border bg-muted/30"
                >
                  <div className="flex gap-2 flex-wrap">
                    {emojis.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-accent"
                        onClick={() => {
                          setMessageInput(prev => prev + emoji)
                          setShowEmojiPicker(false)
                          inputRef.current?.focus()
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 flex-shrink-0"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      maxLength={maxCharacters}
                      className="pr-20 h-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {messageInput.length}/{maxCharacters}
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!messageInput.trim() || messageInput.length > maxCharacters}
                    className="h-10 px-4 flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {messageInput.length > maxCharacters - 20 && (
                  <div className={`text-xs text-right ${
                    messageInput.length > maxCharacters
                      ? 'text-destructive'
                      : messageInput.length > maxCharacters - 10
                      ? 'text-warning'
                      : 'text-muted-foreground'
                  }`}>
                    {maxCharacters - messageInput.length} characters remaining
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}