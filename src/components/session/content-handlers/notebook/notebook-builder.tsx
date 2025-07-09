// File: src/components/session/content-handlers/notebook/notebook-builder.tsx

'use client'

import React, { useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Badge,
  Alert,
  AlertDescription,
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
  ScrollArea
} from '@/components/ui'

// ✅ Icons - Arctic Siberia Import Standard
import {
  Save,
  Eye,
  Play,
  Plus,
  Trash2,
  Copy,
  Move,
  BookOpen,
  Code2,
  FileText,
  Settings,
  Layers,
  Terminal,
  Database,
  Zap,
  Package,
  CheckCircle,
  AlertTriangle,
  Info,
  GripVertical,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Download,
  Upload,
  Beaker,
  X
} from 'lucide-react'

// ✅ Session Types - Arctic Siberia Import Standard
import { 
  NotebookContent,
  ContentType 
} from '@/components/session/types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const cellSchema = z.object({
  id: z.string(),
  type: z.enum(['CODE', 'MARKDOWN', 'RAW'], {
    required_error: 'Cell type is required'
  }),
  content: z.string(),
  output: z.any().optional(),
  executionCount: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  order: z.number()
})

const notebookSchema = z.object({
  title: z.string().min(1, 'Notebook title is required'),
  description: z.string().optional(),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
  kernelType: z.enum(['PYTHON', 'R', 'JAVASCRIPT', 'JULIA'], {
    required_error: 'Kernel type is required'
  }),
  environment: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  isExecutable: z.boolean().default(true),
  cells: z.array(cellSchema).min(1, 'At least one cell is required'),
  duration: z.number().min(5).optional(),
  points: z.number().min(0).max(100).default(0),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  allowCellAddition: z.boolean().default(true),
  allowCellDeletion: z.boolean().default(true),
  allowCellReordering: z.boolean().default(true),
  showExecutionCount: z.boolean().default(true),
  autoSaveInterval: z.number().min(30).default(300)
})

type NotebookFormData = z.infer<typeof notebookSchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface NotebookBuilderProps {
  initialData?: Partial<NotebookContent>
  onSave: (content: NotebookContent) => void
  onCancel: () => void
  onPreview?: (content: NotebookContent) => void
  isEditing?: boolean
  sessionId: string
  className?: string
}

interface CellEditorProps {
  cell: {
    id: string
    type: 'CODE' | 'MARKDOWN' | 'RAW'
    content: string
    output?: any
    executionCount?: number
    metadata?: Record<string, any>
    order: number
  }
  index: number
  onUpdate: (index: number, cell: any) => void
  onDelete: (index: number) => void
  onDuplicate: (index: number) => void
  kernelType: string
}

