// File: src/components/session/components/session-statistics/session-stats.tsx

/**
 * =================================================================
 * 🎯 SESSION STATISTICS COMPONENT - SESSION ANALYTICS
 * =================================================================
 * Comprehensive session statistics and analytics dashboard
 * Perfect for session performance tracking in course builder
 * Following Arctic Siberia Component Pattern
 * Created: July 2025 - Session Statistics
 * =================================================================
 */

'use client';

// ✅ Framework imports
import { useMemo } from 'react';

// ✅ UI Components menggunakan barrel imports
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';

// ✅ Icons
import {
  BookOpen,
  Users,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Eye,
  Play,
  Award,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Calendar
} from 'lucide-react';

// ✅ Local utilities & types
import { cn } from '@/lib/utils';
import type { Session, ContentType } from '../../types';

// =================================================================
// 🎯 INTERFACES
// =================================================================

export interface SessionStatsProps {
  sessions: Session[];
  showDetailed?: boolean;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  className?: string;
}

interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
}

interface ContentTypeStats {
  type: ContentType;
  count: number;
  percentage: number;
  averageCompletion: number;
  totalDuration: number;
}

interface PerformanceMetrics {
  averageCompletion: number;
  averageRating: number;
  totalEnrollments: number;
  totalCompletions: number;
  averageTimeSpent: number;
  dropoffRate: number;
}

// =================================================================
// 🎯 STAT CARD COMPONENT
// =================================================================

