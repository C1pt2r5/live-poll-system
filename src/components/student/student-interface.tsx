"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'motion/react'
import { MessageCircle, Clock, Users, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react'

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  title: string
  question: string
  options: PollOption[]
  timeLimit?: number
  totalVotes: number
  isActive: boolean
}

interface StudentInterfaceProps {
  studentName: string
  currentPoll?: Poll
  hasSubmitted?: boolean
  selectedAnswer?: string
  isConnected?: boolean
  participantCount?: number
  onAnswerSelect?: (optionId: string) => void
  onSubmitAnswer?: () => void
  onToggleChat?: () => void
  isChatOpen?: boolean
  timeRemaining?: number
}

export default function StudentInterface({
  studentName = "Student",
  currentPoll,
  hasSubmitted = false,
  selectedAnswer,
  isConnected = true,
  participantCount = 0,
  onAnswerSelect,
  onSubmitAnswer,
  onToggleChat,
  isChatOpen = false,
  timeRemaining
}: StudentInterfaceProps) {
  const [localTimeRemaining, setLocalTimeRemaining] = useState(timeRemaining)

  useEffect(() => {
    setLocalTimeRemaining(timeRemaining)
  }, [timeRemaining])

  useEffect(() => {
    if (localTimeRemaining && localTimeRemaining > 0 && !hasSubmitted) {
      const timer = setInterval(() => {
        setLocalTimeRemaining(prev => {
          if (prev && prev > 0) {
            return prev - 1
          }
          return 0
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [localTimeRemaining, hasSubmitted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = (seconds: number) => {
    if (seconds > 30) return 'text-muted-foreground'
    if (seconds > 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const calculatePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{studentName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-lg text-foreground">{studentName}</h1>
              {currentPoll && (
                <p className="text-sm text-muted-foreground">{currentPoll.title}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Participant Count */}
            {participantCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{participantCount}</span>
              </div>
            )}

            {/* Timer */}
            {localTimeRemaining !== undefined && localTimeRemaining > 0 && !hasSubmitted && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className={`text-sm font-mono font-medium ${getTimeColor(localTimeRemaining)}`}>
                  {formatTime(localTimeRemaining)}
                </span>
              </div>
            )}

            {/* Connection Status */}
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {currentPoll ? (
              <motion.div
                key="poll-active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Question */}
                <Card className="bg-card">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-semibold text-foreground mb-2">
                      {currentPoll.question}
                    </h2>
                    {!hasSubmitted && (
                      <p className="text-muted-foreground">
                        Select your answer below
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Answer Options or Results */}
                {!hasSubmitted ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {currentPoll.options.map((option, index) => (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Button
                          variant={selectedAnswer === option.id ? "default" : "outline"}
                          className={`w-full h-auto p-6 text-left justify-start text-lg hover:scale-[1.02] transition-all duration-200 ${
                            selectedAnswer === option.id 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : 'bg-card hover:bg-accent'
                          }`}
                          onClick={() => onAnswerSelect?.(option.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedAnswer === option.id 
                                ? 'border-primary-foreground bg-primary-foreground text-primary' 
                                : 'border-muted-foreground'
                            }`}>
                              <span className="text-sm font-medium">
                                {String.fromCharCode(65 + index)}
                              </span>
                            </div>
                            <span>{option.text}</span>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Answer submitted successfully!</span>
                    </div>

                    {/* Live Results */}
                    <Card className="bg-card">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-foreground">Live Results</h3>
                        <div className="space-y-4">
                          {currentPoll.options.map((option, index) => {
                            const percentage = calculatePercentage(option.votes, currentPoll.totalVotes)
                            const isSelected = selectedAnswer === option.id
                            
                            return (
                              <motion.div
                                key={option.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className={`p-4 rounded-lg border ${
                                  isSelected ? 'border-primary bg-primary/10' : 'border-border bg-muted/30'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">
                                      {String.fromCharCode(65 + index)}. {option.text}
                                    </span>
                                    {isSelected && (
                                      <Badge variant="default" className="text-xs">Your answer</Badge>
                                    )}
                                  </div>
                                  <span className="text-sm font-medium text-foreground">
                                    {percentage}% ({option.votes})
                                  </span>
                                </div>
                                <Progress 
                                  value={percentage} 
                                  className="h-2"
                                />
                              </motion.div>
                            )
                          })}
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground text-center">
                          Total responses: {currentPoll.totalVotes}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Submit Button */}
                {!hasSubmitted && selectedAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <Button 
                      size="lg" 
                      onClick={onSubmitAnswer}
                      className="px-8 py-3 text-lg hover:scale-105 transition-transform"
                    >
                      Submit Answer
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="poll-waiting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center min-h-[60vh]"
              >
                <Card className="bg-card max-w-md w-full">
                  <CardContent className="p-8 text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h2 className="text-xl font-semibold text-foreground mb-2">
                        Waiting for poll to start
                      </h2>
                      <p className="text-muted-foreground">
                        Your teacher will start a poll soon. Stay connected and be ready to participate!
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-muted-foreground">
                        {isConnected ? 'Connected and ready' : 'Connection lost'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Chat Toggle Button */}
      <Button
        variant="default"
        size="icon"
        className={`fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:scale-110 transition-transform z-50 ${
          isChatOpen ? 'bg-muted-foreground' : 'bg-primary'
        }`}
        onClick={onToggleChat}
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    </div>
  )
}