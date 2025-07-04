// File: src/app/quiz-showcase/page.tsx

'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Import individual quiz components
import { 
  QuizMCQ, 
  QuizTrueFalse, 
  QuizEssay, 
  QuizCheckbox,
  QuizFillBlank,
  QuizMatching,
  QuizDragDrop,
  QuizCodeInput
} from '@/components/quiz/components'

// Import individual builders
import {
  MCQBuilder,
  TrueFalseBuilder,
  EssayBuilder,
  CheckboxBuilder,
  FillBlankBuilder,
  MatchingBuilder,
  DragDropBuilder,
  CodeInputBuilder
} from '@/components/quiz/builder'

// Import shared components
import {
  QuizProgress,
  QuizTimer,
  QuestionNavigation,
  QuizResult
} from '@/components/quiz/shared'

export default function QuizShowcasePage() {
  const [activeTab, setActiveTab] = useState('components')
  const [testData, setTestData] = useState<any>({})

  // Sample data untuk testing berbagai components
  const sampleData = {
    mcq: {
      id: 'mcq-1',
      question: 'Apa framework JavaScript yang paling populer?',
      options: ['React', 'Vue', 'Angular', 'Svelte'],
      selectedAnswer: null,
      onAnswerChange: (answer: number) => console.log('MCQ Answer:', answer)
    },
    trueFalse: {
      id: 'tf-1',
      question: 'Next.js adalah framework untuk React',
      selectedAnswer: null,
      onAnswerChange: (answer: boolean) => console.log('True/False Answer:', answer)
    },
    essay: {
      id: 'essay-1',
      question: 'Jelaskan perbedaan antara SSR dan CSR dalam web development',
      answer: '',
      onAnswerChange: (answer: string) => console.log('Essay Answer:', answer)
    },
    checkbox: {
      id: 'checkbox-1',
      question: 'Pilih semua CSS frameworks berikut:',
      options: ['Tailwind CSS', 'Bootstrap', 'React', 'Bulma'],
      selectedAnswers: [],
      onAnswerChange: (answers: number[]) => console.log('Checkbox Answers:', answers)
    },
    progress: {
      currentQuestion: 3,
      totalQuestions: 10,
      correctAnswers: 2
    },
    timer: {
      timeLimit: 300, // 5 minutes
      onTimeUp: () => console.log('Time is up!')
    },
    result: {
      score: 85,
      totalQuestions: 10,
      correctAnswers: 8,
      incorrectAnswers: 2,
      timeSpent: 450 // seconds
    }
  }

  const componentSections = [
    {
      name: 'Quiz Components',
      items: [
        { name: 'Multiple Choice (MCQ)', component: 'mcq', icon: '🔘' },
        { name: 'True/False', component: 'trueFalse', icon: '✅' },
        { name: 'Essay', component: 'essay', icon: '📝' },
        { name: 'Checkbox', component: 'checkbox', icon: '☑️' },
        { name: 'Fill in Blank', component: 'fillBlank', icon: '📝' },
        { name: 'Matching', component: 'matching', icon: '🔗' },
        { name: 'Drag & Drop', component: 'dragDrop', icon: '🎯' },
        { name: 'Code Input', component: 'codeInput', icon: '💻' }
      ]
    },
    {
      name: 'Shared Components',
      items: [
        { name: 'Progress Bar', component: 'progress', icon: '📊' },
        { name: 'Timer', component: 'timer', icon: '⏱️' },
        { name: 'Navigation', component: 'navigation', icon: '🧭' },
        { name: 'Results', component: 'result', icon: '🏆' }
      ]
    }
  ]

  const renderComponent = (componentType: string) => {
    switch (componentType) {
      case 'mcq':
        return <QuizMCQ {...sampleData.mcq} />
      case 'trueFalse':
        return <QuizTrueFalse {...sampleData.trueFalse} />
      case 'essay':
        return <QuizEssay {...sampleData.essay} />
      case 'checkbox':
        return <QuizCheckbox {...sampleData.checkbox} />
      case 'progress':
        return <QuizProgress {...sampleData.progress} />
      case 'timer':
        return <QuizTimer {...sampleData.timer} />
      case 'result':
        return <QuizResult {...sampleData.result} />
      default:
        return (
          <div className="p-8 text-center text-gray-500">
            <p>Component "{componentType}" belum diimplementasikan</p>
            <Badge variant="outline" className="mt-2">
              Dalam Development
            </Badge>
          </div>
        )
    }
  }

  const renderBuilder = (builderType: string) => {
    const commonProps = {
      onSave: (data: any) => console.log(`${builderType} saved:`, data),
      onCancel: () => console.log(`${builderType} cancelled`)
    }

    switch (builderType) {
      case 'mcq':
        return <MCQBuilder {...commonProps} />
      case 'trueFalse':
        return <TrueFalseBuilder {...commonProps} />
      case 'essay':
        return <EssayBuilder {...commonProps} />
      case 'checkbox':
        return <CheckboxBuilder {...commonProps} />
      default:
        return (
          <div className="p-8 text-center text-gray-500">
            <p>Builder "{builderType}" belum diimplementasikan</p>
            <Badge variant="outline" className="mt-2">
              Dalam Development
            </Badge>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎨 Quiz Component Showcase
          </h1>
          <p className="text-gray-600">
            Testing ground untuk semua individual quiz components dan builders
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="components">🧩 Components</TabsTrigger>
            <TabsTrigger value="builders">🏗️ Builders</TabsTrigger>
            <TabsTrigger value="integration">🔄 Integration Test</TabsTrigger>
          </TabsList>

          {/* Components Tab */}
          <TabsContent value="components">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Component List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Components</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {componentSections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="border-b last:border-b-0">
                        <h3 className="text-sm font-semibold text-gray-700 p-4 bg-gray-50">
                          {section.name}
                        </h3>
                        {section.items.map((item, itemIndex) => (
                          <button
                            key={itemIndex}
                            onClick={() => setTestData({ type: item.component, data: sampleData[item.component as keyof typeof sampleData] })}
                            className="w-full text-left p-4 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                          >
                            <span className="mr-2">{item.icon}</span>
                            {item.name}
                          </button>
                        ))}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Component Display */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {testData.type ? `Testing: ${testData.type}` : 'Select a Component'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testData.type ? (
                      renderComponent(testData.type)
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <p>Pilih component dari sidebar untuk mulai testing</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Builders Tab */}
          <TabsContent value="builders">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Builder List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Builders</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {['mcq', 'trueFalse', 'essay', 'checkbox', 'fillBlank', 'matching', 'dragDrop', 'codeInput'].map((builder, index) => (
                      <button
                        key={index}
                        onClick={() => setTestData({ type: builder })}
                        className="w-full text-left p-4 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                      >
                        🏗️ {builder.charAt(0).toUpperCase() + builder.slice(1)} Builder
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Builder Display */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {testData.type ? `Testing: ${testData.type} Builder` : 'Select a Builder'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testData.type ? (
                      renderBuilder(testData.type)
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <p>Pilih builder dari sidebar untuk mulai testing</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Integration Test Tab */}
          <TabsContent value="integration">
            <Card>
              <CardHeader>
                <CardTitle>🔄 Integration Testing</CardTitle>
                <p className="text-sm text-gray-600">
                  Test full flow dari builder → component → result
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-4">Integration testing akan menguji:</p>
                  <ul className="text-left max-w-md mx-auto space-y-2">
                    <li>✅ Create quiz dengan builder</li>
                    <li>✅ Render quiz dengan renderer</li>
                    <li>✅ Submit answers</li>
                    <li>✅ Show results</li>
                    <li>✅ Data persistence</li>
                  </ul>
                  <Button className="mt-6">
                    Start Integration Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}