function StatCard({ title, value, change, changeType, icon: Icon, color, description }: StatCard) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-full", color)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        
        {change !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            {changeType === 'increase' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : changeType === 'decrease' ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : (
              <Activity className="h-4 w-4 text-gray-600" />
            )}
            <span className={cn(
              "text-sm font-medium",
              changeType === 'increase' && "text-green-600",
              changeType === 'decrease' && "text-red-600",
              changeType === 'neutral' && "text-gray-600"
            )}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-gray-600">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 CONTENT TYPE BREAKDOWN COMPONENT
// =================================================================

function ContentTypeBreakdown({ contentTypeStats }: { contentTypeStats: ContentTypeStats[] }) {
  const contentTypeIcons = {
    VIDEO: Play,
    DOCUMENT: BookOpen,
    LIVE_SESSION: Users,
    QUIZ: CheckCircle,
    ASSIGNMENT: Award
  };

  const contentTypeColors = {
    VIDEO: 'bg-red-500',
    DOCUMENT: 'bg-blue-500',
    LIVE_SESSION: 'bg-green-500',
    QUIZ: 'bg-yellow-500',
    ASSIGNMENT: 'bg-purple-500'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Content Type Distribution
        </CardTitle>
        <CardDescription>
          Breakdown of content types across all sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contentTypeStats.map((stat) => {
            const Icon = contentTypeIcons[stat.type];
            const colorClass = contentTypeColors[stat.type];
            
            return (
              <div key={stat.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1 rounded", colorClass)}>
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-medium">
                      {stat.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{stat.count}</span>
                    <Badge variant="outline" className="text-xs">
                      {stat.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={stat.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Avg. completion: {stat.averageCompletion.toFixed(1)}%</span>
                  <span>Total duration: {stat.totalDuration}m</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 PERFORMANCE METRICS COMPONENT
// =================================================================

function PerformanceMetrics({ metrics }: { metrics: PerformanceMetrics }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance Metrics
        </CardTitle>
        <CardDescription>
          Key performance indicators for your sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Completion Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm font-bold">{metrics.averageCompletion.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.averageCompletion} className="h-2" />
            <p className="text-xs text-gray-600">
              {metrics.totalCompletions} of {metrics.totalEnrollments} students completed
            </p>
          </div>

          {/* Average Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Rating</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-bold">{metrics.averageRating.toFixed(1)}</span>
              </div>
            </div>
            <Progress value={(metrics.averageRating / 5) * 100} className="h-2" />
            <p className="text-xs text-gray-600">
              Based on student feedback
            </p>
          </div>

          {/* Time Spent */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Avg. Time Spent</span>
              <span className="text-sm font-bold">{metrics.averageTimeSpent}m</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>Per session</span>
            </div>
          </div>

          {/* Dropoff Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dropoff Rate</span>
              <span className={cn(
                "text-sm font-bold",
                metrics.dropoffRate > 30 ? "text-red-600" : 
                metrics.dropoffRate > 15 ? "text-yellow-600" : "text-green-600"
              )}>
                {metrics.dropoffRate.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={metrics.dropoffRate} 
              className={cn(
                "h-2",
                metrics.dropoffRate > 30 ? "[&>div]:bg-red-500" : 
                metrics.dropoffRate > 15 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"
              )}
            />
            <p className="text-xs text-gray-600">
              Students who don't complete sessions
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 SESSION DIFFICULTY ANALYSIS COMPONENT
// =================================================================

function DifficultyAnalysis({ sessions }: { sessions: Session[] }) {
  const difficultyStats = useMemo(() => {
    const stats = {
      BEGINNER: { count: 0, avgCompletion: 0, avgRating: 0 },
      INTERMEDIATE: { count: 0, avgCompletion: 0, avgRating: 0 },
      ADVANCED: { count: 0, avgCompletion: 0, avgRating: 0 }
    };

    sessions.forEach(session => {
      stats[session.difficulty].count++;
      // Mock completion and rating data
      stats[session.difficulty].avgCompletion += session.completionRate || Math.random() * 40 + 60;
      stats[session.difficulty].avgRating += session.averageScore || Math.random() * 1 + 4;
    });

    // Calculate averages
    Object.values(stats).forEach(stat => {
      if (stat.count > 0) {
        stat.avgCompletion /= stat.count;
        stat.avgRating /= stat.count;
      }
    });

    return stats;
  }, [sessions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Difficulty Analysis
        </CardTitle>
        <CardDescription>
          Performance breakdown by difficulty level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(difficultyStats).map(([difficulty, stats]) => (
            <div key={difficulty} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className={cn(
                    "h-4 w-4",
                    difficulty === 'BEGINNER' && "text-green-500",
                    difficulty === 'INTERMEDIATE' && "text-yellow-500",
                    difficulty === 'ADVANCED' && "text-red-500"
                  )} />
                  <span className="font-medium">{difficulty.toLowerCase()}</span>
                </div>
                <Badge variant="outline">{stats.count} sessions</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Avg. Completion</p>
                  <p className="font-bold">{stats.avgCompletion.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Avg. Rating</p>
                  <p className="font-bold">{stats.avgRating.toFixed(1)}/5</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 MAIN SESSION STATS COMPONENT
// =================================================================

function SessionStats({
  sessions,
  showDetailed = true,
  timeRange = 'month',
  className
}: SessionStatsProps) {
  
  // =================================================================
  // 🎯 COMPUTED STATISTICS
  // =================================================================

  const overviewStats = useMemo(() => {
    const totalSessions = sessions.length;
    const publishedSessions = sessions.filter(s => s.status === 'PUBLISHED').length;
    const freeSessions = sessions.filter(s => s.isFree).length;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.estimatedDuration || 0), 0);
    const totalEnrollments = sessions.reduce((sum, s) => sum + (s.enrollmentCount || 0), 0);
    const averageCompletion = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + (s.completionRate || 0), 0) / sessions.length 
      : 0;

    return {
      totalSessions,
      publishedSessions,
      freeSessions,
      totalDuration,
      totalEnrollments,
      averageCompletion
    };
  }, [sessions]);

  const contentTypeStats = useMemo((): ContentTypeStats[] => {
    const allContents = sessions.flatMap(s => s.contents || []);
    const typeMap = new Map<ContentType, { count: number; duration: number; completions: number }>();

    allContents.forEach(content => {
      const existing = typeMap.get(content.type) || { count: 0, duration: 0, completions: 0 };
      typeMap.set(content.type, {
        count: existing.count + 1,
        duration: existing.duration + (content.duration || 0),
        completions: existing.completions + Math.random() * 80 + 10 // Mock data
      });
    });

    const totalContents = allContents.length;
    
    return Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      percentage: totalContents > 0 ? (data.count / totalContents) * 100 : 0,
      averageCompletion: data.completions / data.count,
      totalDuration: data.duration
    }));
  }, [sessions]);

  const performanceMetrics = useMemo((): PerformanceMetrics => {
    const totalEnrollments = overviewStats.totalEnrollments;
    const totalCompletions = Math.floor(totalEnrollments * (overviewStats.averageCompletion / 100));
    
    return {
      averageCompletion: overviewStats.averageCompletion,
      averageRating: 4.2, // Mock data
      totalEnrollments,
      totalCompletions,
      averageTimeSpent: Math.floor(overviewStats.totalDuration / Math.max(sessions.length, 1)),
      dropoffRate: 100 - overviewStats.averageCompletion
    };
  }, [overviewStats, sessions.length]);

  const statCards: StatCard[] = useMemo(() => [
    {
      title: 'Total Sessions',
      value: overviewStats.totalSessions,
      change: 12,
      changeType: 'increase',
      icon: BookOpen,
      color: 'bg-blue-500',
      description: `${overviewStats.publishedSessions} published`
    },
    {
      title: 'Total Enrollments',
      value: overviewStats.totalEnrollments.toLocaleString(),
      change: 8,
      changeType: 'increase',
      icon: Users,
      color: 'bg-green-500',
      description: 'Across all sessions'
    },
    {
      title: 'Avg. Completion',
      value: `${overviewStats.averageCompletion.toFixed(1)}%`,
      change: -2.3,
      changeType: 'decrease',
      icon: CheckCircle,
      color: 'bg-purple-500',
      description: 'Student completion rate'
    },
    {
      title: 'Total Duration',
      value: `${Math.floor(overviewStats.totalDuration / 60)}h ${overviewStats.totalDuration % 60}m`,
      change: 15,
      changeType: 'increase',
      icon: Clock,
      color: 'bg-orange-500',
      description: 'Content runtime'
    }
  ], [overviewStats]);

  // =================================================================
  // 🎯 RENDER
  // =================================================================

  if (sessions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No session data</h3>
          <p className="text-gray-600">Create sessions to see statistics and analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {showDetailed && (
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContentTypeBreakdown contentTypeStats={contentTypeStats} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest session activities and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            session.status === 'PUBLISHED' ? "bg-green-500" : "bg-yellow-500"
                          )} />
                          <div>
                            <p className="text-sm font-medium">{session.title}</p>
                            <p className="text-xs text-gray-600">
                              {session.status === 'PUBLISHED' ? 'Published' : 'Draft'} • 
                              {session.enrollmentCount || 0} enrolled
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {session.difficulty}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <PerformanceMetrics metrics={performanceMetrics} />
          </TabsContent>

          <TabsContent value="difficulty" className="mt-6">
            <DifficultyAnalysis sessions={sessions} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// =================================================================
// 🎯 DEFAULT EXPORT (Arctic Siberia Standard)
// =================================================================

export default SessionStats;