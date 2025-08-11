"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus, Eye, Clock, Users, Settings, CheckSquare, Circle, Save, Play, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

interface Option {
  id: string
  text: string
}

interface Question {
  id: string
  title: string
  text: string
  type: "single" | "multiple"
  options: Option[]
  timer?: number
  settings: {
    allowMultipleSubmissions: boolean
    showResultsAfter: boolean
    autoAdvance: boolean
  }
}

interface PollCreationFormProps {
  onSave?: (questions: Question[]) => void
  onPreview?: (questions: Question[]) => void
  onPublish?: (questions: Question[]) => void
  initialQuestions?: Question[]
}

export default function PollCreationForm({
  onSave,
  onPreview,
  onPublish,
  initialQuestions = []
}: PollCreationFormProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form")

  const currentQuestion = questions[currentQuestionIndex] || {
    id: '',
    title: '',
    text: '',
    type: 'single' as const,
    options: [{ id: '1', text: '' }, { id: '2', text: '' }],
    timer: undefined,
    settings: {
      allowMultipleSubmissions: false,
      showResultsAfter: true,
      autoAdvance: false
    }
  }

  const addNewQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      title: '',
      text: '',
      type: 'single',
      options: [
        { id: '1', text: '' },
        { id: '2', text: '' }
      ],
      settings: {
        allowMultipleSubmissions: false,
        showResultsAfter: true,
        autoAdvance: false
      }
    }
    setQuestions([...questions, newQuestion])
    setCurrentQuestionIndex(questions.length)
  }

  const updateCurrentQuestion = (updates: Partial<Question>) => {
    const updatedQuestions = [...questions]
    if (updatedQuestions[currentQuestionIndex]) {
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        ...updates
      }
    } else {
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        ...updates,
        id: Date.now().toString()
      }
    }
    setQuestions(updatedQuestions)
  }

  const addOption = () => {
    const newOptions = [
      ...currentQuestion.options,
      { id: Date.now().toString(), text: '' }
    ]
    updateCurrentQuestion({ options: newOptions })
  }

  const removeOption = (optionId: string) => {
    if (currentQuestion.options.length <= 2) return
    const newOptions = currentQuestion.options.filter(opt => opt.id !== optionId)
    updateCurrentQuestion({ options: newOptions })
  }

  const updateOption = (optionId: string, text: string) => {
    const newOptions = currentQuestion.options.map(opt =>
      opt.id === optionId ? { ...opt, text } : opt
    )
    updateCurrentQuestion({ options: newOptions })
  }

  const deleteQuestion = (questionId: string) => {
    const newQuestions = questions.filter(q => q.id !== questionId)
    setQuestions(newQuestions)
    if (currentQuestionIndex >= newQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, newQuestions.length - 1))
    }
  }

  const isValid = currentQuestion.title.trim() && 
    currentQuestion.text.trim() && 
    currentQuestion.options.every(opt => opt.text.trim())

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Create New Poll</h1>
          <p className="text-muted-foreground">Design engaging polls for your students with real-time interaction</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question List Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Questions</CardTitle>
                  <Button
                    onClick={addNewQuestion}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <AnimatePresence>
                  {questions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        index === currentQuestionIndex
                          ? 'bg-accent border-primary'
                          : 'bg-background hover:bg-muted border-border'
                      }`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {question.title || `Question ${index + 1}`}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {question.text || 'No question text'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {question.type === 'single' ? 'Single Choice' : 'Multiple Choice'}
                            </Badge>
                            {question.timer && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {question.timer}s
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteQuestion(question.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {questions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Circle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No questions yet</p>
                    <p className="text-xs">Click "Add" to create your first question</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {questions.length > 0 && (
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "form" | "preview")}>
                <div className="flex items-center justify-between mb-6">
                  <TabsList className="bg-muted">
                    <TabsTrigger value="form" className="data-[state=active]:bg-background">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="data-[state=active]:bg-background">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => onSave?.(questions)}
                      disabled={!isValid}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button
                      onClick={() => onPublish?.(questions)}
                      disabled={!isValid}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Publish Poll
                    </Button>
                  </div>
                </div>

                <TabsContent value="form" className="space-y-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">
                        Question {currentQuestionIndex + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title" className="text-sm font-medium">Question Title</Label>
                          <Input
                            id="title"
                            placeholder="Enter a descriptive title..."
                            value={currentQuestion.title}
                            onChange={(e) => updateCurrentQuestion({ title: e.target.value })}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="question" className="text-sm font-medium">Question Text</Label>
                          <Textarea
                            id="question"
                            placeholder="What would you like to ask your students?"
                            value={currentQuestion.text}
                            onChange={(e) => updateCurrentQuestion({ text: e.target.value })}
                            className="mt-1 min-h-[100px]"
                          />
                        </div>
                      </div>

                      {/* Poll Type */}
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Answer Type</Label>
                        <RadioGroup
                          value={currentQuestion.type}
                          onValueChange={(value: "single" | "multiple") => 
                            updateCurrentQuestion({ type: value })
                          }
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="single" id="single" />
                            <Label htmlFor="single" className="text-sm">Single Choice</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="multiple" id="multiple" />
                            <Label htmlFor="multiple" className="text-sm">Multiple Choice</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Answer Options */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-medium">Answer Options</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addOption}
                            disabled={currentQuestion.options.length >= 6}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Option
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {currentQuestion.options.map((option, index) => (
                            <div key={option.id} className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium">
                                {String.fromCharCode(65 + index)}
                              </div>
                              <Input
                                placeholder={`Option ${index + 1}`}
                                value={option.text}
                                onChange={(e) => updateOption(option.id, e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(option.id)}
                                disabled={currentQuestion.options.length <= 2}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timer Configuration */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Timer (Optional)</Label>
                          <Switch
                            checked={!!currentQuestion.timer}
                            onCheckedChange={(checked) =>
                              updateCurrentQuestion({ timer: checked ? 30 : undefined })
                            }
                          />
                        </div>
                        {currentQuestion.timer && (
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              min="10"
                              max="300"
                              value={currentQuestion.timer}
                              onChange={(e) =>
                                updateCurrentQuestion({ timer: parseInt(e.target.value) || 30 })
                              }
                              className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">seconds</span>
                          </div>
                        )}
                      </div>

                      {/* Settings */}
                      <div className="space-y-4 pt-4 border-t border-border">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Poll Settings
                        </h4>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Allow Multiple Submissions</Label>
                              <p className="text-xs text-muted-foreground">Students can change their answers</p>
                            </div>
                            <Switch
                              checked={currentQuestion.settings.allowMultipleSubmissions}
                              onCheckedChange={(checked) =>
                                updateCurrentQuestion({
                                  settings: { ...currentQuestion.settings, allowMultipleSubmissions: checked }
                                })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Show Results After Submission</Label>
                              <p className="text-xs text-muted-foreground">Display results immediately after voting</p>
                            </div>
                            <Switch
                              checked={currentQuestion.settings.showResultsAfter}
                              onCheckedChange={(checked) =>
                                updateCurrentQuestion({
                                  settings: { ...currentQuestion.settings, showResultsAfter: checked }
                                })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Auto-advance to Next Question</Label>
                              <p className="text-xs text-muted-foreground">Automatically move to next question after timer expires</p>
                            </div>
                            <Switch
                              checked={currentQuestion.settings.autoAdvance}
                              onCheckedChange={(checked) =>
                                updateCurrentQuestion({
                                  settings: { ...currentQuestion.settings, autoAdvance: checked }
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preview">
                  <Card className="bg-card border-border">
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-sm text-muted-foreground">LIVE POLL</span>
                      </div>
                      <CardTitle className="text-2xl font-bold">
                        {currentQuestion.title || 'Untitled Question'}
                      </CardTitle>
                      {currentQuestion.timer && (
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{currentQuestion.timer} seconds remaining</span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <p className="text-lg text-foreground">
                          {currentQuestion.text || 'No question text provided'}
                        </p>
                      </div>

                      <div className="space-y-3 max-w-md mx-auto">
                        {currentQuestion.options.map((option, index) => (
                          <motion.div
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 rounded-lg border border-border hover:border-primary cursor-pointer transition-colors bg-background"
                          >
                            <div className="flex items-center gap-3">
                              {currentQuestion.type === 'single' ? (
                                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                                  <div className="w-3 h-3 rounded-full bg-primary opacity-0"></div>
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded border-2 border-primary flex items-center justify-center">
                                  <CheckSquare className="h-3 w-3 text-primary opacity-0" />
                                </div>
                              )}
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium mr-2">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="text-foreground">
                                {option.text || `Option ${index + 1}`}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="text-center text-sm text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>0 responses so far</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {questions.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="text-center py-16">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Create Your First Question</h3>
                  <p className="text-muted-foreground mb-6">
                    Start building your poll by adding your first question
                  </p>
                  <Button onClick={addNewQuestion} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}