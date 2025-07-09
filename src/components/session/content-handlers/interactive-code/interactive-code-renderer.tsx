// File: src/components/session/content-handlers/interactive-code/interactive-code-renderer.tsx

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
  AvatarImage
} from '@/components/ui'

// ✅ Icons - Arctic Siberia Import Standard
import {
  Play,
  Square,
  RotateCcw,
  Save,
  Send,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Code2,
  Terminal,
  Lightbulb,
  TestTube,
  Target,
  TrendingUp,
  Award,
  AlertTriangle,
  Info,
  Settings,
  Maximize,
  Minimize,
  RefreshCw,
  FileCode,
  Bug
} from 'lucide-react'

// ✅ Session Types - Arctic Siberia Import Standard
import { 
  InteractiveCodeContent,
  ContentType 
} from '@/components/session/types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const submissionSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  language: z.string(),
  notes: z.string().optional()
})

type SubmissionFormData = z.infer<typeof submissionSchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface InteractiveCodeRendererProps {
  content: InteractiveCodeContent
  onSubmit?: (submission: CodeSubmission) => void
  onSaveDraft?: (draft: Partial<CodeSubmission>) => void
  onTestRun?: (code: string, testCase: any) => Promise<TestResult>
  existingSubmission?: CodeSubmission
  isReadOnly?: boolean
  showSolution?: boolean
  className?: string
}

interface CodeSubmission {
  id: string
  exerciseId: string
  studentId: string
  studentName: string
  code: string
  language: string
  submittedAt: Date
  status: 'DRAFT' | 'SUBMITTED' | 'GRADED' | 'PASSED' | 'FAILED'
  score?: number
  totalTests: number
  passedTests: number
  executionTime?: number
  memoryUsage?: number
  attempts: number
  hintsUsed: string[]
  testResults: TestResult[]
  feedback?: string
  isLate: boolean
}

interface TestResult {
  id: string
  testCaseId: string
  input: string
  expectedOutput: string
  actualOutput: string
  passed: boolean
  executionTime: number
  memoryUsage: number
  errorMessage?: string
  points: number
  isHidden: boolean
}

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  readOnly?: boolean
  height?: string
  showLineNumbers?: boolean
  fontSize?: number
}

interface ExecutionResultProps {
  results: TestResult[]
  isRunning: boolean
  totalScore: number
  maxScore: number
}

