// File: src/components/quiz/builder/code-input-builder.tsx

'use client'

import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Textarea,
  Label,
  Alert,
  AlertDescription,
  Badge,
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui'
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Code,
  Play,
  Eye,
  Settings,
  FileCode,
  Terminal,
  Lightbulb,
  Target,
  Clock
} from 'lucide-react'

interface TestCase {
  id: string
  input: string
  expectedOutput: string
  description?: string
  isHidden?: boolean
}

interface CodeInputQuestion {
  id: string
  type: 'code_input'
  question: string
  description?: string
  language: string
  starterCode?: string
  solutionCode?: string
  testCases: TestCase[]
  timeLimit?: number
  memoryLimit?: number
  points?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  hints?: string[]
}

interface CodeInputBuilderProps {
  initialData?: CodeInputQuestion
  onSave: (question: CodeInputQuestion) => void
  onCancel: () => void
}

const PROGRAMMING_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', syntax: 'js' },
  { value: 'python', label: 'Python', syntax: 'py' },
  { value: 'java', label: 'Java', syntax: 'java' },
  { value: 'cpp', label: 'C++', syntax: 'cpp' },
  { value: 'c', label: 'C', syntax: 'c' },
  { value: 'csharp', label: 'C#', syntax: 'cs' },
  { value: 'php', label: 'PHP', syntax: 'php' },
  { value: 'ruby', label: 'Ruby', syntax: 'rb' },
  { value: 'go', label: 'Go', syntax: 'go' },
  { value: 'rust', label: 'Rust', syntax: 'rs' }
]

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' }
]

