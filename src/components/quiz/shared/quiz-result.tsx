// File: src/components/quiz/shared/quiz-result.tsx

/**
 * =================================================================
 * 🏆 QUIZ RESULT COMPONENT
 * =================================================================
 * Tampilan hasil quiz dengan analytics dan feedback
 * Created: July 2025
 * Phase: 2 - Shared Components
 * =================================================================
 */

'use client';

import React from 'react';

// ✅ FIXED: Menggunakan barrel imports dari index.ts
import { 
  Button,
  Card, CardContent, CardHeader, CardTitle,
  Badge,
  Progress,
  Separator
} from '@/components/ui';

// ✅ FIXED: Icons grouped together
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Award,
  Star,
  RotateCcw,
  Share2,
  Download,
  Eye,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Calendar,
  BookOpen,
  Zap
} from 'lucide-react';

// ✅ FIXED: Local utilities
import { cn } from '@/lib/utils';

// =================================================================
// 🎯 INTERFACES
// =================================================================

interface QuizResultProps {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  passingScore?: number;
  timeSpent: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  completedAt: Date;
  questionResults?: QuestionResult[];
  analytics?: QuizAnalytics;
  showDetailedResults?: boolean;
  showAnalytics?: boolean;
  showActions?: boolean;
  allowRetake?: boolean;
  allowReview?: boolean;
  allowShare?: boolean;
  onRetake?: () => void;
  onReview?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  className?: string;
}

