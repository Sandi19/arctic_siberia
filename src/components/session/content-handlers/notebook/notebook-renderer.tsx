// File: src/components/session/content-handlers/notebook/notebook-renderer.tsx

'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

// ✅ UI Components - Arctic Siberia Import Standard
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Label,
  Badge,
  Alert,
  AlertDescription,
  Progress,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui'

// ✅ Icons - Arctic Siberia Import Standard
import {
  Play,
  Square,
  RotateCcw,
  Save,
  Send,
  Plus,
  Trash2,
  Copy,
  Move,
  Code2,
  FileText,
  Terminal,
  BookOpen,
  Clock,
  Zap,
  Memory,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Download,
  Upload,
  Maximize,
  Minimize,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  PlayCircle,
  StopCircle,
  Loader2,
  Hash,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from 'lucide-react'

// ✅ Session Types - Arctic Siberia Import Standard
import { 
  NotebookContent,
  ContentType 
} from '@/components/session/types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const submissionSchema = z.object({
  cells: z.array(z.any()),
  executionHistory: z.array(z.any()).optional(),
  notes: z.string().optional()
})

type SubmissionFormData = z.infer<typeof submissionSchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface NotebookRendererProps {
  content: NotebookContent
  onSubmit?: (submission: NotebookSubmission) => void
  onSaveDraft?: (draft: Partial<NotebookSubmission>) => void
  onExecuteCell?: (cellId: string, code: string, kernelType: string) => Promise<CellExecution>
  existingSubmission?: NotebookSubmission
  isReadOnly?: boolean
  showSolution?: boolean
  className?: string
}

interface NotebookSubmission {
  id: string
  notebookId: string
  studentId: string
  studentName: string
  cells: NotebookCell[]
  executionHistory: CellExecution[]
  submittedAt: Date
  status: 'DRAFT' | 'SUBMITTED' | 'GRADED' | 'COMPLETED'
  score?: number
  totalExecutions: number
  lastExecutionAt?: Date
  notes?: string
  isLate: boolean
}

interface NotebookCell {
  id: string
  type: 'CODE' | 'MARKDOWN' | 'RAW'
  content: string
  output?: CellOutput
  executionCount?: number
  metadata?: Record<string, any>
  order: number
  isExecuting?: boolean
  lastExecuted?: Date
}

interface CellOutput {
  data: any
  execution_count: number
  metadata: Record<string, any>
  output_type: 'execute_result' | 'display_data' | 'stream' | 'error'
  text?: string[]
  traceback?: string[]
  ename?: string
  evalue?: string
}

interface CellExecution {
  id: string
  cellId: string
  code: string
  output: CellOutput
  executionTime: number
  memoryUsage: number
  timestamp: Date
  success: boolean
  kernelType: string
}

interface CellRendererProps {
  cell: NotebookCell
  index: number
  kernelType: string
  isReadOnly: boolean
  allowAddCells: boolean
  allowDeleteCells: boolean
  showExecutionCount: boolean
  onExecute: (cellId: string) => void
  onUpdate: (cellId: string, content: string) => void
  onDelete: (cellId: string) => void
  onAddCell: (afterIndex: number, type: 'CODE' | 'MARKDOWN' | 'RAW') => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
}

interface KernelStatusProps {
  kernelType: string
  isConnected: boolean
  lastExecution?: Date
  totalExecutions: number
  onRestart: () => void
}

