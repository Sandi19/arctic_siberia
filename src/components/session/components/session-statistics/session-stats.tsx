// File: src/components/session/components/session-statistics/session-stats.tsx

/**
 * =================================================================
 * 🎯 SESSION STATS COMPONENT
 * =================================================================
 * Comprehensive session analytics dan performance metrics
 * Interactive charts dengan real-time data visualization
 * Following Arctic Siberia Import/Export Standard
 * Created: July 2025
 * =================================================================
 */

'use client';

// ✅ FIXED: Framework imports
import { 
  useCallback,
  useEffect,
  useMemo,
  useState 
} from 'react';

// ✅ FIXED: UI Components dari barrel exports
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui';

// ✅ FIXED: Icons grouped together
import {
  Activity,
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  Download,
  Eye,
  Filter,
  HelpCircle,
  LineChart,
  PieChart,
  Play,
  RefreshCw,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Users
} from 'lucide-react';

// ✅ FIXED: External libraries
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

// ✅ FIXED: Local utilities - session types
import type {
  ContentType,
  CONTENT_TYPE_LABELS,
  Session,
  SessionStatistics
} from '../../types';

// =================================================================
// 🎯 COMPONENT INTERFACES
// =================================================================

interface SessionStatsProps {
  session: Session;
  timeRange?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  showCharts?: boolean;
  showDetailedMetrics?: boolean;
  className?: string;
  onTimeRangeChange?: (range: 'day' | 'week' | 'month' | 'quarter' | 'year') => void;
  onExportData?: () => void;
}

interface StatsOverviewProps {
  statistics: SessionStatistics;
  session: Session;
}

interface EngagementChartsProps {
  session: Session;
  timeRange: string;
}

interface ContentAnalyticsProps {
  session: Session;
  statistics: SessionStatistics;
}

interface PerformanceMetricsProps {
  statistics: SessionStatistics;
}

interface ProgressBreakdownProps {
  statistics: SessionStatistics;
}

// =================================================================
// 🎯 MOCK DATA GENERATORS
// =================================================================

function generateMockProgressData(timeRange: string) {
  const days = timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : 30;
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), days - i - 1);
    data.push({
      date: format(date, timeRange === 'day' ? 'HH:mm' : 'MMM dd'),
      completions: Math.floor(Math.random() * 20) + 5,
      views: Math.floor(Math.random() * 50) + 20,
      averageTime: Math.floor(Math.random() * 30) + 10
    });
  }
  
  return data;
}

