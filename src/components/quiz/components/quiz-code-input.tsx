// File: src/components/quiz/components/quiz-code-input.tsx

'use client'

// ✅ FIXED: Framework & Core Imports
import React, { useState, useEffect, useCallback } from 'react'

// ✅ FIXED: UI Components menggunakan barrel imports dari index.ts
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Badge,
  Alert,
  AlertDescription
} from '@/components/ui'

// Feature Components
import { QuizProgress } from '../shared/quiz-progress'

// Icons
import { 
  CheckCircle2, 
  Code, 
  Copy, 
  Play, 
  RotateCcw, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react'

// External Libraries  
import { toast } from 'sonner'

// Local Utilities
import { cn } from '@/lib/utils'

// Types
import type { 
  CodeInputQuestion, 
  QuizAnswer, 
  QuizAttemptResult,
  ProgrammingLanguage 
} from '../types'

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface QuizCodeInputProps {
  question: CodeInputQuestion
  questionIndex: number
  totalQuestions: number
  value?: string
  onChange: (value: string) => void
  onSubmit: (answer: QuizAnswer) => void
  isSubmitted?: boolean
  result?: QuizAttemptResult
  showCorrect?: boolean
  timeLimit?: number
  className?: string
}

interface CodeExecutionResult {
  success: boolean
  output?: string
  error?: string
  executionTime?: number
  testsPassed?: number
  totalTests?: number
}

interface CodeTemplate {
  language: ProgrammingLanguage
  template: string
  placeholder: string
}

// =================================================================
// 🎯 CONSTANTS & CONFIGURATIONS
// =================================================================

const PROGRAMMING_LANGUAGES: ProgrammingLanguage[] = [
  'javascript',
  'python',
  'java',
  'cpp',
  'typescript',
  'go',
  'rust',
  'php'
]

const LANGUAGE_LABELS: Record<ProgrammingLanguage, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  typescript: 'TypeScript',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP'
}

const CODE_TEMPLATES: Record<ProgrammingLanguage, CodeTemplate> = {
  javascript: {
    language: 'javascript',
    template: 'function solution() {\n  // Write your code here\n  \n}',
    placeholder: 'Write your JavaScript solution here...'
  },
  python: {
    language: 'python',
    template: 'def solution():\n    # Write your code here\n    pass',
    placeholder: 'Write your Python solution here...'
  },
  java: {
    language: 'java',
    template: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}',
    placeholder: 'Write your Java solution here...'
  },
  cpp: {
    language: 'cpp',
    template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}',
    placeholder: 'Write your C++ solution here...'
  },
  typescript: {
    language: 'typescript',
    template: 'function solution(): any {\n  // Write your code here\n  \n}',
    placeholder: 'Write your TypeScript solution here...'
  },
  go: {
    language: 'go',
    template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your code here\n}',
    placeholder: 'Write your Go solution here...'
  },
  rust: {
    language: 'rust',
    template: 'fn main() {\n    // Write your code here\n}',
    placeholder: 'Write your Rust solution here...'
  },
  php: {
    language: 'php',
    template: '<?php\n// Write your code here\n?>',
    placeholder: 'Write your PHP solution here...'
  }
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const getLanguageClass = (language: ProgrammingLanguage): string => {
  const languageClasses: Record<ProgrammingLanguage, string> = {
    javascript: 'text-yellow-600 bg-yellow-50',
    python: 'text-blue-600 bg-blue-50',
    java: 'text-red-600 bg-red-50',
    cpp: 'text-purple-600 bg-purple-50',
    typescript: 'text-blue-700 bg-blue-50',
    go: 'text-cyan-600 bg-cyan-50',
    rust: 'text-orange-600 bg-orange-50',
    php: 'text-indigo-600 bg-indigo-50'
  }
  return languageClasses[language] || 'text-gray-600 bg-gray-50'
}

const formatExecutionTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const validateCode = (code: string, language: ProgrammingLanguage): string[] => {
  const errors: string[] = []
  
  if (!code.trim()) {
    errors.push('Code cannot be empty')
    return errors
  }

  // Basic syntax validation based on language
  switch (language) {
    case 'javascript':
    case 'typescript':
      if (!code.includes('function') && !code.includes('=>')) {
        errors.push('Code should contain at least one function')
      }
      break
    case 'python':
      if (!code.includes('def') && !code.includes('class')) {
        errors.push('Code should contain at least one function or class definition')
      }
      break
    case 'java':
      if (!code.includes('class')) {
        errors.push('Java code should contain at least one class')
      }
      break
    case 'cpp':
      if (!code.includes('main')) {
        errors.push('C++ code should contain a main function')
      }
      break
  }

  return errors
}

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function LanguageSelector({ 
  language, 
  onLanguageChange, 
  disabled 
}: {
  language: ProgrammingLanguage
  onLanguageChange: (language: ProgrammingLanguage) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Language:</span>
      <Select 
        value={language} 
        onValueChange={onLanguageChange} 
        disabled={disabled}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PROGRAMMING_LANGUAGES.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {LANGUAGE_LABELS[lang]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function CodeStats({ 
  result, 
  executionTime 
}: {
  result?: CodeExecutionResult
  executionTime?: number
}) {
  if (!result) return null

  return (
    <div className="flex items-center gap-4 text-sm">
      {result.success && (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Executed Successfully
        </Badge>
      )}
      
      {!result.success && (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Execution Failed
        </Badge>
      )}

      {result.testsPassed !== undefined && result.totalTests && (
        <Badge className={cn(
          result.testsPassed === result.totalTests 
            ? "bg-green-100 text-green-800" 
            : "bg-orange-100 text-orange-800"
        )}>
          {result.testsPassed}/{result.totalTests} Tests Passed
        </Badge>
      )}

      {executionTime && (
        <span className="text-gray-600">
          {formatExecutionTime(executionTime)}
        </span>
      )}
    </div>
  )
}

function CodeOutput({ 
  result, 
  isVisible 
}: {
  result?: CodeExecutionResult
  isVisible: boolean
}) {
  if (!isVisible || !result) return null

  return (
    <div className="space-y-3">
      {result.output && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Output:</h4>
          <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
            {result.output}
          </pre>
        </div>
      )}

      {result.error && (
        <div>
          <h4 className="text-sm font-medium text-red-700 mb-2">Error:</h4>
          <pre className="bg-red-50 p-3 rounded-md text-sm text-red-800 overflow-x-auto">
            {result.error}
          </pre>
        </div>
      )}
    </div>
  )
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function QuizCodeInput({
  question,
  questionIndex,
  totalQuestions,
  value = '',
  onChange,
  onSubmit,
  isSubmitted = false,
  result,
  showCorrect = false,
  timeLimit,
  className
}: QuizCodeInputProps) {
  // State Management
  const [code, setCode] = useState(value)
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>(
    question.allowedLanguages?.[0] || 'javascript'
  )
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null)
  const [showOutput, setShowOutput] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Effects
  useEffect(() => {
    if (value !== code) {
      setCode(value)
    }
  }, [value])

  useEffect(() => {
    onChange(code)
  }, [code, onChange])

  useEffect(() => {
    if (question.template && question.template[selectedLanguage]) {
      setCode(question.template[selectedLanguage])
    } else {
      setCode(CODE_TEMPLATES[selectedLanguage].template)
    }
  }, [selectedLanguage, question.template])

  // Event Handlers
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode)
    setValidationErrors([])
  }, [])

  const handleLanguageChange = useCallback((language: ProgrammingLanguage) => {
    if (question.allowedLanguages && !question.allowedLanguages.includes(language)) {
      return
    }
    setSelectedLanguage(language)
  }, [question.allowedLanguages])

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Code copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }, [code])

  const handleResetCode = useCallback(() => {
    const template = question.template?.[selectedLanguage] || CODE_TEMPLATES[selectedLanguage].template
    setCode(template)
    setExecutionResult(null)
    setShowOutput(false)
    setValidationErrors([])
  }, [selectedLanguage, question.template])

  const handleRunCode = useCallback(async () => {
    const errors = validateCode(code, selectedLanguage)
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsExecuting(true)
    setValidationErrors([])

    try {
      // Simulate code execution (in real implementation, this would call a backend service)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockResult: CodeExecutionResult = {
        success: Math.random() > 0.3, // 70% success rate for demo
        output: 'Hello, World!\nTest completed successfully.',
        executionTime: Math.floor(Math.random() * 1000) + 100,
        testsPassed: Math.floor(Math.random() * 5) + 3,
        totalTests: 5
      }

      if (!mockResult.success) {
        mockResult.error = 'SyntaxError: Unexpected token at line 3'
        mockResult.output = undefined
      }

      setExecutionResult(mockResult)
      setShowOutput(true)
      
      if (mockResult.success) {
        toast.success('Code executed successfully!')
      } else {
        toast.error('Code execution failed')
      }
    } catch (error) {
      toast.error('Failed to execute code')
      setExecutionResult({
        success: false,
        error: 'Network error: Unable to execute code'
      })
      setShowOutput(true)
    } finally {
      setIsExecuting(false)
    }
  }, [code, selectedLanguage])

  const handleSubmit = useCallback(() => {
    const errors = validateCode(code, selectedLanguage)
    if (errors.length > 0) {
      setValidationErrors(errors)
      toast.error('Please fix the validation errors before submitting')
      return
    }

    const answer: QuizAnswer = {
      questionId: question.id,
      type: 'code_input',
      answer: code,
      metadata: {
        language: selectedLanguage,
        executionResult,
        submittedAt: new Date().toISOString()
      }
    }

    onSubmit(answer)
    toast.success('Code submitted successfully!')
  }, [code, selectedLanguage, executionResult, question.id, onSubmit])

  // Computed Values
  const isCorrect = result?.isCorrect ?? false
  const allowedLanguages = question.allowedLanguages || PROGRAMMING_LANGUAGES
  const placeholder = question.placeholder || CODE_TEMPLATES[selectedLanguage].placeholder

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="w-5 h-5 text-blue-600" />
              <span>Question {questionIndex + 1}</span>
              <Badge className={getLanguageClass(selectedLanguage)}>
                {LANGUAGE_LABELS[selectedLanguage]}
              </Badge>
            </CardTitle>
            
            {timeLimit && (
              <QuizProgress 
                current={questionIndex + 1} 
                total={totalQuestions}
                timeLimit={timeLimit}
                className="mt-2"
              />
            )}
          </div>

          {isSubmitted && (
            <Badge className={isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Correct
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Incorrect
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {question.question}
          </p>
          
          {question.requirements && question.requirements.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {question.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {question.constraints && question.constraints.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Constraints:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {question.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>
          )}

          {question.examples && question.examples.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Examples:</h4>
              <div className="space-y-3">
                {question.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-gray-500">Input:</span>
                        <pre className="text-sm mt-1">{example.input}</pre>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Expected Output:</span>
                        <pre className="text-sm mt-1">{example.output}</pre>
                      </div>
                    </div>
                    {example.explanation && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs font-medium text-gray-500">Explanation:</span>
                        <p className="text-sm text-gray-600 mt-1">{example.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Language Selector & Controls */}
        <div className="flex items-center justify-between">
          <LanguageSelector
            language={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            disabled={isSubmitted}
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              disabled={!code.trim()}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetCode}
              disabled={isSubmitted}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRunCode}
              disabled={isSubmitted || isExecuting || !code.trim()}
            >
              <Play className="w-4 h-4 mr-1" />
              {isExecuting ? 'Running...' : 'Run'}
            </Button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="space-y-3">
          <Textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder={placeholder}
            disabled={isSubmitted}
            rows={12}
            className="font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
            style={{ 
              fontSize: '14px',
              lineHeight: '1.5',
              tabSize: 2
            }}
          />

          {/* Execution Stats */}
          <CodeStats result={executionResult} executionTime={executionResult?.executionTime} />
        </div>

        {/* Code Output */}
        <CodeOutput result={executionResult} isVisible={showOutput} />

        {/* Correct Answer (Only shown when showCorrect is true) */}
        {showCorrect && question.correctAnswer && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-800 mb-2">Correct Solution:</h4>
            <pre className="bg-white p-3 rounded text-sm overflow-x-auto text-green-900 border border-green-200">
              {question.correctAnswer}
            </pre>
          </div>
        )}

        {/* Explanation */}
        {isSubmitted && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Explanation:</h4>
            <p className="text-sm text-blue-700">{question.explanation}</p>
          </div>
        )}

        {/* Submit Button */}
        {!isSubmitted && (
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={!code.trim() || validationErrors.length > 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Answer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Component Display Name
QuizCodeInput.displayName = 'QuizCodeInput'

// =================================================================
// 🎯 EXPORTS
// =================================================================

export default QuizCodeInput
export { 
  LanguageSelector, 
  CodeStats, 
  CodeOutput,
  getLanguageClass,
  formatExecutionTime,
  validateCode,
  type QuizCodeInputProps,
  type CodeExecutionResult,
  type CodeTemplate
}