// File: src/components/course/session-builder.tsx - FIXED IMPORT STATEMENTS

'use client'

import { useState, useEffect } from 'react'

// ✅ FIXED: Menggunakan barrel imports dari index.ts
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  Badge,
  Alert,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Switch,
  ScrollArea,
  Separator
} from '@/components/ui'

import { 
  Plus, 
  Trash2, 
  Edit, 
  Move, 
  Video, 
  FileQuestion, 
  FileText, 
  Users, 
  Volume2,
  GripVertical,
  Eye,
  Lock,
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  Settings
} from 'lucide-react'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

// ... rest of the file remains exactly the same ...

interface SessionContent {
  id: string
  type: 'VIDEO' | 'QUIZ' | 'EXERCISE' | 'LIVE_SESSION' | 'DOCUMENT' | 'AUDIO'
  title: string
  description?: string
  youtubeUrl?: string
  zoomLink?: string
  quizData?: QuizData
  exerciseContent?: string
  materialUrl?: string
  order: number
  duration?: number
  isFree: boolean
}

interface QuizData {
  questions: QuizQuestion[]
  timeLimit?: number
  passingScore?: number
}

interface QuizQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  options?: string[]
  correctAnswer?: string | number
  explanation?: string
}

interface Session {
  id: string
  title: string
  description?: string
  order: number
  isFree: boolean
  duration?: number
  contents: SessionContent[]
}

interface SessionBuilderProps {
  sessions: Session[]
  onSessionsChange: (sessions: Session[]) => void
  freeContentLimit: number
}

const CONTENT_TYPES = [
  { value: 'VIDEO', label: 'Video', icon: Video, description: 'YouTube embedded video' },
  { value: 'QUIZ', label: 'Quiz', icon: FileQuestion, description: 'Interactive quiz' },
  { value: 'EXERCISE', label: 'Exercise', icon: FileText, description: 'Reading/writing exercise' },
  { value: 'LIVE_SESSION', label: 'Live Session', icon: Users, description: 'Zoom meeting' },
  { value: 'DOCUMENT', label: 'Document', icon: FileText, description: 'PDF or text materials' },
  { value: 'AUDIO', label: 'Audio', icon: Volume2, description: 'Audio recordings' }
]

const CONTENT_ICONS = {
  VIDEO: Video,
  QUIZ: FileQuestion,
  EXERCISE: FileText,
  LIVE_SESSION: Users,
  DOCUMENT: FileText,
  AUDIO: Volume2
}

