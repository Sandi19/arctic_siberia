// File: src/components/course/session-builder.tsx - IMPROVED UI/UX VERSION

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
  Separator,
  AlertDescription
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
  Settings,
  BookOpen,
  Target,
  Zap
} from 'lucide-react'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

// Interfaces remain the same
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

  // All existing handler functions remain the same
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
    <div className="max-w-4xl mx-auto px-6 space-y-6">
      {/* ✅ IMPROVED: Better statistics cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
            <div className="text-sm text-gray-600">Sessions</div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{getContentTypeCount('VIDEO')}</div>
            <div className="text-sm text-gray-600">Videos</div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{getContentTypeCount('QUIZ')}</div>
            <div className="text-sm text-gray-600">Quizzes</div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{getFreeContentCount()}</div>
            <div className="text-sm text-gray-600">Free Content</div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{Math.round(getTotalDuration())}m</div>
            <div className="text-sm text-gray-600">Total Duration</div>
          </CardContent>
        </Card>
      </div>

      {/* ✅ IMPROVED: Header card with better styling */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Course Sessions</h3>
                <p className="text-sm text-blue-700">
                  Create and organize your course sessions. Drag to reorder for optimal learning flow.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowSessionDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ✅ IMPROVED: Modern empty state */}
      {sessions.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to build your course?</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start creating engaging learning experiences by adding your first session. 
              Each session can contain videos, quizzes, exercises, and more!
            </p>
            <Button 
              onClick={() => setShowSessionDialog(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Zap className="w-5 h-5 mr-2" />
              Create Your First Session
            </Button>
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>Structured Learning</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>Interactive Content</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Easy Management</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ✅ IMPROVED: Session list with better styling */
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
                        className={`transition-all duration-200 hover:shadow-lg ${
                          snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500 ring-opacity-50' : ''
                        }`}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div {...provided.dragHandleProps} className="p-1 hover:bg-gray-100 rounded transition-colors">
                                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="text-lg font-semibold text-gray-800">
                                    Session {session.order}: {session.title}
                                  </h3>
                                  {session.isFree && (
                                    <Badge className="bg-green-100 text-green-800 border-green-300">
                                      Free Preview
                                    </Badge>
                                  )}
                                </div>
                                {session.description && (
                                  <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                                )}
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                                  <span className="flex items-center space-x-1">
                                    <FileText className="w-3 h-3" />
                                    <span>{session.contents.length} contents</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{session.contents.reduce((total, content) => total + (content.duration || 0), 0)}min</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSession(session)}
                                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSession(session.id)}
                                className="hover:bg-red-50 hover:border-red-300 text-red-600 transition-colors"
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
                                <div key={content.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-white rounded-lg border border-gray-300 flex items-center justify-center">
                                      <ContentIcon className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium text-gray-800">{content.title}</span>
                                        <Badge variant="outline" className="text-xs bg-white">
                                          {content.type.replace('_', ' ')}
                                        </Badge>
                                        {content.isFree ? (
                                          <Eye className="w-3 h-3 text-green-600" />
                                        ) : (
                                          <Lock className="w-3 h-3 text-gray-400" />
                                        )}
                                      </div>
                                      {content.description && (
                                        <p className="text-sm text-gray-600 mt-1">{content.description}</p>
                                      )}
                                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
                                        {content.duration && (
                                          <span className="flex items-center space-x-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{content.duration}min</span>
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
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditContent(session.id, content)}
                                      className="hover:bg-blue-50"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteContent(session.id, content.id)}
                                      className="hover:bg-red-50 text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                            
                            {/* ✅ IMPROVED: Add Content Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddContent(session.id)}
                              className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
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

      {/* ✅ IMPROVED: Session Dialog with better size and styling */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingSession ? 'Edit Session' : 'Add New Session'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTitle" className="text-sm font-medium">Session Title *</Label>
              <Input
                id="sessionTitle"
                placeholder="e.g., Introduction to Russian Alphabet"
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionDescription" className="text-sm font-medium">Session Description</Label>
              <Textarea
                id="sessionDescription"
                placeholder="Describe what this session covers..."
                value={newSessionDescription}
                onChange={(e) => setNewSessionDescription(e.target.value)}
                rows={3}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <Label htmlFor="sessionFree" className="text-sm font-medium">Make this session free preview</Label>
                <p className="text-xs text-gray-600 mt-1">Free sessions help attract students to your course</p>
              </div>
              <Switch
                id="sessionFree"
                checked={newSessionIsFree}
                onCheckedChange={setNewSessionIsFree}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowSessionDialog(false)}
                className="hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={editingSession ? handleUpdateSession : handleAddSession}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingSession ? 'Update Session' : 'Add Session'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ IMPROVED: Content Dialog with better organization */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingContent ? 'Edit Content' : 'Add Content'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="details">Content Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contentTitle" className="text-sm font-medium">Content Title *</Label>
                  <Input
                    id="contentTitle"
                    placeholder="e.g., Introduction Video"
                    value={contentForm.title || ''}
                    onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contentType" className="text-sm font-medium">Content Type *</Label>
                  <Select 
                    value={contentForm.type} 
                    onValueChange={(value) => setContentForm(prev => ({ ...prev, type: value as SessionContent['type'] }))}
                  >
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
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
                <Label htmlFor="contentDescription" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="contentDescription"
                  placeholder="Describe this content..."
                  value={contentForm.description || ''}
                  onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contentDuration" className="text-sm font-medium">Duration (minutes)</Label>
                  <Input
                    id="contentDuration"
                    type="number"
                    min="1"
                    value={contentForm.duration || ''}
                    onChange={(e) => setContentForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <Label htmlFor="contentFree" className="text-sm font-medium">Free preview content</Label>
                    <p className="text-xs text-gray-600 mt-1">Allow free access to this content</p>
                  </div>
                  <Switch
                    id="contentFree"
                    checked={contentForm.isFree || false}
                    onCheckedChange={(checked) => setContentForm(prev => ({ ...prev, isFree: checked }))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {contentForm.type === 'VIDEO' && (
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl" className="text-sm font-medium">YouTube URL *</Label>
                  <Input
                    id="youtubeUrl"
                    placeholder="https://youtube.com/watch?v=..."
                    value={contentForm.youtubeUrl || ''}
                    onChange={(e) => setContentForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {contentForm.type === 'LIVE_SESSION' && (
                <div className="space-y-2">
                  <Label htmlFor="zoomLink" className="text-sm font-medium">Zoom Meeting Link *</Label>
                  <Input
                    id="zoomLink"
                    placeholder="https://zoom.us/j/..."
                    value={contentForm.zoomLink || ''}
                    onChange={(e) => setContentForm(prev => ({ ...prev, zoomLink: e.target.value }))}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {contentForm.type === 'EXERCISE' && (
                <div className="space-y-2">
                  <Label htmlFor="exerciseContent" className="text-sm font-medium">Exercise Content *</Label>
                  <Textarea
                    id="exerciseContent"
                    placeholder="Enter exercise instructions, questions, or content..."
                    value={contentForm.exerciseContent || ''}
                    onChange={(e) => setContentForm(prev => ({ ...prev, exerciseContent: e.target.value }))}
                    rows={6}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {(contentForm.type === 'DOCUMENT' || contentForm.type === 'AUDIO') && (
                <div className="space-y-2">
                  <Label htmlFor="materialUrl" className="text-sm font-medium">File URL *</Label>
                  <Input
                    id="materialUrl"
                    placeholder="https://example.com/file.pdf"
                    value={contentForm.materialUrl || ''}
                    onChange={(e) => setContentForm(prev => ({ ...prev, materialUrl: e.target.value }))}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {contentForm.type === 'QUIZ' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-purple-900">Quiz Questions</h4>
                      <p className="text-sm text-purple-700">Create interactive questions for your students</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">{quizQuestions.length} questions</Badge>
                  </div>

                  {/* Quiz Questions List */}
                  <ScrollArea className="h-60 border rounded-lg p-4 bg-gray-50">
                    {quizQuestions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileQuestion className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No questions added yet</p>
                      </div>
                    ) : (
                      quizQuestions.map((question, index) => (
                        <div key={question.id} className="mb-4 p-4 bg-white rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">Q{index + 1}: {question.question}</p>
                              <Badge variant="outline" className="text-xs mt-2 bg-blue-50 text-blue-700">
                                {question.type.replace('_', ' ')}
                              </Badge>
                              {question.options && (
                                <div className="mt-3 text-sm text-gray-600">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className={`py-1 ${optIndex === question.correctAnswer ? 'font-medium text-green-600' : ''}`}>
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
                              className="hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </ScrollArea>

                  {/* Add Question Form */}
                  <div className="space-y-4 p-4 border rounded-lg bg-white">
                    <h5 className="font-medium text-gray-800">Add New Question</h5>
                    <div className="space-y-4">
                      <Input
                        placeholder="Enter question..."
                        value={currentQuestion.question || ''}
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      />
                      <Select 
                        value={currentQuestion.type} 
                        onValueChange={(value) => setCurrentQuestion(prev => ({ ...prev, type: value as QuizQuestion['type'] }))}
                      >
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
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
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Answer Options</Label>
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
                                className="flex-1"
                              />
                              <Button
                                variant={currentQuestion.correctAnswer === index ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                                className={currentQuestion.correctAnswer === index ? "bg-green-600 hover:bg-green-700" : ""}
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
                          <Label className="text-sm font-medium">Correct Answer</Label>
                          <div className="flex space-x-2">
                            <Button
                              variant={currentQuestion.correctAnswer === 'true' ? "default" : "outline"}
                              onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 'true' }))}
                              className={currentQuestion.correctAnswer === 'true' ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              True
                            </Button>
                            <Button
                              variant={currentQuestion.correctAnswer === 'false' ? "default" : "outline"}
                              onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: 'false' }))}
                              className={currentQuestion.correctAnswer === 'false' ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              False
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Short Answer */}
                      {currentQuestion.type === 'short_answer' && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Sample Correct Answer</Label>
                          <Input
                            placeholder="Enter a sample correct answer..."
                            value={currentQuestion.correctAnswer as string || ''}
                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {/* Explanation */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Explanation (Optional)</Label>
                        <Textarea
                          placeholder="Explain the correct answer..."
                          value={currentQuestion.explanation || ''}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                          rows={2}
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <Button 
                        onClick={handleAddQuizQuestion} 
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowContentDialog(false)}
              className="hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveContent}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingContent ? 'Update Content' : 'Add Content'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ IMPROVED: Warning alert with better styling */}
      {getFreeContentCount() > freeContentLimit && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            <strong>Warning:</strong> You have {getFreeContentCount()} free content items, 
            but your course limit is set to {freeContentLimit}. 
            Consider adjusting your free content settings or course pricing configuration.
          </AlertDescription>
        </Alert>
      )}

      {/* ✅ IMPROVED: Guidelines card with better visual design */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-green-900 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Content Creation Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Each session should have 3-5 content items for optimal learning experience</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Include a mix of videos, quizzes, and exercises to keep students engaged</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Mark important introductory content as "free preview" to attract students</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Videos should be 5-15 minutes long for better attention span</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Include quizzes after theory content to reinforce learning</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Use clear, descriptive titles for all content items</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}