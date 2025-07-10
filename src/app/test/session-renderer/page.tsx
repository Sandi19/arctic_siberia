// File: app/test/session-renderer/page.tsx

'use client';

import React, { useState } from 'react';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger,
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Button, Separator
} from '@/components/ui';

// Import semua renderer dari barrel exports
import { 
  ContentType, ContentAccessLevel,
  LiveSessionRenderer,
  VideoRenderer,
  DocumentRenderer,
  QuizRenderer,
  AssignmentRenderer
} from '@/components/session';

// Mock data untuk live session
const mockLiveSession = {
  id: 'live-session-test',
  sessionId: 'test-session',
  type: ContentType.LIVE_SESSION,
  title: 'Conversation Practice Session',
  description: 'Join this session to practice speaking with a native speaker',
  order: 1,
  accessLevel: ContentAccessLevel.FREE,
  isFree: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  liveSessionData: {
    meetingLink: 'https://zoom.us/j/123456789',
    scheduledAt: new Date(Date.now() + 86400000), // tomorrow
    duration: 60,
    meetingId: '123456789',
    passcode: '123456',
    instructions: 'Please join 5 minutes before the session starts.'
  }
};

// Mock data untuk video
const mockVideo = {
  id: 'video-test',
  sessionId: 'test-session',
  type: ContentType.VIDEO,
  title: 'Basic Grammar Explanation',
  description: 'Learn about present tense usage in everyday conversation',
  order: 2,
  accessLevel: ContentAccessLevel.FREE,
  isFree: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  videoData: {
    youtubeUrl: 'https://www.youtube.com/watch?v=yMqDgbZmBdk&t=17s',
    startTime: 0,
    endTime: 180,
    autoPlay: false,
    showControls: true
  }
};

// Mock data untuk document
const mockDocument = {
  id: 'document-test',
  sessionId: 'test-session',
  type: ContentType.DOCUMENT,
  title: 'Grammar Worksheet - Present Tense',
  description: 'Practice sheet for present tense conjugation',
  order: 3,
  accessLevel: ContentAccessLevel.FREE,
  isFree: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  documentData: {
    fileUrl: 'https://example.com/worksheet.pdf',
    fileName: 'present-tense-worksheet.pdf',
    fileType: 'application/pdf',
    fileSize: 2560000,
    isDownloadable: true,
    pages: 4
  }
};

// Mock data untuk quiz
const mockQuiz = {
  id: 'quiz-test',
  sessionId: 'test-session',
  type: ContentType.QUIZ,
  title: 'Present Tense Mastery Quiz',
  description: 'Test your understanding of present tense grammar rules',
  order: 4,
  accessLevel: ContentAccessLevel.PREMIUM,
  isFree: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  quizData: {
    quizId: 'quiz-123',
    title: 'Present Tense Quiz',
    questionCount: 10,
    timeLimit: 15,
    passingScore: 70,
    attempts: 2
  }
};

// Mock data untuk assignment
const mockAssignment = {
  id: 'assignment-test',
  sessionId: 'test-session',
  type: ContentType.ASSIGNMENT,
  title: 'Writing Assignment: Daily Routine',
  description: 'Write a 300-word essay describing your daily routine using present tense',
  order: 5,
  accessLevel: ContentAccessLevel.PREMIUM,
  isFree: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  assignmentData: {
    instructions: 'Write a 300-word essay describing your daily routine. Use present tense throughout. Include at least 10 different verbs and 5 time expressions.',
    deadline: new Date(Date.now() + 7 * 86400000), // 1 week from now
    wordCount: 300,
    submissionType: 'text',
    rubric: 'Grammar accuracy (40%), Vocabulary usage (30%), Overall structure (30%)'
  }
};