interface KernelEnvironmentProps {
  kernelType: string
  environment?: string
  requirements: string[]
  onEnvironmentChange: (env: string) => void
  onRequirementsChange: (requirements: string[]) => void
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `notebook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const generateCellId = (): string => {
  return `cell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const createDefaultNotebook = (): Partial<NotebookContent> => ({
  type: ContentType.NOTEBOOK,
  notebookData: {
    cells: [],
    kernelType: 'PYTHON',
    isExecutable: true
  }
})

const KERNEL_TYPES = [
  {
    value: 'PYTHON',
    label: 'Python',
    icon: '🐍',
    description: 'Python 3.x with scientific libraries',
    defaultCell: `# Python code cell
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Your code here
print("Hello, Python!")`,
    commonLibraries: ['numpy', 'pandas', 'matplotlib', 'seaborn', 'scipy', 'scikit-learn', 'tensorflow', 'torch']
  },
  {
    value: 'R',
    label: 'R',
    icon: '📊',
    description: 'R statistical computing environment',
    defaultCell: `# R code cell
library(ggplot2)
library(dplyr)

# Your code here
print("Hello, R!")`,
    commonLibraries: ['ggplot2', 'dplyr', 'tidyr', 'shiny', 'knitr', 'rmarkdown', 'caret', 'randomForest']
  },
  {
    value: 'JAVASCRIPT',
    label: 'JavaScript',
    icon: '🟨',
    description: 'Node.js JavaScript runtime',
    defaultCell: `// JavaScript code cell
const data = [1, 2, 3, 4, 5];

// Your code here
console.log("Hello, JavaScript!");`,
    commonLibraries: ['lodash', 'moment', 'd3', 'chart.js', 'express', 'axios', 'react', 'vue']
  },
  {
    value: 'JULIA',
    label: 'Julia',
    icon: '⚡',
    description: 'Julia high-performance computing',
    defaultCell: `# Julia code cell
using LinearAlgebra
using Plots

# Your code here
println("Hello, Julia!")`,
    commonLibraries: ['Plots', 'DataFrames', 'StatsPlots', 'MLJ', 'Flux', 'DifferentialEquations', 'Genie', 'CSV']
  }
]

const CELL_TYPES = [
  {
    value: 'CODE',
    label: 'Code',
    icon: Code2,
    description: 'Executable code cell',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    value: 'MARKDOWN',
    label: 'Markdown',
    icon: FileText,
    description: 'Documentation and text',
    color: 'bg-green-50 border-green-200'
  },
  {
    value: 'RAW',
    label: 'Raw',
    icon: Terminal,
    description: 'Raw text content',
    color: 'bg-gray-50 border-gray-200'
  }
]

const DEFAULT_ENVIRONMENTS = {
  PYTHON: 'python:3.9-slim',
  R: 'r-base:4.1.0',
  JAVASCRIPT: 'node:16-alpine',
  JULIA: 'julia:1.7'
}

// =================================================================
// 🎯 SORTABLE CELL ITEM COMPONENT
// =================================================================

function SortableCellItem({ 
  cell, 
  index, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  kernelType 
}: CellEditorProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cell.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <CellEditor
        cell={cell}
        index={index}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        kernelType={kernelType}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function NotebookBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isEditing = false,
  sessionId,
  className = ''
}: NotebookBuilderProps) {
  // ===============================================================
  // 🎯 STATE MANAGEMENT
  // ===============================================================
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('cells')

  // ===============================================================
  // 🎯 DND KIT SENSORS
  // ===============================================================
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // ===============================================================
  // 🎯 FORM SETUP
  // ===============================================================
  
  const form = useForm<NotebookFormData>({
    resolver: zodResolver(notebookSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      instructions: initialData?.notebookData?.instructions || '',
      kernelType: initialData?.notebookData?.kernelType || 'PYTHON',
      environment: initialData?.notebookData?.environment || DEFAULT_ENVIRONMENTS.PYTHON,
      requirements: initialData?.notebookData?.requirements || [],
      isExecutable: initialData?.notebookData?.isExecutable ?? true,
      cells: initialData?.notebookData?.cells || [
        {
          id: generateCellId(),
          type: 'MARKDOWN' as const,
          content: '# Welcome to Your Notebook\n\nThis is a markdown cell. Use it to document your work.',
          order: 0
        },
        {
          id: generateCellId(),
          type: 'CODE' as const,
          content: KERNEL_TYPES[0].defaultCell,
          order: 1
        }
      ],
      duration: initialData?.duration || 60,
      points: initialData?.points || 0,
      difficulty: initialData?.difficulty || 'medium',
      allowCellAddition: true,
      allowCellDeletion: true,
      allowCellReordering: true,
      showExecutionCount: true,
      autoSaveInterval: 300
    }
  })

  const { fields: cellFields, append: appendCell, remove: removeCell, move: moveCell } = useFieldArray({
    control: form.control,
    name: 'cells'
  })

  // ===============================================================
  // 🎯 HANDLERS
  // ===============================================================
  
  const handleSave = useCallback(async (formData: NotebookFormData) => {
    try {
      setIsSaving(true)
      
      const notebookContent: NotebookContent = {
        id: initialData?.id || generateId(),
        sessionId,
        type: ContentType.NOTEBOOK,
        title: formData.title,
        description: formData.description,
        order: initialData?.order || 0,
        isFree: initialData?.isFree || true,
        duration: formData.duration,
        points: formData.points,
        difficulty: formData.difficulty,
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
        notebookData: {
          cells: formData.cells,
          kernelType: formData.kernelType,
          environment: formData.environment,
          requirements: formData.requirements,
          isExecutable: formData.isExecutable
        }
      }

      await onSave(notebookContent)
    } catch (error) {
      console.error('Error saving notebook:', error)
    } finally {
      setIsSaving(false)
    }
  }, [initialData, sessionId, onSave])

  const handlePreview = useCallback(() => {
    const formData = form.getValues()
    const notebookContent: NotebookContent = {
      id: generateId(),
      sessionId,
      type: ContentType.NOTEBOOK,
      title: formData.title,
      description: formData.description,
      order: 0,
      isFree: true,
      duration: formData.duration,
      points: formData.points,
      difficulty: formData.difficulty,
      createdAt: new Date(),
      updatedAt: new Date(),
      notebookData: {
        cells: formData.cells,
        kernelType: formData.kernelType,
        environment: formData.environment,
        requirements: formData.requirements,
        isExecutable: formData.isExecutable
      }
    }
    
    onPreview?.(notebookContent)
    setIsPreviewOpen(true)
  }, [form, sessionId, onPreview])

  const handleKernelChange = useCallback((kernelType: string) => {
    const kernelData = KERNEL_TYPES.find(k => k.value === kernelType)
    if (kernelData) {
      form.setValue('kernelType', kernelType as any)
      form.setValue('environment', DEFAULT_ENVIRONMENTS[kernelType as keyof typeof DEFAULT_ENVIRONMENTS])
      form.setValue('requirements', [])
    }
  }, [form])

  const addCell = useCallback((type: 'CODE' | 'MARKDOWN' | 'RAW' = 'CODE', afterIndex?: number) => {
    const kernelType = form.watch('kernelType')
    const kernelData = KERNEL_TYPES.find(k => k.value === kernelType)
    
    const newCell = {
      id: generateCellId(),
      type,
      content: type === 'CODE' ? (kernelData?.defaultCell || '') : 
               type === 'MARKDOWN' ? '# New Markdown Cell\n\nEnter your documentation here.' : 
               'Raw text content',
      order: afterIndex !== undefined ? afterIndex + 1 : cellFields.length
    }
    
    if (afterIndex !== undefined) {
      // Insert at specific position
      const newCells = [...form.getValues('cells')]
      newCells.splice(afterIndex + 1, 0, newCell)
      // Reorder cells
      newCells.forEach((cell, index) => {
        cell.order = index
      })
      form.setValue('cells', newCells)
    } else {
      appendCell(newCell)
    }
  }, [form, cellFields.length, appendCell])

  const duplicateCell = useCallback((index: number) => {
    const cells = form.getValues('cells')
    const cellToDuplicate = cells[index]
    
    const duplicatedCell = {
      ...cellToDuplicate,
      id: generateCellId(),
      content: cellToDuplicate.content + '\n\n# Duplicated cell',
      order: cellToDuplicate.order + 0.5
    }
    
    const newCells = [...cells]
    newCells.splice(index + 1, 0, duplicatedCell)
    
    // Reorder cells
    newCells.forEach((cell, cellIndex) => {
      cell.order = cellIndex
    })
    
    form.setValue('cells', newCells)
  }, [form])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const cells = form.getValues('cells')
      const oldIndex = cells.findIndex(c => c.id === active.id)
      const newIndex = cells.findIndex(c => c.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newCells = arrayMove(cells, oldIndex, newIndex)
        
        // Update order values
        newCells.forEach((cell, index) => {
          cell.order = index
        })
        
        form.setValue('cells', newCells)
      }
    }
  }, [form])

  const updateCell = useCallback((index: number, updatedCell: any) => {
    const cells = form.getValues('cells')
    cells[index] = { ...cells[index], ...updatedCell }
    form.setValue('cells', cells)
  }, [form])

  const loadTemplate = useCallback(() => {
    const kernelType = form.watch('kernelType')
    const kernelData = KERNEL_TYPES.find(k => k.value === kernelType)
    
    if (kernelData) {
      const templateCells = [
        {
          id: generateCellId(),
          type: 'MARKDOWN' as const,
          content: `# ${kernelData.label} Notebook\n\nThis notebook uses ${kernelData.label} kernel for execution.\n\n## Getting Started\n\nUse the cells below to write and execute your code.`,
          order: 0
        },
        {
          id: generateCellId(),
          type: 'CODE' as const,
          content: kernelData.defaultCell,
          order: 1
        },
        {
          id: generateCellId(),
          type: 'MARKDOWN' as const,
          content: '## Analysis\n\nAdd your analysis and documentation here.',
          order: 2
        }
      ]
      
      form.setValue('cells', templateCells)
    }
  }, [form])

  // ===============================================================
  // 🎯 WATCH VALUES
  // ===============================================================
  
  const watchKernelType = form.watch('kernelType')
  const watchIsExecutable = form.watch('isExecutable')

  // ===============================================================
  // 🎯 RENDER
  // ===============================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Notebook' : 'Create Notebook'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Create interactive Jupyter-style notebooks with code, documentation, and visualizations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          
          <Button
            onClick={form.handleSubmit(handleSave)}
            disabled={isSaving}
            size="sm"
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Notebook'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Notebook Details</TabsTrigger>
          <TabsTrigger value="cells">Cells & Content</TabsTrigger>
          <TabsTrigger value="settings">Kernel & Settings</TabsTrigger>
        </TabsList>

        {/* Notebook Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Notebook Title *</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="e.g., Data Analysis with Python"
                  className={form.formState.errors.title ? 'border-red-500' : ''}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Brief description of the notebook contents..."
                  rows={2}
                />
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions *</Label>
                <Textarea
                  id="instructions"
                  {...form.register('instructions')}
                  placeholder="Detailed instructions for students. Explain what they should accomplish with this notebook..."
                  rows={4}
                  className={form.formState.errors.instructions ? 'border-red-500' : ''}
                />
                {form.formState.errors.instructions && (
                  <p className="text-sm text-red-600">{form.formState.errors.instructions.message}</p>
                )}
              </div>

              {/* Kernel Selection */}
              <div className="space-y-3">
                <Label>Kernel Type *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {KERNEL_TYPES.map((kernel) => {
                    const isSelected = watchKernelType === kernel.value
                    return (
                      <div
                        key={kernel.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleKernelChange(kernel.value)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{kernel.icon}</span>
                          <span className="font-medium">{kernel.label}</span>
                        </div>
                        <p className="text-xs text-gray-600">{kernel.description}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Points and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="0"
                    max="100"
                    {...form.register('points', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={form.watch('difficulty')}
                    onValueChange={(value) => form.setValue('difficulty', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cells & Content Tab */}
        <TabsContent value="cells" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Notebook Cells ({cellFields.length})
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadTemplate}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Load Template
                  </Button>
                  
                  <Select
                    value="CODE"
                    onValueChange={(value) => addCell(value as any)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Add Cell" />
                    </SelectTrigger>
                    <SelectContent>
                      {CELL_TYPES.map((cellType) => {
                        const Icon = cellType.icon
                        return (
                          <SelectItem key={cellType.value} value={cellType.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{cellType.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {cellFields.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No cells yet</h3>
                  <p className="text-gray-600 mb-6">Start building your notebook by adding cells</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => addCell('CODE')} variant="outline">
                      <Code2 className="w-4 h-4 mr-2" />
                      Add Code Cell
                    </Button>
                    <Button onClick={() => addCell('MARKDOWN')} variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Add Markdown Cell
                    </Button>
                  </div>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={cellFields.map(field => field.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {cellFields.map((field, index) => (
                        <SortableCellItem
                          key={field.id}
                          cell={field}
                          index={index}
                          onUpdate={updateCell}
                          onDelete={removeCell}
                          onDuplicate={duplicateCell}
                          kernelType={watchKernelType}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kernel & Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Execution Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <KernelEnvironment
                kernelType={watchKernelType}
                environment={form.watch('environment')}
                requirements={form.watch('requirements') || []}
                onEnvironmentChange={(env) => form.setValue('environment', env)}
                onRequirementsChange={(req) => form.setValue('requirements', req)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="w-5 h-5" />
                Notebook Behavior
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Execution Settings */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Code Execution</Label>
                  <p className="text-sm text-gray-600">Enable real-time code execution</p>
                </div>
                <Switch
                  checked={form.watch('isExecutable')}
                  onCheckedChange={(checked) => form.setValue('isExecutable', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Execution Count</Label>
                  <p className="text-sm text-gray-600">Display execution numbers on code cells</p>
                </div>
                <Switch
                  checked={form.watch('showExecutionCount')}
                  onCheckedChange={(checked) => form.setValue('showExecutionCount', checked)}
                />
              </div>

              {/* Cell Permissions */}
              <Separator />
              <h4 className="font-medium">Cell Permissions</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Add Cells</Label>
                  <Switch
                    checked={form.watch('allowCellAddition')}
                    onCheckedChange={(checked) => form.setValue('allowCellAddition', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Delete Cells</Label>
                  <Switch
                    checked={form.watch('allowCellDeletion')}
                    onCheckedChange={(checked) => form.setValue('allowCellDeletion', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Reorder Cells</Label>
                  <Switch
                    checked={form.watch('allowCellReordering')}
                    onCheckedChange={(checked) => form.setValue('allowCellReordering', checked)}
                  />
                </div>
              </div>

              {/* Auto-save */}
              <div className="space-y-2">
                <Label htmlFor="autoSaveInterval">Auto-save Interval (seconds)</Label>
                <Input
                  id="autoSaveInterval"
                  type="number"
                  min="30"
                  max="3600"
                  {...form.register('autoSaveInterval', { valueAsNumber: true })}
                />
                <p className="text-sm text-gray-600">Automatically save changes every N seconds</p>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  {...form.register('duration', { valueAsNumber: true })}
                />
                <p className="text-sm text-gray-600">Estimated time to complete this notebook</p>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Notebook Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Kernel</Label>
                  <p className="font-medium">{KERNEL_TYPES.find(k => k.value === watchKernelType)?.label}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Cells</Label>
                  <p className="font-medium">{cellFields.length} cells</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Execution</Label>
                  <p className="font-medium">{watchIsExecutable ? 'Enabled' : 'Disabled'}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Points</Label>
                  <p className="font-medium">{form.watch('points')} points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ✅ Arctic Siberia Export Standard
NotebookBuilder.displayName = 'NotebookBuilder'

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function CellEditor({ 
  cell, 
  index, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  kernelType,
  dragHandleProps 
}: CellEditorProps & { dragHandleProps?: any }) {
  const cellTypeData = CELL_TYPES.find(ct => ct.value === cell.type)
  const Icon = cellTypeData?.icon || Code2

  const handleContentChange = (content: string) => {
    onUpdate(index, { ...cell, content })
  }

  const handleTypeChange = (type: 'CODE' | 'MARKDOWN' | 'RAW') => {
    const kernelData = KERNEL_TYPES.find(k => k.value === kernelType)
    let newContent = cell.content
    
    if (type === 'CODE' && cell.type !== 'CODE') {
      newContent = kernelData?.defaultCell || ''
    } else if (type === 'MARKDOWN' && cell.type !== 'MARKDOWN') {
      newContent = '# Markdown Cell\n\nEnter your documentation here.'
    } else if (type === 'RAW' && cell.type !== 'RAW') {
      newContent = 'Raw text content'
    }
    
    onUpdate(index, { ...cell, type, content: newContent })
  }

  return (
    <Card className={`${cellTypeData?.color || 'bg-white'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div {...dragHandleProps} className="cursor-move">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">Cell {index + 1}</span>
            </div>
            
            <Select
              value={cell.type}
              onValueChange={(value) => handleTypeChange(value as any)}
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CELL_TYPES.map((cellType) => {
                  const CellIcon = cellType.icon
                  return (
                    <SelectItem key={cellType.value} value={cellType.value}>
                      <div className="flex items-center gap-2">
                        <CellIcon className="w-3 h-3" />
                        <span>{cellType.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(index)}
            >
              <Copy className="w-3 h-3" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Content Editor */}
          <Textarea
            value={cell.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={
              cell.type === 'CODE' ? 'Enter your code here...' :
              cell.type === 'MARKDOWN' ? 'Enter markdown content...' :
              'Enter raw text content...'
            }
            rows={cell.type === 'CODE' ? 8 : 4}
            className={`font-${cell.type === 'CODE' ? 'mono' : 'sans'} text-sm`}
          />
          
          {/* Cell Type Specific Options */}
          {cell.type === 'CODE' && (
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Executable</span>
              </div>
              <div className="flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                <span>{KERNEL_TYPES.find(k => k.value === kernelType)?.label}</span>
              </div>
            </div>
          )}
          
          {cell.type === 'MARKDOWN' && (
            <div className="text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>Supports Markdown syntax</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function KernelEnvironment({ 
  kernelType, 
  environment, 
  requirements, 
  onEnvironmentChange, 
  onRequirementsChange 
}: KernelEnvironmentProps) {
  const kernelData = KERNEL_TYPES.find(k => k.value === kernelType)
  
  const addRequirement = (requirement: string) => {
    if (requirement && !requirements.includes(requirement)) {
      onRequirementsChange([...requirements, requirement])
    }
  }

  const removeRequirement = (requirement: string) => {
    onRequirementsChange(requirements.filter(req => req !== requirement))
  }

  return (
    <div className="space-y-4">
      {/* Environment */}
      <div className="space-y-2">
        <Label>Environment Image</Label>
        <Input
          value={environment || ''}
          onChange={(e) => onEnvironmentChange(e.target.value)}
          placeholder={`e.g., ${DEFAULT_ENVIRONMENTS[kernelType as keyof typeof DEFAULT_ENVIRONMENTS]}`}
        />
        <p className="text-sm text-gray-600">Docker image or environment specification</p>
      </div>

      {/* Common Libraries */}
      {kernelData && (
        <div className="space-y-3">
          <Label>Common Libraries</Label>
          <div className="flex flex-wrap gap-2">
            {kernelData.commonLibraries.map((lib) => (
              <Button
                key={lib}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addRequirement(lib)}
                className={requirements.includes(lib) ? 'bg-blue-50 border-blue-300' : ''}
              >
                <Package className="w-3 h-3 mr-1" />
                {lib}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      <div className="space-y-3">
        <Label>Requirements</Label>
        
        {requirements.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {requirements.map((req) => (
              <Badge
                key={req}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {req}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRequirement(req)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            placeholder="Add custom requirement..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addRequirement(e.currentTarget.value)
                e.currentTarget.value = ''
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
              if (input?.value) {
                addRequirement(input.value)
                input.value = ''
              }
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Environment Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>{kernelData?.label} Environment:</strong> {kernelData?.description}
          <br />
          <strong>Default Image:</strong> {DEFAULT_ENVIRONMENTS[kernelType as keyof typeof DEFAULT_ENVIRONMENTS]}
        </AlertDescription>
      </Alert>
    </div>
  )
}

// =================================================================
// 🎯 EXPORTS - Arctic Siberia Export Standard
// =================================================================

export default NotebookBuilder
export { CellEditor, KernelEnvironment, type NotebookBuilderProps }