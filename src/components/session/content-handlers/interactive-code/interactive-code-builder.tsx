// File: src/components/session/content-handlers/interactive-code/interactive-code-builder.tsx

'use client'

import React, { useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

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
  DialogTrigger
} from '@/components/ui'

// ✅ Icons - Arctic Siberia Import Standard
import {
  Save,
  Eye,
  Play,
  Plus,
  Trash2,
  Code2,
  Terminal,
  FileCode,
  Settings,
  Clock,
  Memory,
  TestTube,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Info,
  Copy,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'

// ✅ Session Types - Arctic Siberia Import Standard
import { 
  InteractiveCodeContent,
  ContentType 
} from '@/components/session/types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const testCaseSchema = z.object({
  id: z.string(),
  input: z.string(),
  expectedOutput: z.string(),
  description: z.string().optional(),
  isHidden: z.boolean().default(false),
  points: z.number().min(0).default(1)
})

const hintSchema = z.object({
  id: z.string(),
  content: z.string().min(1, 'Hint content is required'),
  order: z.number(),
  revealAfterAttempts: z.number().min(0).default(0)
})

const interactiveCodeSchema = z.object({
  title: z.string().min(1, 'Code exercise title is required'),
  description: z.string().optional(),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
  language: z.enum(['JAVASCRIPT', 'PYTHON', 'JAVA', 'CPP', 'HTML_CSS', 'SQL'], {
    required_error: 'Programming language is required'
  }),
  starterCode: z.string().optional(),
  solution: z.string().optional(),
  testCases: z.array(testCaseSchema).min(1, 'At least one test case is required'),
  hints: z.array(hintSchema).optional(),
  allowExecution: z.boolean().default(true),
  timeLimit: z.number().min(5).max(300).optional(),
  memoryLimit: z.number().min(16).max(512).optional(),
  duration: z.number().min(5).optional(),
  points: z.number().min(1, 'Points must be at least 1').max(100, 'Maximum 100 points'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  showSolution: z.boolean().default(false),
  allowMultipleSubmissions: z.boolean().default(true),
  codeTemplate: z.string().optional(),
  importantConcepts: z.array(z.string()).optional()
})

type InteractiveCodeFormData = z.infer<typeof interactiveCodeSchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface InteractiveCodeBuilderProps {
  initialData?: Partial<InteractiveCodeContent>
  onSave: (content: InteractiveCodeContent) => void
  onCancel: () => void
  onPreview?: (content: InteractiveCodeContent) => void
  isEditing?: boolean
  sessionId: string
  className?: string
}

interface TestCaseEditorProps {
  testCases: Array<{
    id: string
    input: string
    expectedOutput: string
    description?: string
    isHidden: boolean
    points: number
  }>
  onUpdate: (testCases: Array<{
    id: string
    input: string
    expectedOutput: string
    description?: string
    isHidden: boolean
    points: number
  }>) => void
  language: string
}

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  placeholder?: string
  height?: string
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateId = (): string => {
  return `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const generateTestCaseId = (): string => {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const generateHintId = (): string => {
  return `hint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const createDefaultInteractiveCode = (): Partial<InteractiveCodeContent> => ({
  type: ContentType.INTERACTIVE_CODE,
  codeData: {
    language: 'JAVASCRIPT',
    allowExecution: true
  }
})

const PROGRAMMING_LANGUAGES = [
  {
    value: 'JAVASCRIPT',
    label: 'JavaScript',
    icon: '🟨',
    description: 'Modern JavaScript with ES6+ features',
    starterTemplate: `function solution() {
  // Write your code here
  return "Hello, World!";
}

// Test your function
console.log(solution());`
  },
  {
    value: 'PYTHON',
    label: 'Python',
    icon: '🐍',
    description: 'Python 3.x with standard libraries',
    starterTemplate: `def solution():
    """Write your code here"""
    return "Hello, World!"

# Test your function
print(solution())`
  },
  {
    value: 'JAVA',
    label: 'Java',
    icon: '☕',
    description: 'Java 11+ with common libraries',
    starterTemplate: `public class Solution {
    public static String solution() {
        // Write your code here
        return "Hello, World!";
    }
    
    public static void main(String[] args) {
        System.out.println(solution());
    }
}`
  },
  {
    value: 'CPP',
    label: 'C++',
    icon: '⚡',
    description: 'C++17 with STL',
    starterTemplate: `#include <iostream>
#include <string>
using namespace std;

string solution() {
    // Write your code here
    return "Hello, World!";
}

int main() {
    cout << solution() << endl;
    return 0;
}`
  },
  {
    value: 'HTML_CSS',
    label: 'HTML/CSS/JS',
    icon: '🌐',
    description: 'Web technologies sandbox',
    starterTemplate: `<!DOCTYPE html>
<html>
<head>
    <style>
        /* Your CSS here */
        body { font-family: Arial, sans-serif; }
    </style>
</head>
<body>
    <h1>Hello, World!</h1>
    
    <script>
        // Your JavaScript here
        console.log("Hello, World!");
    </script>
</body>
</html>`
  },
  {
    value: 'SQL',
    label: 'SQL',
    icon: '🗄️',
    description: 'SQL queries with sample database',
    starterTemplate: `-- Write your SQL query here
SELECT 'Hello, World!' as message;

-- Example with sample data:
-- SELECT * FROM users WHERE age > 18;`
  }
]

const DEFAULT_TEST_CASES = {
  JAVASCRIPT: [
    {
      id: generateTestCaseId(),
      input: '',
      expectedOutput: 'Hello, World!',
      description: 'Basic output test',
      isHidden: false,
      points: 1
    }
  ],
  PYTHON: [
    {
      id: generateTestCaseId(),
      input: '',
      expectedOutput: 'Hello, World!',
      description: 'Basic output test',
      isHidden: false,
      points: 1
    }
  ],
  JAVA: [
    {
      id: generateTestCaseId(),
      input: '',
      expectedOutput: 'Hello, World!',
      description: 'Basic output test',
      isHidden: false,
      points: 1
    }
  ],
  CPP: [
    {
      id: generateTestCaseId(),
      input: '',
      expectedOutput: 'Hello, World!',
      description: 'Basic output test',
      isHidden: false,
      points: 1
    }
  ],
  HTML_CSS: [
    {
      id: generateTestCaseId(),
      input: '',
      expectedOutput: 'Page renders correctly',
      description: 'Visual output check',
      isHidden: false,
      points: 1
    }
  ],
  SQL: [
    {
      id: generateTestCaseId(),
      input: '',
      expectedOutput: 'Hello, World!',
      description: 'Query result check',
      isHidden: false,
      points: 1
    }
  ]
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function InteractiveCodeBuilder({
  initialData,
  onSave,
  onCancel,
  onPreview,
  isEditing = false,
  sessionId,
  className = ''
}: InteractiveCodeBuilderProps) {
  // ===============================================================
  // 🎯 STATE MANAGEMENT
  // ===============================================================
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  // ===============================================================
  // 🎯 FORM SETUP
  // ===============================================================
  
  const form = useForm<InteractiveCodeFormData>({
    resolver: zodResolver(interactiveCodeSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      instructions: initialData?.codeData?.instructions || '',
      language: initialData?.codeData?.language || 'JAVASCRIPT',
      starterCode: initialData?.codeData?.starterCode || '',
      solution: initialData?.codeData?.solution || '',
      testCases: initialData?.codeData?.testCases || DEFAULT_TEST_CASES.JAVASCRIPT,
      hints: initialData?.codeData?.hints || [],
      allowExecution: initialData?.codeData?.allowExecution ?? true,
      timeLimit: initialData?.codeData?.timeLimit || 30,
      memoryLimit: initialData?.codeData?.memoryLimit || 128,
      duration: initialData?.duration || 60,
      points: initialData?.points || 10,
      difficulty: initialData?.difficulty || 'medium',
      showSolution: false,
      allowMultipleSubmissions: true,
      codeTemplate: '',
      importantConcepts: []
    }
  })

  const { fields: testCaseFields, append: appendTestCase, remove: removeTestCase } = useFieldArray({
    control: form.control,
    name: 'testCases'
  })

  const { fields: hintFields, append: appendHint, remove: removeHint } = useFieldArray({
    control: form.control,
    name: 'hints'
  })

  // ===============================================================
  // 🎯 HANDLERS
  // ===============================================================
  
  const handleSave = useCallback(async (formData: InteractiveCodeFormData) => {
    try {
      setIsSaving(true)
      
      const codeContent: InteractiveCodeContent = {
        id: initialData?.id || generateId(),
        sessionId,
        type: ContentType.INTERACTIVE_CODE,
        title: formData.title,
        description: formData.description,
        order: initialData?.order || 0,
        isFree: initialData?.isFree || true,
        duration: formData.duration,
        points: formData.points,
        difficulty: formData.difficulty,
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
        codeData: {
          language: formData.language,
          starterCode: formData.starterCode,
          solution: formData.solution,
          testCases: formData.testCases,
          hints: formData.hints,
          allowExecution: formData.allowExecution,
          timeLimit: formData.timeLimit,
          memoryLimit: formData.memoryLimit
        }
      }

      await onSave(codeContent)
    } catch (error) {
      console.error('Error saving interactive code:', error)
    } finally {
      setIsSaving(false)
    }
  }, [initialData, sessionId, onSave])

  const handlePreview = useCallback(() => {
    const formData = form.getValues()
    const codeContent: InteractiveCodeContent = {
      id: generateId(),
      sessionId,
      type: ContentType.INTERACTIVE_CODE,
      title: formData.title,
      description: formData.description,
      order: 0,
      isFree: true,
      duration: formData.duration,
      points: formData.points,
      difficulty: formData.difficulty,
      createdAt: new Date(),
      updatedAt: new Date(),
      codeData: {
        language: formData.language,
        starterCode: formData.starterCode,
        solution: formData.solution,
        testCases: formData.testCases,
        hints: formData.hints,
        allowExecution: formData.allowExecution,
        timeLimit: formData.timeLimit,
        memoryLimit: formData.memoryLimit
      }
    }
    
    onPreview?.(codeContent)
    setIsPreviewOpen(true)
  }, [form, sessionId, onPreview])

  const handleLanguageChange = useCallback((language: string) => {
    const langData = PROGRAMMING_LANGUAGES.find(l => l.value === language)
    if (langData) {
      form.setValue('language', language as any)
      form.setValue('starterCode', langData.starterTemplate)
      form.setValue('testCases', DEFAULT_TEST_CASES[language as keyof typeof DEFAULT_TEST_CASES])
    }
  }, [form])

  const addTestCase = useCallback(() => {
    appendTestCase({
      id: generateTestCaseId(),
      input: '',
      expectedOutput: '',
      description: '',
      isHidden: false,
      points: 1
    })
  }, [appendTestCase])

  const addHint = useCallback(() => {
    appendHint({
      id: generateHintId(),
      content: '',
      order: hintFields.length,
      revealAfterAttempts: 0
    })
  }, [appendHint, hintFields.length])

  const loadTemplate = useCallback(() => {
    const language = form.watch('language')
    const langData = PROGRAMMING_LANGUAGES.find(l => l.value === language)
    if (langData) {
      form.setValue('starterCode', langData.starterTemplate)
    }
  }, [form])

  // ===============================================================
  // 🎯 WATCH VALUES
  // ===============================================================
  
  const watchLanguage = form.watch('language')
  const watchAllowExecution = form.watch('allowExecution')

  // ===============================================================
  // 🎯 RENDER
  // ===============================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Code Exercise' : 'Create Code Exercise'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Create interactive coding challenges with real-time execution and testing
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
            {isSaving ? 'Saving...' : 'Save Exercise'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Exercise Details</TabsTrigger>
          <TabsTrigger value="code">Code & Solution</TabsTrigger>
          <TabsTrigger value="tests">Test Cases</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Exercise Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Exercise Title *</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="e.g., Array Sum Calculator"
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
                  placeholder="Brief description of the coding exercise..."
                  rows={2}
                />
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions *</Label>
                <Textarea
                  id="instructions"
                  {...form.register('instructions')}
                  placeholder="Detailed instructions for students. Explain the problem, requirements, and expected output..."
                  rows={6}
                  className={form.formState.errors.instructions ? 'border-red-500' : ''}
                />
                {form.formState.errors.instructions && (
                  <p className="text-sm text-red-600">{form.formState.errors.instructions.message}</p>
                )}
              </div>

              {/* Language Selection */}
              <div className="space-y-3">
                <Label>Programming Language *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PROGRAMMING_LANGUAGES.map((lang) => {
                    const isSelected = watchLanguage === lang.value
                    return (
                      <div
                        key={lang.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleLanguageChange(lang.value)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{lang.icon}</span>
                          <span className="font-medium">{lang.label}</span>
                        </div>
                        <p className="text-xs text-gray-600">{lang.description}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Points and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="points">Points *</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
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

        {/* Code & Solution Tab */}
        <TabsContent value="code" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                Code Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Starter Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Starter Code</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadTemplate}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Load Template
                  </Button>
                </div>
                <CodeEditor
                  value={form.watch('starterCode') || ''}
                  onChange={(value) => form.setValue('starterCode', value)}
                  language={watchLanguage.toLowerCase()}
                  placeholder="Enter starter code that students will begin with..."
                  height="200px"
                />
                <p className="text-sm text-gray-600">
                  This code will be pre-loaded in the student's editor
                </p>
              </div>

              {/* Solution Code */}
              <div className="space-y-2">
                <Label>Solution Code (Optional)</Label>
                <CodeEditor
                  value={form.watch('solution') || ''}
                  onChange={(value) => form.setValue('solution', value)}
                  language={watchLanguage.toLowerCase()}
                  placeholder="Enter the complete solution..."
                  height="200px"
                />
                <p className="text-sm text-gray-600">
                  Hidden solution for instructor reference and auto-grading
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Cases Tab */}
        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Test Cases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {testCaseFields.length === 0 ? (
                <div className="text-center py-8">
                  <TestTube className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No test cases added yet</p>
                  <Button type="button" onClick={addTestCase} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test Case
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {testCaseFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Test Case {index + 1}</h4>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={form.watch(`testCases.${index}.isHidden`)}
                              onCheckedChange={(checked) => form.setValue(`testCases.${index}.isHidden`, checked)}
                            />
                            <Label className="text-sm">Hidden</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTestCase(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Input</Label>
                            <Textarea
                              {...form.register(`testCases.${index}.input`)}
                              placeholder="Input parameters or data..."
                              rows={3}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Expected Output</Label>
                            <Textarea
                              {...form.register(`testCases.${index}.expectedOutput`)}
                              placeholder="Expected result..."
                              rows={3}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                              {...form.register(`testCases.${index}.description`)}
                              placeholder="Brief description of this test..."
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Points</Label>
                            <Input
                              type="number"
                              min="0"
                              {...form.register(`testCases.${index}.points`, { valueAsNumber: true })}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button type="button" onClick={addTestCase} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Test Case
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Hints Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Hints (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hintFields.length === 0 ? (
                <div className="text-center py-6">
                  <Lightbulb className="w-6 h-6 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No hints added yet</p>
                  <Button type="button" onClick={addHint} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hint
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {hintFields.map((field, index) => (
                      <div key={field.id} className="p-3 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">Hint {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHint(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2 space-y-2">
                            <Label>Hint Content</Label>
                            <Textarea
                              {...form.register(`hints.${index}.content`)}
                              placeholder="Helpful hint for students..."
                              rows={2}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Reveal After Attempts</Label>
                            <Input
                              type="number"
                              min="0"
                              {...form.register(`hints.${index}.revealAfterAttempts`, { valueAsNumber: true })}
                              placeholder="0"
                            />
                            <p className="text-xs text-gray-600">0 = always visible</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button type="button" onClick={addHint} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Hint
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Execution Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Allow Code Execution */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Code Execution</Label>
                  <p className="text-sm text-gray-600">Enable real-time code execution in browser</p>
                </div>
                <Switch
                  checked={form.watch('allowExecution')}
                  onCheckedChange={(checked) => form.setValue('allowExecution', checked)}
                />
              </div>

              {/* Execution Limits */}
              {watchAllowExecution && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Execution Limits</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <Input
                          id="timeLimit"
                          type="number"
                          min="5"
                          max="300"
                          {...form.register('timeLimit', { valueAsNumber: true })}
                        />
                      </div>
                      <p className="text-xs text-blue-700">Maximum execution time per run</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="memoryLimit">Memory Limit (MB)</Label>
                      <div className="flex items-center gap-2">
                        <Memory className="w-4 h-4 text-gray-500" />
                        <Input
                          id="memoryLimit"
                          type="number"
                          min="16"
                          max="512"
                          {...form.register('memoryLimit', { valueAsNumber: true })}
                        />
                      </div>
                      <p className="text-xs text-blue-700">Maximum memory usage</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Settings */}
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Exercise Behavior</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Show Solution Button</Label>
                    <p className="text-sm text-gray-600">Allow students to view the solution</p>
                  </div>
                  <Switch
                    checked={form.watch('showSolution')}
                    onCheckedChange={(checked) => form.setValue('showSolution', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Multiple Submissions</Label>
                    <p className="text-sm text-gray-600">Allow students to submit multiple times</p>
                  </div>
                  <Switch
                    checked={form.watch('allowMultipleSubmissions')}
                    onCheckedChange={(checked) => form.setValue('allowMultipleSubmissions', checked)}
                  />
                </div>
              </div>

              {/* Time Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  {...form.register('duration', { valueAsNumber: true })}
                />
                <p className="text-sm text-gray-600">Estimated time to complete this exercise</p>
              </div>
            </CardContent>
          </Card>

          {/* Code Quality Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Code Quality & Concepts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Important Concepts */}
              <div className="space-y-2">
                <Label>Important Concepts (Optional)</Label>
                <Textarea
                  placeholder="List key programming concepts this exercise covers (one per line)..."
                  rows={3}
                  onChange={(e) => {
                    const concepts = e.target.value.split('\n').filter(line => line.trim())
                    form.setValue('importantConcepts', concepts)
                  }}
                />
                <p className="text-sm text-gray-600">
                  e.g., loops, arrays, recursion, algorithms
                </p>
              </div>

              {/* Code Template */}
              <div className="space-y-2">
                <Label>Code Template Notes</Label>
                <Textarea
                  {...form.register('codeTemplate')}
                  placeholder="Additional notes about code structure, style requirements, etc..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Exercise Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Language</Label>
                  <p className="font-medium">{PROGRAMMING_LANGUAGES.find(l => l.value === watchLanguage)?.label}</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Test Cases</Label>
                  <p className="font-medium">{testCaseFields.length} cases</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Hints</Label>
                  <p className="font-medium">{hintFields.length} hints</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Execution</Label>
                  <p className="font-medium">{watchAllowExecution ? 'Enabled' : 'Disabled'}</p>
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
InteractiveCodeBuilder.displayName = 'InteractiveCodeBuilder'

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function CodeEditor({ value, onChange, language, placeholder, height = '150px' }: CodeEditorProps) {
  return (
    <div className={`border rounded-lg overflow-hidden`} style={{ height }}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`font-mono text-sm resize-none border-none focus:ring-0 w-full h-full`}
        style={{ height: '100%' }}
      />
    </div>
  )
}

function TestCaseEditor({ testCases, onUpdate, language }: TestCaseEditorProps) {
  const addTestCase = () => {
    onUpdate([...testCases, {
      id: generateTestCaseId(),
      input: '',
      expectedOutput: '',
      description: '',
      isHidden: false,
      points: 1
    }])
  }

  const updateTestCase = (index: number, field: string, value: any) => {
    const updated = testCases.map((testCase, i) =>
      i === index ? { ...testCase, [field]: value } : testCase
    )
    onUpdate(updated)
  }

  const removeTestCase = (index: number) => {
    onUpdate(testCases.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {testCases.map((testCase, index) => (
        <div key={testCase.id} className="p-3 border rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Test Case {index + 1}</h4>
            <div className="flex items-center gap-2">
              <Switch
                checked={testCase.isHidden}
                onCheckedChange={(checked) => updateTestCase(index, 'isHidden', checked)}
              />
              <Label className="text-sm">Hidden</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTestCase(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Input</Label>
              <Textarea
                value={testCase.input}
                onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                placeholder="Input data..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Expected Output</Label>
              <Textarea
                value={testCase.expectedOutput}
                onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                placeholder="Expected result..."
                rows={2}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Input
              placeholder="Description"
              value={testCase.description}
              onChange={(e) => updateTestCase(index, 'description', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Points"
              value={testCase.points}
              onChange={(e) => updateTestCase(index, 'points', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      ))}
      
      <Button type="button" onClick={addTestCase} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add Test Case
      </Button>
    </div>
  )
}

// =================================================================
// 🎯 EXPORTS - Arctic Siberia Export Standard
// =================================================================

export default InteractiveCodeBuilder
export { CodeEditor, TestCaseEditor, type InteractiveCodeBuilderProps }