function generateMockContentData(session: Session) {
  const contentTypes = session.contents.reduce((acc, content) => {
    const type = CONTENT_TYPE_LABELS[content.type] || content.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(contentTypes).map(([type, count]) => ({
    name: type,
    value: count,
    completionRate: Math.floor(Math.random() * 40) + 60,
    averageTime: Math.floor(Math.random() * 10) + 5
  }));
}

function generateMockDropoffData(session: Session) {
  return session.contents.map((content, index) => ({
    contentId: content.id,
    title: content.title,
    position: index + 1,
    dropoffRate: Math.random() * 30 + 5,
    completionRate: Math.random() * 20 + 75
  }));
}

// =================================================================
// 🎯 CHART COLOR PALETTE
// =================================================================

const CHART_COLORS = [
  '#0ea5e9', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
];

// =================================================================
// 🎯 STATS OVERVIEW COMPONENT
// =================================================================

function StatsOverview({ statistics, session }: StatsOverviewProps) {
  const overviewStats = useMemo(() => [
    {
      icon: Users,
      label: 'Total Students',
      value: statistics.totalStudents.toLocaleString(),
      change: '+12.5%',
      trend: 'up' as const,
      color: 'text-blue-600'
    },
    {
      icon: Target,
      label: 'Completed',
      value: statistics.completedStudents.toLocaleString(),
      change: '+8.2%',
      trend: 'up' as const,
      color: 'text-green-600'
    },
    {
      icon: Clock,
      label: 'Avg. Time',
      value: `${Math.floor(statistics.averageCompletionTime / 60)}h ${statistics.averageCompletionTime % 60}m`,
      change: '-5.1%',
      trend: 'down' as const,
      color: 'text-amber-600'
    },
    {
      icon: Star,
      label: 'Rating',
      value: statistics.averageRating.toFixed(1),
      change: '+0.3',
      trend: 'up' as const,
      color: 'text-purple-600'
    },
    {
      icon: Activity,
      label: 'Engagement',
      value: `${statistics.engagementScore}%`,
      change: '+2.4%',
      trend: 'up' as const,
      color: 'text-emerald-600'
    },
    {
      icon: BookOpen,
      label: 'Contents',
      value: session.totalContents.toString(),
      change: 'No change',
      trend: 'neutral' as const,
      color: 'text-slate-600'
    }
  ], [statistics, session]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {overviewStats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              {stat.trend !== 'neutral' && (
                <span className={cn(
                  'text-xs flex items-center gap-1',
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="text-lg font-semibold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// =================================================================
// 🎯 ENGAGEMENT CHARTS COMPONENT
// =================================================================

function EngagementCharts({ session, timeRange }: EngagementChartsProps) {
  const progressData = useMemo(() => generateMockProgressData(timeRange), [timeRange]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Progress Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Progress Over Time
          </CardTitle>
          <CardDescription>
            Student completions and views trend
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="completions"
                stackId="1"
                stroke="#0ea5e9"
                fill="#0ea5e9"
                fillOpacity={0.3}
                name="Completions"
              />
              <Area
                type="monotone"
                dataKey="views"
                stackId="2"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                name="Views"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Average Time Spent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Average Time Spent
          </CardTitle>
          <CardDescription>
            Time engagement patterns
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip />
              <Bar 
                dataKey="averageTime" 
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                name="Minutes"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// =================================================================
// 🎯 CONTENT ANALYTICS COMPONENT
// =================================================================

function ContentAnalytics({ session, statistics }: ContentAnalyticsProps) {
  const contentData = useMemo(() => generateMockContentData(session), [session]);
  const dropoffData = useMemo(() => generateMockDropoffData(session), [session]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Content Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Content Type Distribution
          </CardTitle>
          <CardDescription>
            Breakdown by content types
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <RechartsTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data.name}</p>
                        <p>Count: {data.value}</p>
                        <p>Completion: {data.completionRate}%</p>
                        <p>Avg Time: {data.averageTime}m</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <RechartsPieChart
                data={contentData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {contentData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CHART_COLORS[index % CHART_COLORS.length]} 
                  />
                ))}
              </RechartsPieChart>
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
          
          <div className="mt-4 space-y-2">
            {contentData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span>{item.name}</span>
                </div>
                <div className="text-muted-foreground">
                  {item.value} items ({item.completionRate}% completion)
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drop-off Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Drop-off Points
          </CardTitle>
          <CardDescription>
            Where students typically stop
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {dropoffData.map((item, index) => (
                <div key={item.contentId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{item.position}
                      </Badge>
                      <span className="text-sm font-medium line-clamp-1">
                        {item.title}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.dropoffRate.toFixed(1)}% drop-off
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Completion Rate</span>
                      <span>{item.completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={item.completionRate} className="h-2" />
                  </div>
                  
                  {item.dropoffRate > 20 && (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <HelpCircle className="h-3 w-3" />
                      High drop-off point
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// =================================================================
// 🎯 PERFORMANCE METRICS COMPONENT
// =================================================================

function PerformanceMetrics({ statistics }: PerformanceMetricsProps) {
  const metrics = useMemo(() => [
    {
      label: 'Completion Rate',
      value: statistics.totalStudents > 0 
        ? ((statistics.completedStudents / statistics.totalStudents) * 100).toFixed(1)
        : '0',
      unit: '%',
      target: 85,
      status: statistics.totalStudents > 0 
        ? ((statistics.completedStudents / statistics.totalStudents) * 100) >= 85 ? 'good' : 'warning'
        : 'neutral'
    },
    {
      label: 'Engagement Score',
      value: statistics.engagementScore.toString(),
      unit: '%',
      target: 75,
      status: statistics.engagementScore >= 75 ? 'good' : 'warning'
    },
    {
      label: 'Average Rating',
      value: statistics.averageRating.toFixed(1),
      unit: '/5',
      target: 4.0,
      status: statistics.averageRating >= 4.0 ? 'good' : 'warning'
    },
    {
      label: 'Total Ratings',
      value: statistics.totalRatings.toString(),
      unit: '',
      target: 10,
      status: statistics.totalRatings >= 10 ? 'good' : 'neutral'
    }
  ], [statistics]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <Badge 
                  variant={
                    metric.status === 'good' ? 'default' : 
                    metric.status === 'warning' ? 'destructive' : 'secondary'
                  }
                  className="text-xs"
                >
                  {metric.status === 'good' ? 'Good' : 
                   metric.status === 'warning' ? 'Needs Attention' : 'Neutral'}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {metric.value}{metric.unit}
                </div>
                <div className="text-xs text-muted-foreground">
                  Target: {metric.target}{metric.unit}
                </div>
              </div>
              
              <Progress 
                value={
                  metric.unit === '%' 
                    ? parseFloat(metric.value)
                    : metric.unit === '/5'
                    ? (parseFloat(metric.value) / 5) * 100
                    : Math.min((parseFloat(metric.value) / metric.target) * 100, 100)
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// =================================================================
// 🎯 PROGRESS BREAKDOWN COMPONENT
// =================================================================

function ProgressBreakdown({ statistics }: ProgressBreakdownProps) {
  const progressData = useMemo(() => {
    const total = statistics.totalStudents;
    const completed = statistics.completedStudents;
    const inProgress = Math.floor(total * 0.3); // Mock data
    const notStarted = total - completed - inProgress;

    return [
      {
        status: 'Completed',
        count: completed,
        percentage: total > 0 ? ((completed / total) * 100).toFixed(1) : '0',
        color: '#10b981'
      },
      {
        status: 'In Progress',
        count: inProgress,
        percentage: total > 0 ? ((inProgress / total) * 100).toFixed(1) : '0',
        color: '#f59e0b'
      },
      {
        status: 'Not Started',
        count: notStarted,
        percentage: total > 0 ? ((notStarted / total) * 100).toFixed(1) : '0',
        color: '#6b7280'
      }
    ];
  }, [statistics]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Student Progress Breakdown
        </CardTitle>
        <CardDescription>
          Current progress distribution across all students
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {progressData.map((item, index) => (
            <div key={item.status} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.status}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{item.count.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                </div>
              </div>
              
              <Progress 
                value={parseFloat(item.percentage)} 
                className="h-2"
                style={{
                  '--progress-background': item.color
                } as React.CSSProperties}
              />
            </div>
          ))}
        </div>
        
        <Separator className="my-4" />
        
        <div className="text-center">
          <div className="text-2xl font-bold">{statistics.totalStudents.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total Students Enrolled</div>
        </div>
      </CardContent>
    </Card>
  );
}

// =================================================================
// 🎯 MAIN SESSION STATS COMPONENT
// =================================================================

function SessionStats({
  session,
  timeRange = 'week',
  showCharts = true,
  showDetailedMetrics = true,
  className,
  onTimeRangeChange,
  onExportData
}: SessionStatsProps) {
  
  // =================================================================
  // 🎯 STATE MANAGEMENT
  // =================================================================
  
  const [currentTimeRange, setCurrentTimeRange] = useState(timeRange);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // =================================================================
  // 🎯 MOCK STATISTICS
  // =================================================================
  
  const mockStatistics: SessionStatistics = useMemo(() => ({
    totalStudents: 1247,
    completedStudents: 892,
    averageCompletionTime: 145, // minutes
    averageRating: 4.3,
    totalRatings: 156,
    engagementScore: 87,
    dropoffPoints: []
  }), []);
  
  // =================================================================
  // 🎯 EVENT HANDLERS
  // =================================================================
  
  const handleTimeRangeChange = useCallback((newRange: typeof timeRange) => {
    setCurrentTimeRange(newRange);
    onTimeRangeChange?.(newRange);
  }, [onTimeRangeChange]);
  
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  }, []);
  
  const handleExport = useCallback(() => {
    onExportData?.();
    // Mock export functionality
    const data = {
      session: session.title,
      statistics: mockStatistics,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-stats-${session.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [session, mockStatistics, onExportData]);
  
  // =================================================================
  // 🎯 RENDER
  // =================================================================
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Session Analytics</h2>
          <p className="text-muted-foreground">
            Performance metrics for "{session.title}"
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={currentTimeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Last Updated */}
      <div className="text-xs text-muted-foreground">
        Last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm')}
      </div>
      
      {/* Stats Overview */}
      <StatsOverview statistics={mockStatistics} session={session} />
      
      {showDetailedMetrics && (
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="content">Content Analysis</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="space-y-4">
            <PerformanceMetrics statistics={mockStatistics} />
          </TabsContent>
          
          <TabsContent value="engagement" className="space-y-4">
            {showCharts && (
              <EngagementCharts session={session} timeRange={currentTimeRange} />
            )}
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <ContentAnalytics session={session} statistics={mockStatistics} />
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-4">
            <ProgressBreakdown statistics={mockStatistics} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// =================================================================
// 🎯 ADDITIONAL UTILITY FUNCTIONS
// =================================================================

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

function calculateCompletionRate(completed: number, total: number): number {
  return total > 0 ? (completed / total) * 100 : 0;
}

function getEngagementStatus(score: number): 'excellent' | 'good' | 'average' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'average';
  return 'poor';
}

// =================================================================
// 🎯 EXPORT FOLLOWING ARCTIC SIBERIA STANDARD
// =================================================================

// ✅ PATTERN: Default export untuk main component
export default SessionStats;

// ✅ PATTERN: Named exports untuk types dan utilities
export type { 
  SessionStatsProps,
  StatsOverviewProps,
  EngagementChartsProps,
  ContentAnalyticsProps,
  PerformanceMetricsProps,
  ProgressBreakdownProps
};

export {
  StatsOverview,
  EngagementCharts,
  ContentAnalytics,
  PerformanceMetrics,
  ProgressBreakdown,
  formatDuration,
  calculateCompletionRate,
  getEngagementStatus,
  generateMockProgressData,
  generateMockContentData,
  generateMockDropoffData
};