export default function CodeInputBuilder({ 
  initialData, 
  onSave, 
  onCancel 
}: CodeInputBuilderProps) {
  const [question, setQuestion] = useState(initialData?.question || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [language, setLanguage] = useState(initialData?.language || 'javascript')
  const [starterCode, setStarterCode] = useState(initialData?.starterCode || '')
  const [solutionCode, setSolutionCode] = useState(initialData?.solutionCode || '')
  const [points, setPoints] = useState(initialData?.points || 10)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialData?.difficulty || 'medium')
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit || 30)
  const [memoryLimit, setMemoryLimit] = useState(initialData?.memoryLimit || 128)
  const [testCases, setTestCases] = useState<TestCase[]>(
    initialData?.testCases || [
      { id: '1', input: '', expectedOutput: '', description: 'Basic test case', isHidden: false }
    ]
  )
  const [hints, setHints] = useState<string[]>(initialData?.hints || [''])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('basic')

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      input: '',
      expectedOutput: '',
      description: `Test case ${testCases.length + 1}`,
      isHidden: false
    }
    setTestCases([...testCases, newTestCase])
  }

  const removeTestCase = (testCaseId: string) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter(tc => tc.id !== testCaseId))
    }
  }

  const updateTestCase = (testCaseId: string, field: keyof TestCase, value: any) => {
    setTestCases(testCases.map(tc => 
      tc.id === testCaseId 
        ? { ...tc, [field]: value }
        : tc
    ))
  }

  const addHint = () => {
    setHints([...hints, ''])
  }

  const removeHint = (index: number) => {
    if (hints.length > 1) {
      setHints(hints.filter((_, i) => i !== index))
    }
  }

  const updateHint = (index: number, value: string) => {
    setHints(hints.map((hint, i) => i === index ? value : hint))
  }

  const generateStarterCode = () => {
    const templates: Record<string, string> = {
      javascript: `function solution() {
    // Write your code here
    
}`,
      python: `def solution():
    # Write your code here
    pass`,
      java: `public class Solution {
    public static void main(String[] args) {
        // Write your code here
        
    }
}`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    
    return 0;
}`,
      c: `#include <stdio.h>

int main() {
    // Write your code here
    
    return 0;
}`,
      csharp: `using System;

class Program {
    static void Main() {
        // Write your code here
        
    }
}`,
      php: `<?php
// Write your code here

?>`,
      ruby: `# Write your code here

`,
      go: `package main

import "fmt"

func main() {
    // Write your code here
    
}`,
      rust: `fn main() {
    // Write your code here
    
}`
    }

    setStarterCode(templates[language] || '// Write your code here')
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate basic fields
    if (!question.trim()) {
      newErrors.question = 'Question is required'
    }

    if (!language) {
      newErrors.language = 'Programming language is required'
    }

    // Validate test cases
    let validTestCaseCount = 0
    testCases.forEach((testCase, index) => {
      if (!testCase.input.trim() && !testCase.expectedOutput.trim()) {
        newErrors[`testCase_${testCase.id}`] = 'Input and expected output are required'
      } else if (!testCase.input.trim()) {
        newErrors[`testCase_${testCase.id}_input`] = 'Input is required'
      } else if (!testCase.expectedOutput.trim()) {
        newErrors[`testCase_${testCase.id}_output`] = 'Expected output is required'
      } else {
        validTestCaseCount++
      }
    })

    if (validTestCaseCount === 0) {
      newErrors.testCases = 'At least one valid test case is required'
    }

    // Validate points
    if (points < 1) {
      newErrors.points = 'Points must be at least 1'
    }

    // Validate time limit
    if (timeLimit < 1) {
      newErrors.timeLimit = 'Time limit must be at least 1 second'
    }

    // Validate memory limit
    if (memoryLimit < 1) {
      newErrors.memoryLimit = 'Memory limit must be at least 1 MB'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    const codeInputQuestion: CodeInputQuestion = {
      id: initialData?.id || Date.now().toString(),
      type: 'code_input',
      question: question.trim(),
      description: description.trim(),
      language,
      starterCode: starterCode.trim(),
      solutionCode: solutionCode.trim(),
      testCases: testCases.filter(tc => tc.input.trim() && tc.expectedOutput.trim()),
      timeLimit,
      memoryLimit,
      points,
      difficulty,
      hints: hints.filter(hint => hint.trim()).map(hint => hint.trim())
    }

    onSave(codeInputQuestion)
  }

  const selectedLanguage = PROGRAMMING_LANGUAGES.find(lang => lang.value === language)
  const selectedDifficulty = DIFFICULTY_LEVELS.find(diff => diff.value === difficulty)
  const validTestCases = testCases.filter(tc => tc.input.trim() && tc.expectedOutput.trim())

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-500" />
            Code Input Question Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="code">Code Setup</TabsTrigger>
              <TabsTrigger value="tests">Test Cases</TabsTrigger>
              <TabsTrigger value="hints">Hints & Settings</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Question */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="question">Problem Title *</Label>
                  <Input
                    id="question"
                    placeholder="Enter the coding problem title (e.g., 'Two Sum Problem')"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className={errors.question ? 'border-red-500' : ''}
                  />
                  {errors.question && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.question}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Problem Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the problem, constraints, and examples..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                  />
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label>Programming Language *</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className={errors.language ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAMMING_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          <div className="flex items-center gap-2">
                            <FileCode className="w-4 h-4" />
                            {lang.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.language && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.language}
                    </p>
                  )}
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((diff) => (
                        <SelectItem key={diff.value} value={diff.value}>
                          <Badge variant="outline" className={diff.color}>
                            {diff.label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Points */}
                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 10)}
                    className={errors.points ? 'border-red-500' : ''}
                  />
                  {errors.points && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.points}
                    </p>
                  )}
                </div>

                {/* Limits */}
                <div className="space-y-2">
                  <Label>Time Limit (seconds)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                    className={errors.timeLimit ? 'border-red-500' : ''}
                  />
                  {errors.timeLimit && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.timeLimit}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Code Setup Tab */}
            <TabsContent value="code" className="space-y-6">
              <div className="space-y-6">
                {/* Starter Code */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Starter Code (Template for students)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateStarterCode}
                    >
                      <Terminal className="w-4 h-4 mr-1" />
                      Generate Template
                    </Button>
                  </div>
                  <Textarea
                    placeholder={`Enter starter code for ${selectedLanguage?.label}...`}
                    value={starterCode}
                    onChange={(e) => setStarterCode(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                {/* Solution Code */}
                <div className="space-y-2">
                  <Label>Solution Code (Your reference solution)</Label>
                  <Textarea
                    placeholder={`Enter your solution code in ${selectedLanguage?.label}...`}
                    value={solutionCode}
                    onChange={(e) => setSolutionCode(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    This code won't be visible to students but helps validate test cases
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Test Cases Tab */}
            <TabsContent value="tests" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Test Cases</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTestCase}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Test Case
                  </Button>
                </div>

                {errors.testCases && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{errors.testCases}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  {testCases.map((testCase, index) => (
                    <Card key={testCase.id} className={errors[`testCase_${testCase.id}`] ? 'border-red-500' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Test Case {index + 1}</CardTitle>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`hidden_${testCase.id}`}
                                checked={testCase.isHidden}
                                onChange={(e) => updateTestCase(testCase.id, 'isHidden', e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={`hidden_${testCase.id}`} className="text-xs text-gray-600">
                                Hidden
                              </Label>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTestCase(testCase.id)}
                              disabled={testCases.length <= 1}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Description */}
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            placeholder="Brief description of this test case..."
                            value={testCase.description || ''}
                            onChange={(e) => updateTestCase(testCase.id, 'description', e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Input */}
                          <div className="space-y-2">
                            <Label>Input</Label>
                            <Textarea
                              placeholder="Enter test input..."
                              value={testCase.input}
                              onChange={(e) => updateTestCase(testCase.id, 'input', e.target.value)}
                              rows={3}
                              className={`font-mono text-sm ${
                                errors[`testCase_${testCase.id}_input`] ? 'border-red-500' : ''
                              }`}
                            />
                          </div>

                          {/* Expected Output */}
                          <div className="space-y-2">
                            <Label>Expected Output</Label>
                            <Textarea
                              placeholder="Enter expected output..."
                              value={testCase.expectedOutput}
                              onChange={(e) => updateTestCase(testCase.id, 'expectedOutput', e.target.value)}
                              rows={3}
                              className={`font-mono text-sm ${
                                errors[`testCase_${testCase.id}_output`] ? 'border-red-500' : ''
                              }`}
                            />
                          </div>
                        </div>

                        {/* Error Display */}
                        {errors[`testCase_${testCase.id}`] && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors[`testCase_${testCase.id}`]}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Hints & Settings Tab */}
            <TabsContent value="hints" className="space-y-6">
              <div className="space-y-6">
                {/* Hints */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Hints (Optional)
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addHint}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Hint
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {hints.map((hint, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-1">
                          <Input
                            placeholder={`Hint ${index + 1}...`}
                            value={hint}
                            onChange={(e) => updateHint(index, e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHint(index)}
                          disabled={hints.length <= 1}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Memory Limit */}
                <div className="space-y-2">
                  <Label>Memory Limit (MB)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={memoryLimit}
                    onChange={(e) => setMemoryLimit(parseInt(e.target.value) || 128)}
                    className={`w-32 ${errors.memoryLimit ? 'border-red-500' : ''}`}
                  />
                  {errors.memoryLimit && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.memoryLimit}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          {/* Summary */}
          {question && validTestCases.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Question Summary
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <p className="font-medium">{question}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileCode className="w-3 h-3" />
                    {selectedLanguage?.label}
                  </Badge>
                  {selectedDifficulty && (
                    <Badge variant="outline" className={selectedDifficulty.color}>
                      {selectedDifficulty.label}
                    </Badge>
                  )}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {points} points
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeLimit}s limit
                  </Badge>
                  <Badge variant="outline">
                    {validTestCases.length} test cases
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!question.trim() || validTestCases.length === 0}
            >
              Save Question
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}