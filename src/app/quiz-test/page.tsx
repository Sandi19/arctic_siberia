// File: src/app/quiz-test/page.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

// Import komponen quiz yang sudah dibuat
import { QuizBuilder, QuizRenderer } from '@/components/quiz'
import type { Quiz, QuizQuestion } from '@/components/quiz/types'

export default function QuizTestPage() {
  const [mode, setMode] = useState<'builder' | 'renderer'>('builder')
  const [quizData, setQuizData] = useState<Quiz | null>(null)
  const [testResults, setTestResults] = useState<any>(null)

  // Sample quiz data untuk testing
  const sampleQuiz: Quiz = {
    id: 'test-quiz-1',
    title: 'Sample Quiz untuk Testing',
    description: 'Quiz ini dibuat untuk menguji semua komponen quiz',
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question: 'Apa ibukota Indonesia?',
        options: ['Jakarta', 'Bandung', 'Surabaya', 'Medan'],
        correctAnswer: 0,
        points: 10
      },
      {
        id: 'q2',
        type: 'true-false',
        question: 'JavaScript adalah bahasa pemrograman yang compiled.',
        correctAnswer: false,
        points: 5
      },
      {
        id: 'q3',
        type: 'essay',
        question: 'Jelaskan perbedaan antara React dan Vue.js!',
        points: 15
      },
      {
        id: 'q4',
        type: 'checkbox',
        question: 'Pilih semua framework CSS berikut:',
        options: ['Tailwind CSS', 'Bootstrap', 'React', 'Bulma'],
        correctAnswers: [0, 1, 3],
        points: 10
      }
    ],
    settings: {
      timeLimit: 1800, // 30 menit
      showResults: true,
      randomizeQuestions: false,
      allowRetake: true
    }
  }

  const handleQuizCreated = (quiz: Quiz) => {
    setQuizData(quiz)
    console.log('Quiz Created:', quiz)
  }

  const handleQuizCompleted = (results: any) => {
    setTestResults(results)
    console.log('Quiz Results:', results)
  }

  const resetTest = () => {
    setQuizData(null)
    setTestResults(null)
    setMode('builder')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Quiz Components Testing Lab
          </h1>
          <p className="text-gray-600">
            Halaman untuk menguji semua komponen quiz secara mandiri sebelum integrasi
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Quiz Builder Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={quizData ? 'default' : 'secondary'}>
                {quizData ? 'Quiz Created ✅' : 'No Quiz ⏳'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Quiz Renderer Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={mode === 'renderer' && quizData ? 'default' : 'secondary'}>
                {mode === 'renderer' && quizData ? 'Ready to Test ✅' : 'Waiting ⏳'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={testResults ? 'default' : 'secondary'}>
                {testResults ? 'Results Available ✅' : 'No Results ⏳'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-8">
          <Button 
            onClick={() => setMode('builder')}
            variant={mode === 'builder' ? 'default' : 'outline'}
          >
            🏗️ Test Quiz Builder
          </Button>
          
          <Button 
            onClick={() => setMode('renderer')}
            variant={mode === 'renderer' ? 'default' : 'outline'}
            disabled={!quizData}
          >
            ▶️ Test Quiz Renderer
          </Button>

          <Button 
            onClick={() => setQuizData(sampleQuiz)}
            variant="outline"
          >
            📄 Load Sample Quiz
          </Button>

          <Button 
            onClick={resetTest}
            variant="outline"
          >
            🔄 Reset Test
          </Button>
        </div>

        {/* Main Testing Area */}
        <Tabs value={mode} onValueChange={(value) => setMode(value as 'builder' | 'renderer')}>
          
          {/* Quiz Builder Testing */}
          <TabsContent value="builder">
            <Card>
              <CardHeader>
                <CardTitle>🏗️ Quiz Builder Component Test</CardTitle>
                <p className="text-sm text-gray-600">
                  Test semua fitur quiz builder: MCQ, True/False, Essay, Checkbox, dll.
                </p>
              </CardHeader>
              <CardContent>
                <QuizBuilder 
                  onQuizCreated={handleQuizCreated}
                  initialData={quizData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Renderer Testing */}
          <TabsContent value="renderer">
            {quizData ? (
              <Card>
                <CardHeader>
                  <CardTitle>▶️ Quiz Renderer Component Test</CardTitle>
                  <p className="text-sm text-gray-600">
                    Test pengalaman mengerjakan quiz dari perspective user
                  </p>
                </CardHeader>
                <CardContent>
                  <QuizRenderer 
                    quiz={quizData}
                    onQuizCompleted={handleQuizCompleted}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    Tidak ada quiz data untuk di-render.
                  </p>
                  <Button onClick={() => setMode('builder')}>
                    Buat Quiz Dulu
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Test Results Display */}
        {testResults && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>📊 Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Debug Info */}
        {quizData && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>🐛 Debug Info - Quiz Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                {JSON.stringify(quizData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}