export default function SessionBuilder({ sessions, onSessionsChange, freeContentLimit }: SessionBuilderProps) {
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [editingContent, setEditingContent] = useState<SessionContent | null>(null)
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [showContentDialog, setShowContentDialog] = useState(false)
  const [newSessionTitle, setNewSessionTitle] = useState('')
  const [newSessionDescription, setNewSessionDescription] = useState('')
  const [newSessionIsFree, setNewSessionIsFree] = useState(false)

  // Content form states
  const [contentForm, setContentForm] = useState<Partial<SessionContent>>({
    title: '',
    description: '',
    type: 'VIDEO',
    isFree: false,
    duration: 10
  })

  // Quiz form states
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Partial<QuizQuestion>>({
    question: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: 0
  })

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const handleAddSession = () => {
    if (!newSessionTitle.trim()) return

    const newSession: Session = {
      id: generateId(),
      title: newSessionTitle,
      description: newSessionDescription,
      order: sessions.length + 1,
      isFree: newSessionIsFree,
      contents: []
    }

    onSessionsChange([...sessions, newSession])
    setNewSessionTitle('')
    setNewSessionDescription('')
    setNewSessionIsFree(false)
    setShowSessionDialog(false)
  }

  const handleEditSession = (session: Session) => {
    setEditingSession(session)
    setNewSessionTitle(session.title)
    setNewSessionDescription(session.description || '')
    setNewSessionIsFree(session.isFree)
    setShowSessionDialog(true)
  }

  const handleUpdateSession = () => {
    if (!editingSession || !newSessionTitle.trim()) return

    const updatedSessions = sessions.map(session =>
      session.id === editingSession.id
        ? {
            ...session,
            title: newSessionTitle,
            description: newSessionDescription,
            isFree: newSessionIsFree
          }
        : session
    )

    onSessionsChange(updatedSessions)
    setEditingSession(null)
    setNewSessionTitle('')
    setNewSessionDescription('')
    setNewSessionIsFree(false)
    setShowSessionDialog(false)
  }

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      onSessionsChange(sessions.filter(session => session.id !== sessionId))
    }
  }

  const handleAddContent = (sessionId: string) => {
    setEditingContent(null)
    setContentForm({
      title: '',
      description: '',
      type: 'VIDEO',
      isFree: false,
      duration: 10
    })
    setQuizQuestions([])
    setCurrentQuestion({
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: 0
    })
    setShowContentDialog(true)
    setEditingSession(sessions.find(s => s.id === sessionId) || null)
  }

  const handleEditContent = (sessionId: string, content: SessionContent) => {
    setEditingContent(content)
    setContentForm(content)
    if (content.type === 'QUIZ' && content.quizData) {
      setQuizQuestions(content.quizData.questions)
    }
    setShowContentDialog(true)
    setEditingSession(sessions.find(s => s.id === sessionId) || null)
  }

  const handleSaveContent = () => {
    if (!editingSession || !contentForm.title?.trim()) return

    let newContent: SessionContent = {
      id: editingContent?.id || generateId(),
      type: contentForm.type as SessionContent['type'],
      title: contentForm.title,
      description: contentForm.description,
      order: editingContent?.order || (editingSession.contents.length + 1),
      duration: contentForm.duration,
      isFree: contentForm.isFree || false,
      youtubeUrl: contentForm.youtubeUrl,
      zoomLink: contentForm.zoomLink,
      exerciseContent: contentForm.exerciseContent,
      materialUrl: contentForm.materialUrl
    }

    // Add quiz data if it's a quiz
    if (contentForm.type === 'QUIZ' && quizQuestions.length > 0) {
      newContent.quizData = {
        questions: quizQuestions,
        timeLimit: 30,
        passingScore: 70
      }
    }

    const updatedSessions = sessions.map(session => {
      if (session.id === editingSession.id) {
        const updatedContents = editingContent
          ? session.contents.map(content =>
              content.id === editingContent.id ? newContent : content
            )
          : [...session.contents, newContent]

        return {
          ...session,
          contents: updatedContents,
          duration: updatedContents.reduce((total, content) => total + (content.duration || 0), 0)
        }
      }
      return session
    })

    onSessionsChange(updatedSessions)
    setShowContentDialog(false)
    setEditingContent(null)
  }

  const handleDeleteContent = (sessionId: string, contentId: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      const updatedSessions = sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            contents: session.contents.filter(content => content.id !== contentId)
          }
        }
        return session
      })
      onSessionsChange(updatedSessions)
    }
  }

  const handleAddQuizQuestion = () => {
    if (!currentQuestion.question?.trim()) return

    const newQuestion: QuizQuestion = {
      id: generateId(),
      question: currentQuestion.question,
      type: currentQuestion.type || 'multiple_choice',
      options: currentQuestion.options,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation
    }

    setQuizQuestions([...quizQuestions, newQuestion])
    setCurrentQuestion({
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: 0
    })
  }

  const handleSessionsReorder = (result: any) => {
    if (!result.destination) return

    const items = Array.from(sessions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order numbers
    const reorderedSessions = items.map((session, index) => ({
      ...session,
      order: index + 1
    }))

    onSessionsChange(reorderedSessions)
  }

  const getTotalDuration = () => {
    return sessions.reduce((total, session) => 
      total + (session.duration || session.contents.reduce((sessionTotal, content) => 
        sessionTotal + (content.duration || 0), 0
      )), 0
    )
  }

  const getFreeContentCount = () => {
    return sessions.reduce((total, session) => 
      total + session.contents.filter(content => content.isFree).length, 0
    )
  }

  const getContentTypeCount = (type: string) => {
    return sessions.reduce((total, session) => 
      total + session.contents.filter(content => content.type === type).length, 0
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
            <div className="text-sm text-gray-600">Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{getContentTypeCount('VIDEO')}</div>
            <div className="text-sm text-gray-600">Videos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{getContentTypeCount('QUIZ')}</div>
            <div className="text-sm text-gray-600">Quizzes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{getFreeContentCount()}</div>
            <div className="text-sm text-gray-600">Free Content</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{Math.round(getTotalDuration())}m</div>
            <div className="text-sm text-gray-600">Total Duration</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Session Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Course Sessions</h3>
              <p className="text-sm text-gray-600">
                Create and organize your course sessions. Drag to reorder.
              </p>
            </div>
            <Button onClick={() => setShowSessionDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No sessions yet</h3>
            <p className="text-gray-500 mb-4">Start building your course by adding your first session</p>
            <Button onClick={() => setShowSessionDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleSessionsReorder}>
          <Droppable droppableId="sessions">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {sessions.map((session, index) => (
                  <Draggable key={session.id} draggableId={session.id} index={index}>
                    {(provided, snapshot) => (
                      <Card 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? 'shadow-lg' : ''}`}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="text-lg font-semibold">
                                    Session {session.order}: {session.title}
                                  </h3>
                                  {session.isFree && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      Free Preview
                                    </Badge>
                                  )}
                                </div>
                                {session.description && (
                                  <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                                )}
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                                  <span>{session.contents.length} contents</span>
                                  <span>{session.contents.reduce((total, content) => total + (content.duration || 0), 0)}min</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSession(session)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSession(session.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* Session Contents */}
                          <div className="space-y-3">
                            {session.contents.map((content) => {
                              const ContentIcon = CONTENT_ICONS[content.type]
                              return (
                                <div key={content.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <ContentIcon className="w-4 h-4 text-gray-500" />
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium">{content.title}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {content.type.replace('_', ' ')}
                                        </Badge>
                                        {content.isFree && <Eye className="w-3 h-3 text-green-600" />}
                                        {!content.isFree && <Lock className="w-3 h-3 text-gray-400" />}
                                      </div>
                                      {content.description && (
                                        <p className="text-sm text-gray-600">{content.description}</p>
                                      )}
                                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                        {content.duration && (
                                          <span className="flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {content.duration}min
                                          </span>
                                        )}
                                        {content.youtubeUrl && (
                                          <Badge variant="outline" className="text-xs">
                                            <Play className="w-2 h-2 mr-1" />
                                            YouTube
                                          </Badge>
                                        )}
                                        {content.zoomLink && (
                                          <Badge variant="outline" className="text-xs">
                                            <Users className="w-2 h-2 mr-1" />
                                            Zoom
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditContent(session.id, content)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteContent(session.id, content.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                            
                            {/* Add Content Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddContent(session.id)}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Content to Session
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Add Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSession ? 'Edit Session' : 'Add New Session'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTitle">Session Title *</Label>
              <Input
                id="sessionTitle"
                placeholder="e.g., Introduction to Russian Alphabet"
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionDescription">Session Description</Label>
              <Textarea
                id="sessionDescription"
                placeholder="Describe what this session covers..."
                value={newSessionDescription}
                onChange={(e) => setNewSessionDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sessionFree">Make this session free preview</Label>
              <Switch
                id="sessionFree"
                checked={newSessionIsFree}
                onCheckedChange={setNewSessionIsFree}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSessionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={editingSession ? handleUpdateSession : handleAddSession}>
                {editingSession ? 'Update Session' : 'Add Session'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Content Dialog */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Edit Content' : 'Add Content'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Content Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contentTitle">Content Title *</Label>
                  <Input
                    id="contentTitle"
                    placeholder="e.g., Introduction Video"
                    value={contentForm.title || ''}
                    onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type *</Label>
                  <Select 
                    value={contentForm.type} 
                    onValueChange={(value) => setContentForm(prev => ({ ...prev, type: value as SessionContent['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <type.icon className="w-4 h-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentDescription">Description</Label>
                <Textarea
                  id="contentDescription"
                  placeholder="Describe this content..."
                  value={contentForm.description || ''}
                  onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contentDuration">Duration (minutes)</Label>
                  <Input
                    id="contentDuration"
                    type="number"
                    min="1"
                    value={contentForm.duration || ''}
                    onChange={(e) => setContentForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="contentFree">Free preview content</Label>
                  <Switch
                    id="contentFree"
                    checked={contentForm.isFree || false}
                    onCheckedChange={(checked) => setContentForm(prev => ({ ...prev, isFree: checked }))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {contentForm.type === 'VIDEO' && (
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube URL *</Label>
                  <Input
                    id="youtubeUrl"
                    placeholder="https://youtube.com/watch?v=..."
                    value={contentForm.youtubeUrl || ''}
                    onChange={(e) => setContentForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                  />
                </div>
              )}

              {contentForm.type === 'LIVE_SESSION' && (
                <div className="space-y-2">
                  <Label htmlFor="zoomLink">Zoom Meeting Link *</Label>
                  <Input
                    id="zoomLink"
                    placeholder="https://zoom.us/j/..."
                    value={contentForm.zoomLink || ''}
                    onChange={(e) => setContentForm(prev => ({ ...prev, zoomLink: e.target.value }))}
                  />
                </div>
              )}

              {contentForm.type === 'EXERCISE' && (
                <div className="space-y-2">
                  <Label htmlFor="exerciseContent">Exercise Content *</Label>
                  <Textarea
                    id="exerciseContent"
                    placeholder="Enter exercise instructions, questions, or content..."
                    value={contentForm.exerciseContent || ''}
                    onChange={(e) => setContentForm(prev => ({ ...prev, exerciseContent: e.target.value }))}
                    rows={6}
                  />
                </div>
              )}

              {(contentForm.type === 'DOCUMENT' || contentForm.type === 'AUDIO') && (
                <div className="space-y-2">
                  <Label htmlFor="materialUrl">File URL *</Label>
                  <Input
                    id="materialUrl"
                    placeholder="https://example.com/file.pdf"
                    value={contentForm.materialUrl || ''}
                    onChange={(e) => setContentForm(prev => ({ ...prev, materialUrl: e.target.value }))}
                  />
                </div>
              )}

              {contentForm.type === 'QUIZ' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Quiz Questions</h4>
                    <Badge variant="outline">{quizQuestions.length} questions</Badge>
                  </div>

                  {/* Quiz Questions List */}
                  <ScrollArea className="h-60 border rounded-lg p-4">
                    {quizQuestions.map((question, index) => (
                      <div key={question.id} className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">Q{index + 1}: {question.question}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {question.type.replace('_', ' ')}
                            </Badge>
                            {question.options && (
                              <div className="mt-2 text-sm text-gray-600">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className={`${optIndex === question.correctAnswer ? 'font-medium text-green-600' : ''}`}>
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setQuizQuestions(quizQuestions.filter(q => q.id !== question.id))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>

                  {/* Add Question Form */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h5 className="font-medium">Add New Question</h5>
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter question..."
                        value={currentQuestion.question || ''}
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                      />
                      <Select 
                        value={currentQuestion.type} 
                        onValueChange={(value) => setCurrentQuestion(prev => ({ ...prev, type: value as QuizQuestion['type'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="true_false">True/False</SelectItem>
                          <SelectItem value="short_answer">Short Answer</SelectItem>
                          <SelectItem value="essay">Essay</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Multiple Choice Options */}
                      {currentQuestion.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          <Label>Answer Options</Label>
                          {currentQuestion.options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(currentQuestion.options || [])]
                                  newOptions[index] = e.target.value
                                  setCurrentQuestion(prev => ({ ...prev, options: newOptions }))
                                }}
                              />
                              <Button
                                variant={currentQuestion.correctAnswer === index ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                              >
                                {currentQuestion.correctAnswer === index ? <CheckCircle className="w-4 h-4" /> : 'Correct'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* True/False */}
                      {currentQuestion.type === 'true_false' && (
                        <div className="space-y-2">
                          <Label>Correct Answer</Label>
                          <div className="flex space-x-2">
                            <Button
                              variant={currentQuestion.correctAnswer === 'true' ? "default" : "outline"}
                              onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 'true' }))}
                            >
                              True
                            </Button>
                            <Button
                              variant={currentQuestion.correctAnswer === 'false' ? "default" : "outline"}
                              onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 'false' }))}
                            >
                              False
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Short Answer */}
                      {currentQuestion.type === 'short_answer' && (
                        <div className="space-y-2">
                          <Label>Sample Correct Answer</Label>
                          <Input
                            placeholder="Enter a sample correct answer..."
                            value={currentQuestion.correctAnswer as string || ''}
                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                          />
                        </div>
                      )}

                      {/* Explanation */}
                      <div className="space-y-2">
                        <Label>Explanation (Optional)</Label>
                        <Textarea
                          placeholder="Explain the correct answer..."
                          value={currentQuestion.explanation || ''}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                          rows={2}
                        />
                      </div>

                      <Button onClick={handleAddQuizQuestion} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowContentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveContent}>
              {editingContent ? 'Update Content' : 'Add Content'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Free Content Limit Warning */}
      {getFreeContentCount() > freeContentLimit && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> You have {getFreeContentCount()} free content items, 
            but your course limit is set to {freeContentLimit}. 
            Consider adjusting your free content settings or course pricing configuration.
          </AlertDescription>
        </Alert>
      )}

      {/* Content Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Content Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Each session should have 3-5 content items for optimal learning experience</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Include a mix of videos, quizzes, and exercises to keep students engaged</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Mark important introductory content as "free preview" to attract students</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Videos should be 5-15 minutes long for better attention span</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Include quizzes after theory content to reinforce learning</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}