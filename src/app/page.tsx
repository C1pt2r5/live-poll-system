"use client"

import { useState, useEffect } from 'react'
import TeacherDashboard from '@/components/teacher/teacher-dashboard'
import PollCreationForm from '@/components/teacher/poll-creation-form'
import StudentInterface from '@/components/student/student-interface'
import LiveResultsChart from '@/components/shared/live-results-chart'
import ChatPanel from '@/components/shared/chat-panel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, GraduationCap, Play } from 'lucide-react'

interface PollOption {
  id: string
  text: string
  votes: number
  voters?: Array<{
    id: string
    name: string
    avatar?: string
  }>
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

interface Question {
  id: string
  title: string
  text: string
  type: "single" | "multiple"
  options: Array<{ id: string; text: string }>
  timer?: number
  settings: {
    allowMultipleSubmissions: boolean
    showResultsAfter: boolean
    autoAdvance: boolean
  }
}

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
  isTeacher: boolean
  avatar?: string
}

type UserType = 'guest' | 'teacher' | 'student'
type TeacherView = 'active-poll' | 'create-poll' | 'poll-history' | 'students' | 'chat'

export default function LivePollingApp() {
  const [userType, setUserType] = useState<UserType>('guest')
  const [userName, setUserName] = useState('')
  const [inputName, setInputName] = useState('')
  
  // Teacher state
  const [teacherView, setTeacherView] = useState<TeacherView>('active-poll')
  const [questions, setQuestions] = useState<Question[]>([])
  
  // Poll state
  const [activePoll, setActivePoll] = useState<Poll | undefined>()
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>()
  
  // Student state
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Dr. Smith',
      content: 'Welcome everyone! Let\'s start with our first poll.',
      timestamp: new Date(Date.now() - 300000),
      isTeacher: true
    },
    {
      id: '2',
      sender: 'Alice',
      content: 'Ready!',
      timestamp: new Date(Date.now() - 240000),
      isTeacher: false
    }
  ])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  
  // Connection state
  const [connectedStudents] = useState(12)
  const [isConnected] = useState(true)

  // Timer effect
  useEffect(() => {
    if (timeRemaining && timeRemaining > 0 && activePoll?.isActive) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev > 1) {
            return prev - 1
          } else {
            if (activePoll) {
              setActivePoll(prev => prev ? { ...prev, isActive: false } : undefined)
            }
            return 0
          }
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeRemaining, activePoll?.isActive])

  const handleLogin = (type: UserType) => {
    if (inputName.trim()) {
      setUserName(inputName.trim())
      setUserType(type)
      
      // Demo poll for immediate interaction
      if (type === 'teacher') {
        const demoPoll: Poll = {
          id: '1',
          title: 'Introduction Poll',
          question: 'What is your preferred learning style?',
          options: [
            { id: '1', text: 'Visual Learning', votes: 3 },
            { id: '2', text: 'Auditory Learning', votes: 5 },
            { id: '3', text: 'Kinesthetic Learning', votes: 2 },
            { id: '4', text: 'Reading/Writing', votes: 2 }
          ],
          totalVotes: 12,
          isActive: true,
          timeLimit: 60
        }
        setActivePoll(demoPoll)
        setTimeRemaining(45)
      }
    }
  }

  const handleStartPoll = () => {
    if (activePoll) {
      setActivePoll(prev => prev ? { ...prev, isActive: true } : undefined)
      setTimeRemaining(activePoll.timeLimit || 60)
    }
  }

  const handleStopPoll = () => {
    if (activePoll) {
      setActivePoll(prev => prev ? { ...prev, isActive: false } : undefined)
      setTimeRemaining(undefined)
    }
  }

  const handleNextQuestion = () => {
    // Demo: Create new poll
    const newPoll: Poll = {
      id: Date.now().toString(),
      title: 'Follow-up Question',
      question: 'How confident do you feel about today\'s topic?',
      options: [
        { id: '1', text: 'Very Confident', votes: 0 },
        { id: '2', text: 'Somewhat Confident', votes: 0 },
        { id: '3', text: 'Not Very Confident', votes: 0 },
        { id: '4', text: 'Need More Help', votes: 0 }
      ],
      totalVotes: 0,
      isActive: false,
      timeLimit: 45
    }
    setActivePoll(newPoll)
    setTimeRemaining(45)
    setHasSubmitted(false)
    setSelectedAnswer('')
  }

  const handleAnswerSelect = (optionId: string) => {
    if (!hasSubmitted && activePoll?.isActive) {
      setSelectedAnswer(optionId)
    }
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer && activePoll && !hasSubmitted) {
      // Update poll with new vote
      const updatedOptions = activePoll.options.map(option => 
        option.id === selectedAnswer 
          ? { 
              ...option, 
              votes: option.votes + 1,
              voters: [...(option.voters || []), { id: Date.now().toString(), name: userName }]
            }
          : option
      )
      
      setActivePoll({
        ...activePoll,
        options: updatedOptions,
        totalVotes: activePoll.totalVotes + 1
      })
      
      setHasSubmitted(true)
    }
  }

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: userName,
      content,
      timestamp: new Date(),
      isTeacher: userType === 'teacher'
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSaveQuestions = (savedQuestions: Question[]) => {
    setQuestions(savedQuestions)
  }

  const handlePublishPoll = (publishedQuestions: Question[]) => {
    if (publishedQuestions.length > 0) {
      const firstQuestion = publishedQuestions[0]
      const newPoll: Poll = {
        id: Date.now().toString(),
        title: firstQuestion.title,
        question: firstQuestion.text,
        options: firstQuestion.options.map(opt => ({ ...opt, votes: 0 })),
        totalVotes: 0,
        isActive: false,
        timeLimit: firstQuestion.timer
      }
      setActivePoll(newPoll)
      setTeacherView('active-poll')
    }
  }

  const handleKickStudent = (studentId: string) => {
    console.log('Kicking student:', studentId)
  }

  // Guest/Login screen
  if (userType === 'guest') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Live Polling System
            </CardTitle>
            <p className="text-muted-foreground">
              Enter your name to join or create a polling session
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputName.trim()) {
                    handleLogin('student')
                  }
                }}
              />
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => handleLogin('teacher')}
                disabled={!inputName.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Join as Teacher
              </Button>
              
              <Button
                onClick={() => handleLogin('student')}
                disabled={!inputName.trim()}
                variant="outline"
                className="w-full border-border text-foreground hover:bg-accent"
              >
                <Users className="h-4 w-4 mr-2" />
                Join as Student
              </Button>
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{connectedStudents} online</span>
                </div>
                <Badge variant="secondary">Demo Mode</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Teacher interface
  if (userType === 'teacher') {
    return (
      <div className="h-screen bg-background">
        {teacherView === 'create-poll' ? (
          <PollCreationForm
            onSave={handleSaveQuestions}
            onPublish={handlePublishPoll}
            initialQuestions={questions}
          />
        ) : (
          <TeacherDashboard
            teacherName={userName}
            currentView={teacherView}
            onViewChange={setTeacherView}
            connectedStudents={connectedStudents}
            activePoll={activePoll}
            onStartPoll={handleStartPoll}
            onStopPoll={handleStopPoll}
            onNextQuestion={handleNextQuestion}
            onKickStudent={handleKickStudent}
          />
        )}
        
        <ChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          isTeacher={true}
          messages={messages}
          onSendMessage={handleSendMessage}
          participantCount={connectedStudents}
          typingUsers={typingUsers}
          unreadCount={0}
        />
      </div>
    )
  }

  // Student interface
  return (
    <div className="min-h-screen bg-background">
      <StudentInterface
        studentName={userName}
        currentPoll={activePoll}
        hasSubmitted={hasSubmitted}
        selectedAnswer={selectedAnswer}
        isConnected={isConnected}
        participantCount={connectedStudents}
        onAnswerSelect={handleAnswerSelect}
        onSubmitAnswer={handleSubmitAnswer}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        timeRemaining={timeRemaining}
      />
      
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        isTeacher={false}
        messages={messages}
        onSendMessage={handleSendMessage}
        participantCount={connectedStudents}
        typingUsers={typingUsers}
        unreadCount={0}
      />
    </div>
  )
}