interface ExecutionStatsProps {
  executions: CellExecution[]
  totalCells: number
  executedCells: number
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateSubmissionId = (): string => {
  return `notebook_submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const generateExecutionId = (): string => {
  return `execution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const getKernelIcon = (kernelType: string) => {
  const icons = {
    PYTHON: '🐍',
    R: '📊',
    JAVASCRIPT: '🟨',
    JULIA: '⚡'
  }
  return icons[kernelType as keyof typeof icons] || '💻'
}

const formatExecutionTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

const formatMemoryUsage = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

const renderMarkdown = (content: string): string => {
  // Simple markdown rendering - in a real app, use a proper markdown library
  return content
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`(.*)`/gim, '<code>$1</code>')
    .replace(/\n/gim, '<br>')
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function NotebookRenderer({
  content,
  onSubmit,
  onSaveDraft,
  onExecuteCell,
  existingSubmission,
  isReadOnly = false,
  showSolution = false,
  className = ''
}: NotebookRendererProps) {
  // ===============================================================
  // 🎯 STATE MANAGEMENT
  // ===============================================================
  
  const [cells, setCells] = useState<NotebookCell[]>(
    existingSubmission?.cells || content.notebookData.cells.map(cell => ({
      ...cell,
      isExecuting: false,
      lastExecuted: undefined
    }))
  )
  const [executionHistory, setExecutionHistory] = useState<CellExecution[]>(
    existingSubmission?.executionHistory || []
  )
  const [kernelConnected, setKernelConnected] = useState(true)
  const [globalExecutionCount, setGlobalExecutionCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)

  // ===============================================================
  // 🎯 REFS
  // ===============================================================
  
  const notebookRef = useRef<HTMLDivElement>(null)

  // ===============================================================
  // 🎯 COMPUTED VALUES
  // ===============================================================
  
  const executedCells = cells.filter(cell => cell.executionCount !== undefined).length
  const totalExecutions = executionHistory.length
  const lastExecution = executionHistory[executionHistory.length - 1]
  const hasUnsavedChanges = true // Would be calculated based on actual changes

  // ===============================================================
  // 🎯 HANDLERS
  // ===============================================================
  
  const handleExecuteCell = useCallback(async (cellId: string) => {
    if (!content.notebookData.isExecutable || !onExecuteCell) return
    
    const cellIndex = cells.findIndex(c => c.id === cellId)
    if (cellIndex === -1) return
    
    const cell = cells[cellIndex]
    if (cell.type !== 'CODE') return
    
    // Set cell as executing
    setCells(prev => prev.map(c => 
      c.id === cellId ? { ...c, isExecuting: true } : c
    ))
    
    try {
      const execution = await onExecuteCell(cellId, cell.content, content.notebookData.kernelType)
      
      // Update cell with execution result
      const newExecutionCount = globalExecutionCount + 1
      setGlobalExecutionCount(newExecutionCount)
      
      setCells(prev => prev.map(c => 
        c.id === cellId ? {
          ...c,
          isExecuting: false,
          output: execution.output,
          executionCount: newExecutionCount,
          lastExecuted: new Date()
        } : c
      ))
      
      setExecutionHistory(prev => [...prev, execution])
      
    } catch (error) {
      console.error('Error executing cell:', error)
      setCells(prev => prev.map(c => 
        c.id === cellId ? { ...c, isExecuting: false } : c
      ))
    }
  }, [cells, content.notebookData, globalExecutionCount, onExecuteCell])

  const handleUpdateCell = useCallback((cellId: string, newContent: string) => {
    setCells(prev => prev.map(cell => 
      cell.id === cellId ? { ...cell, content: newContent } : cell
    ))
    
    // Trigger auto-save
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    
    const timer = setTimeout(() => {
      handleSaveDraft()
    }, 5000) // Auto-save after 5 seconds of inactivity
    
    setAutoSaveTimer(timer)
  }, [autoSaveTimer])

  const handleDeleteCell = useCallback((cellId: string) => {
    setCells(prev => prev.filter(cell => cell.id !== cellId))
  }, [])

  const handleAddCell = useCallback((afterIndex: number, type: 'CODE' | 'MARKDOWN' | 'RAW') => {
    const newCell: NotebookCell = {
      id: `cell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: type === 'CODE' ? '# New code cell' : 
               type === 'MARKDOWN' ? '# New markdown cell' : 
               'New raw cell',
      order: afterIndex + 0.5
    }
    
    setCells(prev => {
      const updated = [...prev]
      updated.splice(afterIndex + 1, 0, newCell)
      return updated.map((cell, index) => ({ ...cell, order: index }))
    })
  }, [])

  const handleMoveCell = useCallback((fromIndex: number, direction: 'up' | 'down') => {
    if (direction === 'up' && fromIndex === 0) return
    if (direction === 'down' && fromIndex === cells.length - 1) return
    
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    
    setCells(prev => {
      const updated = [...prev]
      const [movedCell] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, movedCell)
      return updated.map((cell, index) => ({ ...cell, order: index }))
    })
  }, [cells.length])

  const handleSaveDraft = useCallback(async () => {
    if (!onSaveDraft) return
    
    setIsDraftSaving(true)
    try {
      const draft: Partial<NotebookSubmission> = {
        notebookId: content.id,
        cells,
        executionHistory,
        status: 'DRAFT',
        totalExecutions,
        lastExecutionAt: lastExecution?.timestamp
      }
      
      await onSaveDraft(draft)
    } catch (error) {
      console.error('Error saving draft:', error)
    } finally {
      setIsDraftSaving(false)
    }
  }, [content.id, cells, executionHistory, totalExecutions, lastExecution, onSaveDraft])

  const handleSubmit = useCallback(async () => {
    if (!onSubmit) return
    
    setIsSubmitting(true)
    try {
      const submission: NotebookSubmission = {
        id: existingSubmission?.id || generateSubmissionId(),
        notebookId: content.id,
        studentId: 'current-student-id', // Would come from auth context
        studentName: 'Current Student', // Would come from auth context
        cells,
        executionHistory,
        submittedAt: new Date(),
        status: 'SUBMITTED',
        totalExecutions,
        lastExecutionAt: lastExecution?.timestamp,
        isLate: false // Would be calculated based on due date
      }
      
      await onSubmit(submission)
    } catch (error) {
      console.error('Error submitting notebook:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [content.id, cells, executionHistory, totalExecutions, lastExecution, onSubmit, existingSubmission])

  const handleRunAllCells = useCallback(async () => {
    const codeCells = cells.filter(cell => cell.type === 'CODE')
    
    for (const cell of codeCells) {
      if (!cell.isExecuting) {
        await handleExecuteCell(cell.id)
        // Add small delay between executions
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }, [cells, handleExecuteCell])

  const handleRestartKernel = useCallback(() => {
    // Clear all execution counts and outputs
    setCells(prev => prev.map(cell => ({
      ...cell,
      output: undefined,
      executionCount: undefined,
      lastExecuted: undefined
    })))
    
    setGlobalExecutionCount(0)
    setExecutionHistory([])
    setKernelConnected(true)
  }, [])

  // ===============================================================
  // 🎯 EFFECTS
  // ===============================================================
  
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
    }
  }, [autoSaveTimer])

  // ===============================================================
  // 🎯 RENDER
  // ===============================================================
  
  return (
    <div className={`space-y-6 ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6' : ''}`}>
      {/* Notebook Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">{getKernelIcon(content.notebookData.kernelType)}</span>
                <BookOpen className="w-5 h-5" />
                {content.title}
              </CardTitle>
              
              {content.description && (
                <p className="text-gray-600">{content.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline">
                  {content.notebookData.kernelType}
                </Badge>
                
                <div className="flex items-center gap-1">
                  <Layers className="w-4 h-4" />
                  <span>{cells.length} cells</span>
                </div>
                
                {content.points > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{content.points} points</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{content.duration} min</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
              
              <KernelStatus
                kernelType={content.notebookData.kernelType}
                isConnected={kernelConnected}
                lastExecution={lastExecution?.timestamp}
                totalExecutions={totalExecutions}
                onRestart={handleRestartKernel}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Instructions */}
      {content.notebookData.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ 
                __html: content.notebookData.instructions 
              }} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notebook Toolbar */}
      {!isReadOnly && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {content.notebookData.isExecutable && (
                  <>
                    <Button
                      onClick={handleRunAllCells}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Run All
                    </Button>
                    
                    <Button
                      onClick={handleRestartKernel}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Restart
                    </Button>
                  </>
                )}
                
                <Separator orientation="vertical" className="h-6" />
                
                <ExecutionStats
                  executions={executionHistory}
                  totalCells={cells.length}
                  executedCells={executedCells}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isDraftSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isDraftSaving ? 'Saving...' : 'Save Draft'}
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit Notebook'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notebook Cells */}
      <div ref={notebookRef} className="space-y-1">
        {cells.map((cell, index) => (
          <CellRenderer
            key={cell.id}
            cell={cell}
            index={index}
            kernelType={content.notebookData.kernelType}
            isReadOnly={isReadOnly}
            allowAddCells={!isReadOnly}
            allowDeleteCells={!isReadOnly && cells.length > 1}
            showExecutionCount={true}
            onExecute={handleExecuteCell}
            onUpdate={handleUpdateCell}
            onDelete={handleDeleteCell}
            onAddCell={handleAddCell}
            onMoveUp={(index) => handleMoveCell(index, 'up')}
            onMoveDown={(index) => handleMoveCell(index, 'down')}
          />
        ))}
      </div>

      {/* Execution History */}
      {executionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Execution History ({executionHistory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {executionHistory.slice(-10).map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between text-sm p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {execution.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>Cell {cells.findIndex(c => c.id === execution.cellId) + 1}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>{formatExecutionTime(execution.executionTime)}</span>
                      <span>{formatMemoryUsage(execution.memoryUsage)}</span>
                      <span>{formatDistanceToNow(execution.timestamp, { addSuffix: true, locale: id })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ✅ Arctic Siberia Export Standard
NotebookRenderer.displayName = 'NotebookRenderer'

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function CellRenderer({ 
  cell, 
  index, 
  kernelType, 
  isReadOnly, 
  allowAddCells, 
  allowDeleteCells, 
  showExecutionCount,
  onExecute, 
  onUpdate, 
  onDelete, 
  onAddCell, 
  onMoveUp, 
  onMoveDown 
}: CellRendererProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showOutput, setShowOutput] = useState(true)

  const getCellBorder = () => {
    switch (cell.type) {
      case 'CODE': return 'border-l-4 border-l-blue-500'
      case 'MARKDOWN': return 'border-l-4 border-l-green-500'
      case 'RAW': return 'border-l-4 border-l-gray-500'
      default: return ''
    }
  }

  const getCellIcon = () => {
    switch (cell.type) {
      case 'CODE': return Code2
      case 'MARKDOWN': return FileText
      case 'RAW': return Terminal
      default: return Code2
    }
  }

  const Icon = getCellIcon()

  return (
    <Card className={`${getCellBorder()} hover:shadow-md transition-shadow`}>
      {/* Cell Header */}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {cell.type} [{index + 1}]
            </span>
            
            {cell.type === 'CODE' && showExecutionCount && (
              <Badge variant="outline" className="text-xs">
                {cell.executionCount ? `[${cell.executionCount}]` : '[ ]'}
              </Badge>
            )}
            
            {cell.isExecuting && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            )}
            
            {cell.lastExecuted && (
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(cell.lastExecuted, { addSuffix: true, locale: id })}
              </span>
            )}
          </div>
          
          {!isReadOnly && (
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move up</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMoveDown(index)}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move down</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {allowDeleteCells && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(cell.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete cell</TooltipContent>
                  </Tooltip>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Cell Content */}
        <div className="space-y-3">
          {isEditing || (!isReadOnly && cell.type === 'CODE') ? (
            <Textarea
              value={cell.content}
              onChange={(e) => onUpdate(cell.id, e.target.value)}
              onBlur={() => setIsEditing(false)}
              className={`font-${cell.type === 'CODE' ? 'mono' : 'sans'} text-sm min-h-20`}
              placeholder={
                cell.type === 'CODE' ? 'Enter your code here...' :
                cell.type === 'MARKDOWN' ? 'Enter markdown content...' :
                'Enter raw text...'
              }
            />
          ) : (
            <div
              className={`p-3 rounded border cursor-text ${
                cell.type === 'CODE' ? 'bg-gray-50 font-mono' : 'bg-white'
              }`}
              onClick={() => !isReadOnly && setIsEditing(true)}
            >
              {cell.type === 'MARKDOWN' ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(cell.content) }}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm">{cell.content}</pre>
              )}
            </div>
          )}
          
          {/* Cell Actions */}
          {!isReadOnly && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {cell.type === 'CODE' && (
                  <Button
                    onClick={() => onExecute(cell.id)}
                    disabled={cell.isExecuting}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {cell.isExecuting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    Run
                  </Button>
                )}
                
                {allowAddCells && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Cell</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-3 gap-3">
                        <Button onClick={() => onAddCell(index, 'CODE')}>
                          <Code2 className="w-4 h-4 mr-2" />
                          Code
                        </Button>
                        <Button onClick={() => onAddCell(index, 'MARKDOWN')}>
                          <FileText className="w-4 h-4 mr-2" />
                          Markdown
                        </Button>
                        <Button onClick={() => onAddCell(index, 'RAW')}>
                          <Terminal className="w-4 h-4 mr-2" />
                          Raw
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              {cell.output && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOutput(!showOutput)}
                >
                  {showOutput ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              )}
            </div>
          )}
          
          {/* Cell Output */}
          {cell.output && showOutput && (
            <div className="mt-3 border-t pt-3">
              <CellOutput output={cell.output} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CellOutput({ output }: { output: CellOutput }) {
  const getOutputClass = () => {
    switch (output.output_type) {
      case 'execute_result':
      case 'display_data':
        return 'bg-white border border-gray-200'
      case 'stream':
        return 'bg-gray-900 text-green-400'
      case 'error':
        return 'bg-red-50 border border-red-200 text-red-800'
      default:
        return 'bg-gray-50'
    }
  }

  return (
    <div className={`p-3 rounded ${getOutputClass()}`}>
      {output.output_type === 'error' ? (
        <div className="space-y-2">
          <div className="font-medium text-red-700">
            {output.ename}: {output.evalue}
          </div>
          {output.traceback && (
            <pre className="text-xs overflow-auto">
              {output.traceback.join('\n')}
            </pre>
          )}
        </div>
      ) : output.output_type === 'stream' ? (
        <pre className="font-mono text-sm whitespace-pre-wrap">
          {output.text?.join('') || ''}
        </pre>
      ) : (
        <div className="space-y-2">
          {/* Handle different data types */}
          {typeof output.data === 'string' ? (
            <pre className="font-mono text-sm">{output.data}</pre>
          ) : output.data && typeof output.data === 'object' ? (
            Object.entries(output.data).map(([mimeType, data]) => (
              <div key={mimeType}>
                {mimeType === 'text/plain' && (
                  <pre className="font-mono text-sm">{data as string}</pre>
                )}
                {mimeType === 'text/html' && (
                  <div dangerouslySetInnerHTML={{ __html: data as string }} />
                )}
                {mimeType.startsWith('image/') && (
                  <img src={data as string} alt="Output" className="max-w-full" />
                )}
              </div>
            ))
          ) : (
            <pre className="font-mono text-sm">
              {JSON.stringify(output.data, null, 2)}
            </pre>
          )}
          
          <div className="text-xs text-gray-500 border-t pt-2">
            Out[{output.execution_count}]
          </div>
        </div>
      )}
    </div>
  )
}

function KernelStatus({ 
  kernelType, 
  isConnected, 
  lastExecution, 
  totalExecutions, 
  onRestart 
}: KernelStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="font-medium">{kernelType}</span>
      </div>
      
      <Separator orientation="vertical" className="h-4" />
      
      <div className="text-xs text-gray-600">
        {totalExecutions} executions
      </div>
      
      {lastExecution && (
        <div className="text-xs text-gray-600">
          Last: {formatDistanceToNow(lastExecution, { addSuffix: true, locale: id })}
        </div>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onRestart}
        className="text-xs"
      >
        <RefreshCw className="w-3 h-3 mr-1" />
        Restart
      </Button>
    </div>
  )
}

function ExecutionStats({ executions, totalCells, executedCells }: ExecutionStatsProps) {
  const successfulExecutions = executions.filter(e => e.success).length
  const failedExecutions = executions.length - successfulExecutions
  const averageTime = executions.length > 0 
    ? executions.reduce((sum, e) => sum + e.executionTime, 0) / executions.length 
    : 0

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <span>{successfulExecutions}</span>
      </div>
      
      {failedExecutions > 0 && (
        <div className="flex items-center gap-1">
          <XCircle className="w-4 h-4 text-red-600" />
          <span>{failedExecutions}</span>
        </div>
      )}
      
      <div className="flex items-center gap-1">
        <Zap className="w-4 h-4 text-blue-600" />
        <span>{executedCells}/{totalCells}</span>
      </div>
      
      {averageTime > 0 && (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-gray-600" />
          <span>{formatExecutionTime(averageTime)}</span>
        </div>
      )}
    </div>
  )
}

// =================================================================
// 🎯 EXPORTS - Arctic Siberia Export Standard
// =================================================================

export default NotebookRenderer
export { 
  CellRenderer, 
  CellOutput, 
  KernelStatus, 
  ExecutionStats, 
  type NotebookRendererProps 
}