interface QuestionResult {
  questionId: string;
  questionTitle: string;
  questionType: string;
  isCorrect: boolean;
  points: number;
  maxPoints: number;
  timeSpent: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

interface QuizAnalytics {
  strongAreas: string[];
  weakAreas: string[];
  averageTimePerQuestion: number;
  difficultyBreakdown: {
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
  recommendations?: string[];
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function QuizResult({
  score,
  maxScore,
  percentage,
  passed,
  passingScore = 70,
  timeSpent,
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  skippedQuestions,
  completedAt,
  questionResults = [],
  analytics,
  showDetailedResults = true,
  showAnalytics = true,
  showActions = true,
  allowRetake = true,
  allowReview = true,
  allowShare = true,
  onRetake,
  onReview,
  onShare,
  onDownload,
  className,
}: QuizResultProps) {
  // =================================================================
  // 📊 CALCULATIONS
  // =================================================================

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const getPerformanceLevel = (percentage: number): {
    level: string;
    color: string;
    message: string;
  } => {
    if (percentage >= 90) {
      return {
        level: 'Excellent',
        color: 'text-green-600',
        message: 'Outstanding performance! You have mastered this topic.',
      };
    } else if (percentage >= 80) {
      return {
        level: 'Very Good',
        color: 'text-blue-600',
        message: 'Great job! You have a solid understanding of the material.',
      };
    } else if (percentage >= 70) {
      return {
        level: 'Good',
        color: 'text-green-600',
        message: 'Well done! You passed with a good score.',
      };
    } else if (percentage >= 60) {
      return {
        level: 'Fair',
        color: 'text-yellow-600',
        message: 'You passed, but there\'s room for improvement.',
      };
    } else {
      return {
        level: 'Needs Improvement',
        color: 'text-red-600',
        message: 'Consider reviewing the material and retaking the quiz.',
      };
    }
  };

  const performance = getPerformanceLevel(percentage);

  // =================================================================
  // 🎨 RENDER FUNCTIONS
  // =================================================================

  const renderResultHeader = () => {
    const grade = getGrade(percentage);
    
    return (
      <div className="text-center space-y-4">
        {/* Pass/Fail Status */}
        <div className="flex justify-center">
          {passed ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-8 h-8" />
              <span className="text-2xl font-bold">Passed!</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="w-8 h-8" />
              <span className="text-2xl font-bold">Not Passed</span>
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className="space-y-2">
          <div className="text-6xl font-bold text-gray-900">
            {percentage}%
          </div>
          <div className="text-lg text-gray-600">
            {score} out of {maxScore} points
          </div>
          <Badge 
            variant={passed ? "default" : "destructive"}
            className="text-lg px-4 py-2"
          >
            Grade: {grade}
          </Badge>
        </div>

        {/* Performance Message */}
        <div className="max-w-md mx-auto">
          <div className={cn("text-lg font-semibold", performance.color)}>
            {performance.level}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {performance.message}
          </p>
        </div>
      </div>
    );
  };

  const renderScoreBreakdown = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
          <div className="text-sm text-gray-600">Correct</div>
        </div>
        
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
          <div className="text-sm text-gray-600">Incorrect</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{skippedQuestions}</div>
          <div className="text-sm text-gray-600">Skipped</div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{formatTime(timeSpent)}</div>
          <div className="text-sm text-gray-600">Time Spent</div>
        </div>
      </div>
    );
  };

  const renderProgressBar = () => {
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Your Score</span>
          <span>{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-3" />
        {passingScore && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>Passing Score: {passingScore}%</span>
            <span className={percentage >= passingScore ? 'text-green-600' : 'text-red-600'}>
              {percentage >= passingScore ? 'Passed' : 'Failed'}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderQuestionResults = () => {
    if (!showDetailedResults || questionResults.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
          <BookOpen className="w-5 h-5" />
          <span>Question Results</span>
        </h4>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {questionResults.map((result, index) => (
            <div
              key={result.questionId}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border',
                result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {result.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">
                    Q{index + 1}: {result.questionTitle}
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.questionType} • {formatTime(result.timeSpent)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {result.difficulty}
                </Badge>
                <span className="text-sm font-medium">
                  {result.points}/{result.maxPoints}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!showAnalytics || !analytics) return null;

    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Performance Analytics</span>
        </h4>

        {/* Difficulty Breakdown */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">Difficulty Breakdown</div>
          {Object.entries(analytics.difficultyBreakdown).map(([difficulty, data]) => {
            const percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
            return (
              <div key={difficulty} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{difficulty}</span>
                  <span>{data.correct}/{data.total} ({percentage}%)</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>

        {/* Strong & Weak Areas */}
        {(analytics.strongAreas.length > 0 || analytics.weakAreas.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.strongAreas.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-green-600 flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Strong Areas</span>
                </div>
                <div className="space-y-1">
                  {analytics.strongAreas.map((area, index) => (
                    <Badge key={index} variant="outline" className="text-xs text-green-600 border-green-300">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analytics.weakAreas.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Areas for Improvement</span>
                </div>
                <div className="space-y-1">
                  {analytics.weakAreas.map((area, index) => (
                    <Badge key={index} variant="outline" className="text-xs text-red-600 border-red-300">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {analytics.recommendations && analytics.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-blue-600 flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span>Recommendations</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {analytics.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderActionButtons = () => {
    if (!showActions) return null;

    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {allowRetake && (
          <Button 
            onClick={onRetake}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </Button>
        )}
        
        {allowReview && (
          <Button 
            onClick={onReview}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Review Answers</span>
          </Button>
        )}
        
        {allowShare && (
          <Button 
            onClick={onShare}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Result</span>
          </Button>
        )}
        
        {onDownload && (
          <Button 
            onClick={onDownload}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </Button>
        )}
      </div>
    );
  };

  const renderCompletionInfo = () => {
    return (
      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>
            Completed on {completedAt.toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>
            at {completedAt.toLocaleTimeString()}
          </span>
        </div>
      </div>
    );
  };

  // =================================================================
  // 🎨 MAIN RENDER
  // =================================================================

  return (
    <Card className={cn('w-full max-w-4xl mx-auto', className)}>
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center space-x-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <span>Quiz Results</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Result Header */}
        {renderResultHeader()}
        
        <Separator />
        
        {/* Progress Bar */}
        {renderProgressBar()}
        
        <Separator />
        
        {/* Score Breakdown */}
        {renderScoreBreakdown()}
        
        <Separator />
        
        {/* Question Results */}
        {renderQuestionResults()}
        
        {/* Analytics */}
        {showAnalytics && analytics && (
          <>
            <Separator />
            {renderAnalytics()}
          </>
        )}
        
        <Separator />
        
        {/* Action Buttons */}
        {renderActionButtons()}
        
        {/* Completion Info */}
        {renderCompletionInfo()}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 USAGE HOOK
// =================================================================

export function useQuizResult(initialResult?: Partial<QuizResultProps>) {
  const [result, setResult] = React.useState<Partial<QuizResultProps>>(initialResult || {});

  const updateResult = React.useCallback((updates: Partial<QuizResultProps>) => {
    setResult(prev => ({ ...prev, ...updates }));
  }, []);

  const calculatePercentage = React.useCallback((score: number, maxScore: number) => {
    return Math.round((score / maxScore) * 100);
  }, []);

  const calculatePassed = React.useCallback((percentage: number, passingScore: number = 70) => {
    return percentage >= passingScore;
  }, []);

  const generateAnalytics = React.useCallback((questionResults: QuestionResult[]): QuizAnalytics => {
    const difficultyBreakdown = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };

    questionResults.forEach(result => {
      const difficulty = result.difficulty.toLowerCase() as keyof typeof difficultyBreakdown;
      difficultyBreakdown[difficulty].total++;
      if (result.isCorrect) {
        difficultyBreakdown[difficulty].correct++;
      }
    });

    const averageTimePerQuestion = questionResults.reduce((sum, result) => sum + result.timeSpent, 0) / questionResults.length;

    // Simple analytics logic
    const strongAreas = [];
    const weakAreas = [];
    const recommendations = [];

    if (difficultyBreakdown.easy.correct / difficultyBreakdown.easy.total >= 0.8) {
      strongAreas.push('Basic Concepts');
    } else {
      weakAreas.push('Basic Concepts');
      recommendations.push('Review fundamental concepts');
    }

    if (difficultyBreakdown.hard.correct / difficultyBreakdown.hard.total >= 0.6) {
      strongAreas.push('Advanced Topics');
    } else {
      weakAreas.push('Advanced Topics');
      recommendations.push('Practice more challenging problems');
    }

    return {
      strongAreas,
      weakAreas,
      averageTimePerQuestion,
      difficultyBreakdown,
      recommendations,
    };
  }, []);

  return {
    result,
    updateResult,
    calculatePercentage,
    calculatePassed,
    generateAnalytics,
  };
}

// =================================================================
// 🎯 EXPORTS - FOLLOW ARCTIC SIBERIA STANDARD
// =================================================================

export default QuizResult
export { 
  useQuizResult, 
  type QuizResultProps, 
  type QuestionResult, 
  type QuizAnalytics 
}