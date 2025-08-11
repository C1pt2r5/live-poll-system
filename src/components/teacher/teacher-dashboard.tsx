"use client"

import { useState } from 'react'
import { 
  BarChart3, 
  Plus, 
  History, 
  Users, 
  MessageCircle, 
  Play, 
  Square, 
  SkipForward,
  UserMinus,
  Timer,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'motion/react'

interface TeacherDashboardProps {
  teacherName: string
  currentView: 'active-poll' | 'create-poll' | 'poll-history' | 'students' | 'chat'
  onViewChange: (view: 'active-poll' | 'create-poll' | 'poll-history' | 'students' | 'chat') => void
  connectedStudents: number
  activePoll?: {
    id: string
    question: string
    options: Array<{ id: string; text: string; votes: number }>
    totalVotes: number
    timeRemaining?: number
    isActive: boolean
  }
  onStartPoll?: () => void
  onStopPoll?: () => void
  onNextQuestion?: () => void
  onKickStudent?: (studentId: string) => void
}

const sidebarItems = [
  { id: 'active-poll', label: 'Active Poll', icon: BarChart3 },
  { id: 'create-poll', label: 'Create Poll', icon: Plus },
  { id: 'poll-history', label: 'Poll History', icon: History },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
]

export default function TeacherDashboard({
  teacherName,
  currentView,
  onViewChange,
  connectedStudents,
  activePoll,
  onStartPoll,
  onStopPoll,
  onNextQuestion,
  onKickStudent
}: TeacherDashboardProps) {
  const [students] = useState([
    { id: '1', name: 'Alice Johnson', avatar: '', joined: '2:35 PM', status: 'active' },
    { id: '2', name: 'Bob Smith', avatar: '', joined: '2:33 PM', status: 'active' },
    { id: '3', name: 'Carol Davis', avatar: '', joined: '2:30 PM', status: 'idle' },
    { id: '4', name: 'David Wilson', avatar: '', joined: '2:28 PM', status: 'active' },
  ])

  const renderActivePoll = () => {
    if (!activePoll) {
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-card border border-border rounded-lg">
          <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">No Active Poll</h3>
          <p className="text-muted-foreground text-center mb-6">
            Create a new poll to start engaging with your students
          </p>
          <Button 
            onClick={() => onViewChange('create-poll')}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Poll
          </Button>
        </div>
      )
    }

    const maxVotes = Math.max(...activePoll.options.map(option => option.votes), 1)

    return (
      <div className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">{activePoll.question}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={activePoll.isActive ? "default" : "secondary"}>
                  {activePoll.isActive ? 'Live' : 'Stopped'}
                </Badge>
                {activePoll.timeRemaining && (
                  <Badge variant="outline" className="border-warning text-warning">
                    <Timer className="h-3 w-3 mr-1" />
                    {Math.floor(activePoll.timeRemaining / 60)}:{(activePoll.timeRemaining % 60).toString().padStart(2, '0')}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {activePoll.totalVotes} responses
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {connectedStudents} connected
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePoll.options.map((option, index) => {
              const percentage = activePoll.totalVotes > 0 ? (option.votes / activePoll.totalVotes) * 100 : 0
              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{option.text}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{option.votes} votes</span>
                      <span className="text-sm font-medium text-foreground">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-3"
                  />
                </motion.div>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex items-center space-x-3">
          {activePoll.isActive ? (
            <Button 
              onClick={onStopPoll}
              variant="destructive"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Poll
            </Button>
          ) : (
            <Button 
              onClick={onStartPoll}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Poll
            </Button>
          )}
          <Button 
            onClick={onNextQuestion}
            variant="outline"
            className="border-border text-foreground hover:bg-accent"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Next Question
          </Button>
        </div>
      </div>
    )
  }

  const renderStudents = () => (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Connected Students ({connectedStudents})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{student.name}</p>
                  <p className="text-xs text-muted-foreground">Joined {student.joined}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                  {student.status}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onKickStudent?.(student.id)}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <UserMinus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderContent = () => {
    switch (currentView) {
      case 'active-poll':
        return renderActivePoll()
      case 'students':
        return renderStudents()
      case 'create-poll':
        return (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Create New Poll</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Poll creation form will be implemented here.</p>
            </CardContent>
          </Card>
        )
      case 'poll-history':
        return (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Poll History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Historical polls will be displayed here.</p>
            </CardContent>
          </Card>
        )
      case 'chat':
        return (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Chat interface will be implemented here.</p>
            </CardContent>
          </Card>
        )
      default:
        return renderActivePoll()
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h2 className="font-semibold text-sidebar-foreground">Teacher Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">{teacherName}</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onViewChange(item.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-sidebar-accent/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-sidebar-foreground">Connected Students</span>
              <Badge variant="secondary">{connectedStudents}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-sidebar-foreground">Poll Status</span>
              <Badge variant={activePoll?.isActive ? "default" : "secondary"}>
                {activePoll?.isActive ? 'Live' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {sidebarItems.find(item => item.id === currentView)?.label || 'Dashboard'}
              </h1>
              <p className="text-muted-foreground">Welcome back, {teacherName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{connectedStudents} Students</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <Badge variant={activePoll?.isActive ? "default" : "secondary"}>
                {activePoll?.isActive ? 'Poll Active' : 'No Active Poll'}
              </Badge>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}