interface HintSystemProps {
  hints: Array<{
    id: string
    content: string
    order: number
    revealAfterAttempts: number
  }>
  attempts: number
  usedHints: string[]
  onHintUse: (hintId: string) => void
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generateSubmissionId = (): string => {
  return `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const getLanguageIcon = (language: string) => {
  const icons = {
    JAVASCRIPT: '🟨',
    PYTHON: '🐍',
    JAVA: '☕',
    CPP: '⚡',
    HTML_CSS: '🌐',
    SQL: '🗄️'
  }
  return icons[language as keyof typeof icons] || '💻'
}

const formatExecutionTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const formatMemoryUsage = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

const calculateScore = (testResults: TestResult[]): { score: number; maxScore: number } => {
  const passedPoints = testResults.filter(r => r.passed).reduce((sum, r) => sum + r.points, 0)
  const totalPoints = testResults.reduce((sum, r) => sum + r.points, 0)
  return { score: passedPoints, maxScore: totalPoints }
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function InteractiveCodeRenderer({
  content,
  onSubmit,
  onSaveDraft,
  onTestRun,
  existingSubmission,
  isReadOnly = false,
  showSolution = false,
  className = ''
}: InteractiveCodeRendererProps) {
  // ===============================================================
  // 🎯 STATE MANAGEMENT
  // ===============================================================
  
  const [code, setCode] = useState(existingSubmission?.code || content.codeData.starterCode || '')
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [currentTab, setCurrentTab] = useState('editor')
  const [attempts, setAttempts] = useState(existingSubmission?.attempts || 0)
  const [usedHints, setUsedHints] = useState<string[]>(existingSubmission?.hintsUsed || [])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [showSolutionCode, setShowSolutionCode] = useState(false)
  const [executionOutput, setExecutionOutput] = useState<string>('')
  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ===============================================================
  // 🎯 REFS
  // ===============================================================
  
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // ===============================================================
  // 🎯 COMPUTED VALUES
  // ===============================================================
  
  const { score, maxScore } = calculateScore(testResults)
  const passedTests = testResults.filter(r => r.passed).length
  const totalTests = testResults.length
  const hasSubmission = !!existingSubmission
  const canShowSolution = showSolution || (existingSubmission?.status === 'GRADED')
  const availableHints = content.codeData.hints?.filter(hint => 
    hint.revealAfterAttempts <= attempts
  ) || []

  // ===============================================================
  // 🎯 HANDLERS
  // ===============================================================
  
  const handleRunCode = useCallback(async () => {
    if (!content.codeData.allowExecution) return
    
    setIsRunning(true)
    setAttempts(prev => prev + 1)
    
    try {
      const results: TestResult[] = []
      
      for (const testCase of content.codeData.testCases || []) {
        try {
          const result = await onTestRun?.(code, testCase)
          if (result) {
            results.push(result)
          }
        } catch (error) {
          results.push({
            id: `result_${Date.now()}`,
            testCaseId: testCase.id,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            passed: false,
            executionTime: 0,
            memoryUsage: 0,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            points: testCase.points,
            isHidden: testCase.isHidden
          })
        }
      }
      
      setTestResults(results)
      setCurrentTab('results')
      
      // Simulate execution output
      const output = results.map(r => 
        r.passed ? `✓ Test passed: ${r.expectedOutput}` : `✗ Test failed: Expected ${r.expectedOutput}, got ${r.actualOutput}`
      ).join('\n')
      setExecutionOutput(output)
      
    } catch (error) {
      console.error('Error running code:', error)
      setExecutionOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
    }
  }, [code, content.codeData, onTestRun])

  const handleSaveDraft = useCallback(async () => {
    if (!onSaveDraft) return
    
    setIsDraftSaving(true)
    try {
      const draft: Partial<CodeSubmission> = {
        exerciseId: content.id,
        code,
        language: content.codeData.language,
        status: 'DRAFT',
        attempts,
        hintsUsed: usedHints
      }
      
      await onSaveDraft(draft)
    } catch (error) {
      console.error('Error saving draft:', error)
    } finally {
      setIsDraftSaving(false)
    }
  }, [content.id, content.codeData.language, code, attempts, usedHints, onSaveDraft])

  const handleSubmit = useCallback(async () => {
    if (!onSubmit) return
    
    setIsSubmitting(true)
    try {
      const submission: CodeSubmission = {
        id: existingSubmission?.id || generateSubmissionId(),
        exerciseId: content.id,
        studentId: 'current-student-id', // Would come from auth context
        studentName: 'Current Student', // Would come from auth context
        code,
        language: content.codeData.language,
        submittedAt: new Date(),
        status: passedTests === totalTests ? 'PASSED' : 'SUBMITTED',
        score,
        totalTests,
        passedTests,
        attempts,
        hintsUsed: usedHints,
        testResults,
        isLate: false // Would be calculated based on due date
      }
      
      await onSubmit(submission)
    } catch (error) {
      console.error('Error submitting code:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [content.id, content.codeData.language, code, score, totalTests, passedTests, attempts, usedHints, testResults, onSubmit, existingSubmission])

  const handleHintUse = useCallback((hintId: string) => {
    if (!usedHints.includes(hintId)) {
      setUsedHints(prev => [...prev, hintId])
    }
  }, [usedHints])

  const handleResetCode = useCallback(() => {
    setCode(content.codeData.starterCode || '')
    setTestResults([])
    setExecutionOutput('')
  }, [content.codeData.starterCode])

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(code)
  }, [code])

  // ===============================================================
  // 🎯 KEYBOARD SHORTCUTS
  // ===============================================================
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault()
            handleRunCode()
            break
          case 's':
            e.preventDefault()
            handleSaveDraft()
            break
          case '=':
            e.preventDefault()
            setFontSize(prev => Math.min(prev + 2, 24))
            break
          case '-':
            e.preventDefault()
            setFontSize(prev => Math.max(prev - 2, 10))
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleRunCode, handleSaveDraft])

  // ===============================================================
  // 🎯 RENDER
  // ===============================================================
  
  return (
    <div className={`space-y-6 ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6' : ''}`}>
      {/* Exercise Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">{getLanguageIcon(content.codeData.language)}</span>
                <Code2 className="w-5 h-5" />
                {content.title}
              </CardTitle>
              
              {content.description && (
                <p className="text-gray-600">{content.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm">
                <Badge variant={content.difficulty === 'hard' ? 'destructive' : 
                              content.difficulty === 'medium' ? 'default' : 'secondary'}>
                  {content.difficulty}
                </Badge>
                
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>{content.points} points</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{content.duration} min</span>
                </div>
                
                {content.codeData.timeLimit && (
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span>{content.codeData.timeLimit}s limit</span>
                  </div>
                )}
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
              
              {hasSubmission && (
                <div className="text-right text-sm">
                  <Badge className={existingSubmission?.status === 'PASSED' ? 'bg-green-100 text-green-800' : 
                                  existingSubmission?.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'}>
                    {existingSubmission?.status}
                  </Badge>
                  {existingSubmission?.score !== undefined && (
                    <div className="text-lg font-bold text-green-600 mt-1">
                      {existingSubmission.score}/{maxScore}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content.codeData.instructions || content.description || '' }} />
          </div>
          
          {/* Test Cases Preview */}
          {content.codeData.testCases && content.codeData.testCases.some(tc => !tc.isHidden) && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Sample Test Cases</h4>
              <div className="space-y-3">
                {content.codeData.testCases
                  .filter(tc => !tc.isHidden)
                  .slice(0, 2)
                  .map((testCase, index) => (
                    <div key={testCase.id} className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-blue-800">Input {index + 1}:</Label>
                        <pre className="bg-white p-2 rounded text-xs border">
                          {testCase.input || '(no input)'}
                        </pre>
                      </div>
                      <div>
                        <Label className="text-blue-800">Expected Output:</Label>
                        <pre className="bg-white p-2 rounded text-xs border">
                          {testCase.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Editor */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="w-5 h-5" />
                  Code Editor
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFontSize(prev => Math.max(prev - 2, 10))}
                  >
                    A-
                  </Button>
                  <span className="text-sm">{fontSize}px</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFontSize(prev => Math.min(prev + 2, 24))}
                  >
                    A+
                  </Button>
                  
                  <Separator orientation="vertical" className="h-6" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCode}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetCode}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={content.codeData.language.toLowerCase()}
                readOnly={isReadOnly}
                height="400px"
                fontSize={fontSize}
                showLineNumbers={true}
              />
            </CardContent>
            
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Attempts: {attempts}</span>
                  {testResults.length > 0 && (
                    <span>• {passedTests}/{totalTests} tests passed</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {!isReadOnly && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveDraft}
                        disabled={isDraftSaving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isDraftSaving ? 'Saving...' : 'Save Draft'}
                      </Button>
                      
                      {content.codeData.allowExecution && (
                        <Button
                          onClick={handleRunCode}
                          disabled={isRunning}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {isRunning ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          {isRunning ? 'Running...' : 'Run Code'}
                        </Button>
                      )}
                      
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || testResults.length === 0}
                        className="flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Keyboard Shortcuts */}
              <div className="mt-2 text-xs text-gray-500">
                <span>Shortcuts: Ctrl+Enter (Run) • Ctrl+S (Save) • Ctrl+/- (Font Size)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExecutionResult
                  results={testResults}
                  isRunning={isRunning}
                  totalScore={score}
                  maxScore={maxScore}
                />
              </CardContent>
            </Card>
          )}

          {/* Console Output */}
          {executionOutput && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Console Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-40">
                  {executionOutput}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Hints */}
          {availableHints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Hints ({usedHints.length}/{availableHints.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HintSystem
                  hints={availableHints}
                  attempts={attempts}
                  usedHints={usedHints}
                  onHintUse={handleHintUse}
                />
              </CardContent>
            </Card>
          )}

          {/* Solution */}
          {canShowSolution && content.codeData.solution && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Solution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSolutionCode(!showSolutionCode)}
                  className="w-full mb-3"
                >
                  {showSolutionCode ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide Solution
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Show Solution
                    </>
                  )}
                </Button>
                
                {showSolutionCode && (
                  <div className="border rounded">
                    <CodeEditor
                      value={content.codeData.solution}
                      onChange={() => {}}
                      language={content.codeData.language.toLowerCase()}
                      readOnly={true}
                      height="200px"
                      fontSize={12}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ✅ Arctic Siberia Export Standard
InteractiveCodeRenderer.displayName = 'InteractiveCodeRenderer'

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function CodeEditor({ 
  value, 
  onChange, 
  language, 
  readOnly = false, 
  height = '300px',
  fontSize = 14,
  showLineNumbers = false 
}: CodeEditorProps) {
  return (
    <div className="relative" style={{ height }}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className="font-mono resize-none border-none focus:ring-0 w-full h-full"
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: '1.5',
          height: '100%'
        }}
      />
    </div>
  )
}

function ExecutionResult({ results, isRunning, totalScore, maxScore }: ExecutionResultProps) {
  const passedTests = results.filter(r => r.passed).length
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Score Summary */}
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold">
          {totalScore}/{maxScore}
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="text-sm text-gray-600">
          {passedTests}/{results.length} tests passed ({percentage.toFixed(1)}%)
        </div>
      </div>

      {/* Individual Test Results */}
      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={result.id}
            className={`p-3 rounded border ${
              result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {result.passed ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="font-medium text-sm">
                  Test {index + 1} {result.isHidden && '(Hidden)'}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {result.points} pts
              </span>
            </div>
            
            {!result.passed && (
              <div className="text-xs space-y-1">
                <div>Expected: <code className="bg-white px-1 rounded">{result.expectedOutput}</code></div>
                <div>Got: <code className="bg-white px-1 rounded">{result.actualOutput}</code></div>
                {result.errorMessage && (
                  <div className="text-red-600">Error: {result.errorMessage}</div>
                )}
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-2">
              {formatExecutionTime(result.executionTime)} • {formatMemoryUsage(result.memoryUsage)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HintSystem({ hints, attempts, usedHints, onHintUse }: HintSystemProps) {
  const availableHints = hints.filter(hint => hint.revealAfterAttempts <= attempts)
  
  return (
    <div className="space-y-3">
      {availableHints.map((hint, index) => {
        const isUsed = usedHints.includes(hint.id)
        
        return (
          <div key={hint.id} className="border rounded-lg">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Hint {index + 1}</span>
                {!isUsed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onHintUse(hint.id)}
                  >
                    <Lightbulb className="w-3 h-3 mr-1" />
                    Reveal
                  </Button>
                )}
              </div>
              
              {isUsed ? (
                <div className="text-sm text-gray-700 bg-yellow-50 p-2 rounded">
                  {hint.content}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Click "Reveal" to show this hint
                </div>
              )}
            </div>
          </div>
        )
      })}
      
                {hints.length > availableHints.length && (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          {hints.length - availableHints.length} more hints available after more attempts
        </div>
      )}
    </div>
  )
}

// =================================================================
// 🎯 EXPORTS - Arctic Siberia Export Standard
// =================================================================

export default InteractiveCodeRenderer
export { 
  CodeEditor, 
  ExecutionResult, 
  HintSystem, 
  type InteractiveCodeRendererProps 
}