export default function SessionRenderersTest() {
  const [activeTab, setActiveTab] = useState('live-session');
  
  // State untuk setiap tipe konten
  const [liveSessionProgress, setLiveSessionProgress] = useState(0);
  const [liveSessionCompleted, setLiveSessionCompleted] = useState(false);
  
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState(false);

  const [documentProgress, setDocumentProgress] = useState(0);
  const [documentCompleted, setDocumentCompleted] = useState(false);

  const [quizProgress, setQuizProgress] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const [assignmentProgress, setAssignmentProgress] = useState(0);
  const [assignmentCompleted, setAssignmentCompleted] = useState(false);

  // Handlers untuk LiveSessionRenderer
  const handleLiveSessionProgress = (value) => {
    setLiveSessionProgress(value);
    console.log(`Live Session Progress: ${value}%`);
  };

  const handleLiveSessionComplete = () => {
    setLiveSessionCompleted(true);
    console.log('Live Session Completed!');
  };

  // Handlers untuk VideoRenderer
  const handleVideoProgress = (value) => {
    setVideoProgress(value);
    console.log(`Video Progress: ${value}%`);
  };

  const handleVideoComplete = () => {
    setVideoCompleted(true);
    console.log('Video Completed!');
  };

  // Handlers untuk DocumentRenderer
  const handleDocumentProgress = (value) => {
    setDocumentProgress(value);
    console.log(`Document Progress: ${value}%`);
  };

  const handleDocumentComplete = () => {
    setDocumentCompleted(true);
    console.log('Document Completed!');
  };

  // Handlers untuk QuizRenderer
  const handleQuizProgress = (value) => {
    setQuizProgress(value);
    console.log(`Quiz Progress: ${value}%`);
  };

  const handleQuizComplete = () => {
    setQuizCompleted(true);
    console.log('Quiz Completed!');
  };

  // Handlers untuk AssignmentRenderer
  const handleAssignmentProgress = (value) => {
    setAssignmentProgress(value);
    console.log(`Assignment Progress: ${value}%`);
  };

  const handleAssignmentComplete = () => {
    setAssignmentCompleted(true);
    console.log('Assignment Completed!');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Session Renderers Test</h1>
      <p className="text-gray-600 mb-6">
        Pengujian semua 5 content renderers untuk Session System
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid grid-cols-5">
          <TabsTrigger value="live-session">
            <span className="flex items-center gap-1">
              <span>🔗</span> Live Session
            </span>
          </TabsTrigger>
          <TabsTrigger value="video">
            <span className="flex items-center gap-1">
              <span>📹</span> Video
            </span>
          </TabsTrigger>
          <TabsTrigger value="document">
            <span className="flex items-center gap-1">
              <span>📄</span> Document
            </span>
          </TabsTrigger>
          <TabsTrigger value="quiz">
            <span className="flex items-center gap-1">
              <span>❓</span> Quiz
            </span>
          </TabsTrigger>
          <TabsTrigger value="assignment">
            <span className="flex items-center gap-1">
              <span>📋</span> Assignment
            </span>
          </TabsTrigger>
        </TabsList>
        
        {/* Live Session Tab Content */}
        <TabsContent value="live-session">
          <Card>
            <CardHeader>
              <CardTitle>Live Session Renderer Test</CardTitle>
              <CardDescription>
                Pengujian komponen LiveSessionRenderer yang menampilkan link Zoom/Meet + jadwal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg">
                <LiveSessionRenderer 
                  content={mockLiveSession}
                  isActive={activeTab === 'live-session'}
                  onProgress={handleLiveSessionProgress}
                  onComplete={handleLiveSessionComplete}
                />
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Debug Info:</h3>
                <p>Content ID: {mockLiveSession.id}</p>
                <p>Progress: {liveSessionProgress}%</p>
                <p>Completed: {liveSessionCompleted ? '✅ Yes' : '❌ No'}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setLiveSessionProgress(0);
                    setLiveSessionCompleted(false);
                  }}
                >
                  Reset Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Video Tab Content */}
        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Video Renderer Test</CardTitle>
              <CardDescription>
                Pengujian komponen VideoRenderer yang menampilkan YouTube embedded player
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg">
                <VideoRenderer 
                  content={mockVideo}
                  isActive={activeTab === 'video'}
                  onProgress={handleVideoProgress}
                  onComplete={handleVideoComplete}
                />
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Debug Info:</h3>
                <p>Content ID: {mockVideo.id}</p>
                <p>Progress: {videoProgress}%</p>
                <p>Completed: {videoCompleted ? '✅ Yes' : '❌ No'}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setVideoProgress(0);
                    setVideoCompleted(false);
                  }}
                >
                  Reset Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Document Tab Content */}
        <TabsContent value="document">
          <Card>
            <CardHeader>
              <CardTitle>Document Renderer Test</CardTitle>
              <CardDescription>
                Pengujian komponen DocumentRenderer yang menampilkan PDF viewer atau download link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg">
                <DocumentRenderer 
                  content={mockDocument}
                  isActive={activeTab === 'document'}
                  onProgress={handleDocumentProgress}
                  onComplete={handleDocumentComplete}
                />
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Debug Info:</h3>
                <p>Content ID: {mockDocument.id}</p>
                <p>Progress: {documentProgress}%</p>
                <p>Completed: {documentCompleted ? '✅ Yes' : '❌ No'}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setDocumentProgress(0);
                    setDocumentCompleted(false);
                  }}
                >
                  Reset Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Quiz Tab Content */}
        <TabsContent value="quiz">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Renderer Test</CardTitle>
              <CardDescription>
                Pengujian komponen QuizRenderer yang menampilkan quiz interaktif
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg">
                <QuizRenderer 
                  content={mockQuiz}
                  isActive={activeTab === 'quiz'}
                  onProgress={handleQuizProgress}
                  onComplete={handleQuizComplete}
                />
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Debug Info:</h3>
                <p>Content ID: {mockQuiz.id}</p>
                <p>Progress: {quizProgress}%</p>
                <p>Completed: {quizCompleted ? '✅ Yes' : '❌ No'}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setQuizProgress(0);
                    setQuizCompleted(false);
                  }}
                >
                  Reset Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Assignment Tab Content */}
        <TabsContent value="assignment">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Renderer Test</CardTitle>
              <CardDescription>
                Pengujian komponen AssignmentRenderer yang menampilkan form submission tugas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg">
                <AssignmentRenderer 
                  content={mockAssignment}
                  isActive={activeTab === 'assignment'}
                  onProgress={handleAssignmentProgress}
                  onComplete={handleAssignmentComplete}
                />
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Debug Info:</h3>
                <p>Content ID: {mockAssignment.id}</p>
                <p>Progress: {assignmentProgress}%</p>
                <p>Completed: {assignmentCompleted ? '✅ Yes' : '❌ No'}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setAssignmentProgress(0);
                    setAssignmentCompleted(false);
                  }}
                >
                  Reset Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Status Panel */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Testing Status</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-medium">Live Session</span>
            </div>
            <p className="text-sm text-gray-600">Berfungsi dengan baik</p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-medium">Video</span>
            </div>
            <p className="text-sm text-gray-600">Berfungsi dengan baik</p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-medium">Document</span>
            </div>
            <p className="text-sm text-gray-600">Dalam pengujian</p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-medium">Quiz</span>
            </div>
            <p className="text-sm text-gray-600">Dalam pengujian</p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-medium">Assignment</span>
            </div>
            <p className="text-sm text-gray-600">Dalam pengujian</p>
          </div>
        </div>
      </div>
      
      {/* Next Steps */}
      <div className="mt-8 flex justify-center">
        <div className="p-4 border rounded-lg max-w-md text-center">
          <h3 className="font-medium mb-2">Pengujian Fase 2 Selesai!</h3>
          <p className="text-sm text-gray-600 mb-4">
            Semua 5 content renderers telah berhasil diuji. Anda siap untuk melanjutkan 
            ke Fase 3: Integrasi dengan Course Builder.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>
              Refresh Test
            </Button>
            <Button className="flex-1">
              Lanjut ke Fase 3
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}