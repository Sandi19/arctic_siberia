// File: src/components/course/session-builder.tsx

'use client'

// ✅ FIXED: Menggunakan React hooks
import { useState, useCallback, useMemo } from 'react'

// ✅ FIXED: Menggunakan barrel imports dari index.ts untuk UI components
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea
} from '@/components/ui'

// ✅ FIXED: Import dari session components (reusable)
import {
  SessionCard,
  SessionForm,
  SessionList,
  SessionStats,
  useSessionCrud,
  useSessionReorder
} from '@/components/session'

// ✅ FIXED: Import dari quiz system
import {
  QuizBuilder,
  QuizRenderer
} from '@/components/quiz'

// ✅ FIXED: Import icons dari lucide-react
import {
  BookOpen,
  Clock,
  FileText,
  GraduationCap,
  MoreVertical,
  Play,
  Plus,
  Settings,
  Star,
  Users,
  Video
} from 'lucide-react'

// ✅ FIXED: Import dnd-kit (migration dari @hello-pangea/dnd)
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import {
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// ✅ FIXED: Import types dari session/quiz systems
import {
  SessionTypes,
  ContentTypes,
  QuizTypes
} from '@/components/session/types'

// ✅ FIXED: Import local utilities
import { cn } from '@/lib/utils'

// ✅ FIXED: Course-specific types
interface CourseSessionBuilderProps {
  courseId?: string
  sessions: CourseSession[]
  onSessionsChange: (sessions: CourseSession[]) => void
  maxFreeSessions?: number
  className?: string
}

interface CourseSession {
  id: string
  title: string
  description?: string
  order: number
  duration?: number
  isFree: boolean
  contents: SessionContent[]
  type: 'video' | 'quiz' | 'exercise' | 'live' | 'document' | 'audio'
}

interface SessionContent {
  id: string
  type: 'video' | 'quiz' | 'exercise' | 'live' | 'document' | 'audio'
  title: string
  description?: string
  duration?: number
  youtubeUrl?: string
  zoomLink?: string
  quizData?: QuizTypes.Quiz
  exerciseContent?: string
  materialUrl?: string
  order: number
}

// ✅ FIXED: Sortable Session Item Component
function SortableSessionItem({ 
  session, 
  onEdit, 
  onDelete, 
  onAddContent,
  onEditContent,
  onDeleteContent,
  freeSessionsUsed,
  maxFreeSessions 
}: {
  session: CourseSession
  onEdit: (session: CourseSession) => void
  onDelete: (sessionId: string) => void
  onAddContent: (sessionId: string) => void
  onEditContent: (sessionId: string, content: SessionContent) => void
  onDeleteContent: (sessionId: string, contentId: string) => void
  freeSessionsUsed: number
  maxFreeSessions: number
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: session.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'quiz': return <GraduationCap className="w-4 h-4" />
      case 'exercise': return <BookOpen className="w-4 h-4" />
      case 'live': return <Users className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      case 'audio': return <Play className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const canBeFree = !session.isFree || freeSessionsUsed < maxFreeSessions

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={cn(
        "group transition-all duration-200 hover:shadow-md",
        isDragging && "shadow-xl ring-2 ring-blue-500"
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <div 
              {...attributes}
              {...listeners}
              className="p-2 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
            >
              <div className="w-2 h-2 bg-gray-400 rounded-full mb-1"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full mb-1"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{session.title}</h3>
                {session.isFree && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    FREE
                  </span>
                )}
              </div>
              {session.description && (
                <p className="text-sm text-gray-600 mt-1">{session.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {session.duration || 0} min
                </span>
                <span>{session.contents.length} content{session.contents.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddContent(session.id)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Content
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Session Actions</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onEdit(session)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Session
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={() => onDelete(session.id)}
                  >
                    Delete Session
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      {/* Session Contents */}
      {session.contents.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {session.contents.map((content) => (
              <div 
                key={content.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getContentIcon(content.type)}
                  <div>
                    <div className="font-medium text-sm">{content.title}</div>
                    {content.description && (
                      <div className="text-xs text-gray-500">{content.description}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {content.duration && (
                    <span className="text-xs text-gray-500">
                      {content.duration} min
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditContent(session.id, content)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteContent(session.id, content.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ✅ FIXED: Main Session Builder Component
export default function SessionBuilder({
  courseId,
  sessions = [],
  onSessionsChange,
  maxFreeSessions = 3,
  className
}: CourseSessionBuilderProps) {
  // ✅ State management
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [showContentDialog, setShowContentDialog] = useState(false)
  const [editingSession, setEditingSession] = useState<CourseSession | null>(null)
  const [editingContent, setEditingContent] = useState<SessionContent | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // ✅ Form states
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    isFree: false
  })

  const [contentForm, setContentForm] = useState({
    type: 'video' as SessionContent['type'],
    title: '',
    description: '',
    duration: 0,
    youtubeUrl: '',
    zoomLink: '',
    exerciseContent: '',
    materialUrl: ''
  })

  // ✅ Reuse session hooks from session components
  const sessionCrud = useSessionCrud()
  const sessionReorder = useSessionReorder()

  // ✅ DnD sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // ✅ Calculate free sessions usage
  const freeSessionsUsed = useMemo(() => {
    return sessions.filter(session => session.isFree).length
  }, [sessions])

  // ✅ Drag handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sessions.findIndex((session) => session.id === active.id)
      const newIndex = sessions.findIndex((session) => session.id === over.id)

      const reorderedSessions = arrayMove(sessions, oldIndex, newIndex).map(
        (session, index) => ({
          ...session,
          order: index + 1
        })
      )

      onSessionsChange(reorderedSessions)
    }

    setActiveId(null)
  }, [sessions, onSessionsChange])

  // ✅ Session CRUD handlers
  const handleCreateSession = useCallback(() => {
    if (!sessionForm.title.trim()) return

    const newSession: CourseSession = {
      id: `session-${Date.now()}`,
      title: sessionForm.title,
      description: sessionForm.description,
      order: sessions.length + 1,
      duration: 0,
      isFree: sessionForm.isFree,
      contents: [],
      type: 'video'
    }

    onSessionsChange([...sessions, newSession])
    setSessionForm({ title: '', description: '', isFree: false })
    setShowSessionDialog(false)
  }, [sessionForm, sessions, onSessionsChange])

  const handleEditSession = useCallback((session: CourseSession) => {
    setEditingSession(session)
    setSessionForm({
      title: session.title,
      description: session.description || '',
      isFree: session.isFree
    })
    setShowSessionDialog(true)
  }, [])

  const handleUpdateSession = useCallback(() => {
    if (!editingSession || !sessionForm.title.trim()) return

    const updatedSessions = sessions.map(session =>
      session.id === editingSession.id
        ? {
            ...session,
            title: sessionForm.title,
            description: sessionForm.description,
            isFree: sessionForm.isFree
          }
        : session
    )

    onSessionsChange(updatedSessions)
    setEditingSession(null)
    setSessionForm({ title: '', description: '', isFree: false })
    setShowSessionDialog(false)
  }, [editingSession, sessionForm, sessions, onSessionsChange])

  const handleDeleteSession = useCallback((sessionId: string) => {
    if (confirm('Are you sure you want to delete this session? All contents will be removed.')) {
      const updatedSessions = sessions
        .filter(session => session.id !== sessionId)
        .map((session, index) => ({
          ...session,
          order: index + 1
        }))
      
      onSessionsChange(updatedSessions)
    }
  }, [sessions, onSessionsChange])

  // ✅ Content management handlers
  const handleAddContent = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId)
    setEditingContent(null)
    setContentForm({
      type: 'video',
      title: '',
      description: '',
      duration: 0,
      youtubeUrl: '',
      zoomLink: '',
      exerciseContent: '',
      materialUrl: ''
    })
    setShowContentDialog(true)
  }, [])

  const handleEditContent = useCallback((sessionId: string, content: SessionContent) => {
    setCurrentSessionId(sessionId)
    setEditingContent(content)
    setContentForm({
      type: content.type,
      title: content.title,
      description: content.description || '',
      duration: content.duration || 0,
      youtubeUrl: content.youtubeUrl || '',
      zoomLink: content.zoomLink || '',
      exerciseContent: content.exerciseContent || '',
      materialUrl: content.materialUrl || ''
    })
    setShowContentDialog(true)
  }, [])

  const handleSaveContent = useCallback(() => {
    if (!currentSessionId || !contentForm.title.trim()) return

    const newContent: SessionContent = {
      id: editingContent?.id || `content-${Date.now()}`,
      type: contentForm.type,
      title: contentForm.title,
      description: contentForm.description,
      duration: contentForm.duration,
      youtubeUrl: contentForm.youtubeUrl,
      zoomLink: contentForm.zoomLink,
      exerciseContent: contentForm.exerciseContent,
      materialUrl: contentForm.materialUrl,
      order: editingContent?.order || 1
    }

    const updatedSessions = sessions.map(session => {
      if (session.id === currentSessionId) {
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
    setCurrentSessionId(null)
  }, [currentSessionId, contentForm, editingContent, sessions, onSessionsChange])

  const handleDeleteContent = useCallback((sessionId: string, contentId: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      const updatedSessions = sessions.map(session => {
        if (session.id === sessionId) {
          const updatedContents = session.contents.filter(content => content.id !== contentId)
          return {
            ...session,
            contents: updatedContents,
            duration: updatedContents.reduce((total, content) => total + (content.duration || 0), 0)
          }
        }
        return session
      })
      onSessionsChange(updatedSessions)
    }
  }, [sessions, onSessionsChange])

  // ✅ Stats calculation
  const stats = useMemo(() => {
    const totalSessions = sessions.length
    const totalContents = sessions.reduce((total, session) => total + session.contents.length, 0)
    const totalDuration = sessions.reduce((total, session) => total + (session.duration || 0), 0)
    const freeContent = sessions.filter(session => session.isFree).length

    return {
      totalSessions,
      totalContents, 
      totalDuration,
      freeContent
    }
  }, [sessions])

  return (
    <div className={cn("space-y-6", className)}>
      {/* ✅ Header with Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Sessions</h2>
              <p className="text-gray-600 mb-4">
                Organize your course content into engaging sessions. 
                Drag to reorder for optimal learning flow.
              </p>
              
              {/* Course Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>{stats.totalSessions} Sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span>{stats.totalContents} Contents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>{stats.totalDuration} Minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span>{stats.freeContent}/{maxFreeSessions} Free</span>
                </div>
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

      {/* ✅ Empty State */}
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* ✅ Sessions List with DnD */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sessions.map(session => session.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sessions.map((session) => (
                <SortableSessionItem
                  key={session.id}
                  session={session}
                  onEdit={handleEditSession}
                  onDelete={handleDeleteSession}
                  onAddContent={handleAddContent}
                  onEditContent={handleEditContent}
                  onDeleteContent={handleDeleteContent}
                  freeSessionsUsed={freeSessionsUsed}
                  maxFreeSessions={maxFreeSessions}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <Card className="opacity-50">
                <CardHeader>
                  <CardTitle>
                    {sessions.find(s => s.id === activeId)?.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* ✅ Session Form Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSession ? 'Edit Session' : 'Add New Session'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Session Title</label>
              <Input
                placeholder="Enter session title"
                value={sessionForm.title}
                onChange={(e) => setSessionForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                placeholder="Session description (optional)"
                value={sessionForm.description}
                onChange={(e) => setSessionForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFree"
                checked={sessionForm.isFree}
                onChange={(e) => setSessionForm(prev => ({ ...prev, isFree: e.target.checked }))}
                disabled={!sessionForm.isFree && freeSessionsUsed >= maxFreeSessions}
              />
              <label htmlFor="isFree" className="text-sm">
                Make this session free
                {freeSessionsUsed >= maxFreeSessions && !sessionForm.isFree && (
                  <span className="text-red-500 text-xs ml-1">
                    (Free limit reached: {freeSessionsUsed}/{maxFreeSessions})
                  </span>
                )}
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSessionDialog(false)
                  setEditingSession(null)
                  setSessionForm({ title: '', description: '', isFree: false })
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={editingSession ? handleUpdateSession : handleCreateSession}
                disabled={!sessionForm.title.trim()}
                className="flex-1"
              >
                {editingSession ? 'Update' : 'Create'} Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Content Form Dialog */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Edit Content' : 'Add Content'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Content Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Content Type</label>
              <Select 
                value={contentForm.type} 
                onValueChange={(value: SessionContent['type']) => 
                  setContentForm(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">📹 Video</SelectItem>
                  <SelectItem value="quiz">🎯 Quiz</SelectItem>
                  <SelectItem value="exercise">📝 Exercise</SelectItem>
                  <SelectItem value="live">👥 Live Session</SelectItem>
                  <SelectItem value="document">📄 Document</SelectItem>
                  <SelectItem value="audio">🎵 Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                placeholder="Content title"
                value={contentForm.title}
                onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                placeholder="Content description"
                value={contentForm.description}
                onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
              <Input
                type="number"
                placeholder="0"
                value={contentForm.duration}
                onChange={(e) => setContentForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
              />
            </div>

            {/* Type-specific fields */}
            {contentForm.type === 'video' && (
              <div>
                <label className="block text-sm font-medium mb-1">YouTube URL</label>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={contentForm.youtubeUrl}
                  onChange={(e) => setContentForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                />
              </div>
            )}

            {contentForm.type === 'live' && (
              <div>
                <label className="block text-sm font-medium mb-1">Zoom Link</label>
                <Input
                  placeholder="https://zoom.us/j/..."
                  value={contentForm.zoomLink}
                  onChange={(e) => setContentForm(prev => ({ ...prev, zoomLink: e.target.value }))}
                />
              </div>
            )}

            {contentForm.type === 'exercise' && (
              <div>
                <label className="block text-sm font-medium mb-1">Exercise Content</label>
                <Textarea
                  placeholder="Exercise instructions and content..."
                  rows={6}
                  value={contentForm.exerciseContent}
                  onChange={(e) => setContentForm(prev => ({ ...prev, exerciseContent: e.target.value }))}
                />
              </div>
            )}

            {(contentForm.type === 'document' || contentForm.type === 'audio') && (
              <div>
                <label className="block text-sm font-medium mb-1">File URL</label>
                <Input
                  placeholder="https://example.com/file.pdf"
                  value={contentForm.materialUrl}
                  onChange={(e) => setContentForm(prev => ({ ...prev, materialUrl: e.target.value }))}
                />
              </div>
            )}

            {/* Quiz Integration */}
            {contentForm.type === 'quiz' && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Quiz Builder Integration</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Quiz content will be managed through the integrated Quiz Builder system.
                  This ensures consistency across all quiz components in the platform.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // This would open the QuizBuilder component
                    // For now, we'll show a placeholder
                    alert('Quiz Builder integration coming soon!')
                  }}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Open Quiz Builder
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowContentDialog(false)
                  setEditingContent(null)
                  setCurrentSessionId(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveContent}
                disabled={!contentForm.title.trim()}
                className="flex-1"
              >
                {editingContent ? 'Update' : 'Add'} Content
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Free Content Limit Warning */}
      {freeSessionsUsed >= maxFreeSessions && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-yellow-800">Free Content Limit Reached</h4>
                <p className="text-sm text-yellow-700">
                  You've used all {maxFreeSessions} free sessions. New sessions will be premium content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ Course Progress Summary */}
      {sessions.length > 0 && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Course Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalContents}</div>
                <div className="text-sm text-gray-600">Learning Materials</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.round(stats.totalDuration / 60)}h {stats.totalDuration % 60}m</div>
                <div className="text-sm text-gray-600">Course Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.freeContent}</div>
                <div className="text-sm text-gray-600">Free Sessions</div>
              </div>
            </div>
            
            {/* Course Validation Messages */}
            <div className="mt-4 space-y-2">
              {sessions.length < 3 && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Consider adding at least 3 sessions for a comprehensive course</span>
                </div>
              )}
              {stats.totalDuration < 60 && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Course duration is less than 1 hour - consider adding more content</span>
                </div>
              )}
              {stats.freeContent === 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Consider making at least one session free to attract students</span>
                </div>
              )}
              {sessions.length >= 3 && stats.totalDuration >= 60 && stats.freeContent > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Great! Your course structure looks comprehensive and engaging</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ✅ FIXED: Named export untuk sub-components jika diperlukan
export { SortableSessionItem }

// ✅ FIXED: Display name untuk debugging
SessionBuilder.displayName = 'CourseSessionBuilder'