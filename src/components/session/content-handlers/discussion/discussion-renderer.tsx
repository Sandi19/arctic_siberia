// File: src/components/session/content-handlers/discussion/discussion-renderer.tsx

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
  Avatar,
  AvatarFallback,
  AvatarImage,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui'

// ✅ Icons - Arctic Siberia Import Standard
import {
  MessageSquare,
  Reply,
  Heart,
  Share,
  Flag,
  Pin,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Clock,
  Users,
  Send,
  Paperclip,
  X,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Quote,
  AtSign,
  Hash,
  Bookmark,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

// ✅ Session Types - Arctic Siberia Import Standard
import { 
  DiscussionContent,
  ContentType 
} from '@/components/session/types'

// =================================================================
// 🎯 VALIDATION SCHEMAS
// =================================================================

const postSchema = z.object({
  content: z.string().min(1, 'Post content is required'),
  category: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  attachments: z.array(z.instanceof(File)).optional()
})

const replySchema = z.object({
  content: z.string().min(1, 'Reply content is required'),
  isAnonymous: z.boolean().default(false),
  attachments: z.array(z.instanceof(File)).optional()
})

type PostFormData = z.infer<typeof postSchema>
type ReplyFormData = z.infer<typeof replySchema>

// =================================================================
// 🎯 INTERFACES & TYPES
// =================================================================

interface DiscussionRendererProps {
  content: DiscussionContent
  onCreatePost?: (post: DiscussionPost) => void
  onReplyToPost?: (reply: DiscussionReply) => void
  onLikePost?: (postId: string) => void
  onReportPost?: (postId: string, reason: string) => void
  existingPosts?: DiscussionPost[]
  currentUserId?: string
  currentUserName?: string
  isReadOnly?: boolean
  className?: string
}

interface DiscussionPost {
  id: string
  discussionId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  category?: string
  isAnonymous: boolean
  isPinned: boolean
  attachments?: File[]
  createdAt: Date
  updatedAt: Date
  likes: number
  dislikes: number
  replyCount: number
  replies: DiscussionReply[]
  isLikedByUser: boolean
  isDislikedByUser: boolean
  tags: string[]
}

interface DiscussionReply {
  id: string
  postId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  isAnonymous: boolean
  attachments?: File[]
  createdAt: Date
  updatedAt: Date
  likes: number
  dislikes: number
  isLikedByUser: boolean
  isDislikedByUser: boolean
  parentReplyId?: string
}

interface PostCardProps {
  post: DiscussionPost
  onReply: (postId: string, reply: DiscussionReply) => void
  onLike: (postId: string) => void
  onReport: (postId: string, reason: string) => void
  currentUserId?: string
  allowReplies: boolean
  showReplies?: boolean
}

interface ReplyFormProps {
  postId: string
  onSubmit: (reply: DiscussionReply) => void
  onCancel: () => void
  allowAnonymous: boolean
  allowAttachments: boolean
  currentUserId?: string
  currentUserName?: string
}

interface DiscussionStatsProps {
  discussion: DiscussionContent
  posts: DiscussionPost[]
  currentUserId?: string
}

// =================================================================
// 🎯 UTILITY FUNCTIONS
// =================================================================

const generatePostId = (): string => {
  return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const generateReplyId = (): string => {
  return `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const getUserInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const extractHashtags = (content: string): string[] => {
  const hashtagRegex = /#[\w]+/g
  return content.match(hashtagRegex)?.map(tag => tag.slice(1)) || []
}

const extractMentions = (content: string): string[] => {
  const mentionRegex = /@[\w]+/g
  return content.match(mentionRegex)?.map(mention => mention.slice(1)) || []
}

// =================================================================
// 🎯 MAIN COMPONENT
// =================================================================

function DiscussionRenderer({
  content,
  onCreatePost,
  onReplyToPost,
  onLikePost,
  onReportPost,
  existingPosts = [],
  currentUserId = 'current-user',
  currentUserName = 'Current User',
  isReadOnly = false,
  className = ''
}: DiscussionRendererProps) {
  // ===============================================================
  // 🎯 STATE MANAGEMENT
  // ===============================================================
  
  const [posts, setPosts] = useState<DiscussionPost[]>(existingPosts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'replies'>('newest')
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [activeReplyForm, setActiveReplyForm] = useState<string | null>(null)

  // ===============================================================
  // 🎯 COMPUTED VALUES
  // ===============================================================
  
  const isDiscussionClosed = content.discussionData.autoCloseAt ? 
    new Date() > content.discussionData.autoCloseAt : false

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.userName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'popular':
        return (b.likes - b.dislikes) - (a.likes - a.dislikes)
      case 'replies':
        return b.replyCount - a.replyCount
      default:
        return 0
    }
  })

  const pinnedPosts = sortedPosts.filter(post => post.isPinned)
  const regularPosts = sortedPosts.filter(post => !post.isPinned)

  // ===============================================================
  // 🎯 HANDLERS
  // ===============================================================
  
  const handleCreatePost = useCallback(async (postData: DiscussionPost) => {
    setPosts(prev => [postData, ...prev])
    setShowNewPostForm(false)
    onCreatePost?.(postData)
  }, [onCreatePost])

  const handleReplyToPost = useCallback(async (postId: string, reply: DiscussionReply) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, replies: [...post.replies, reply], replyCount: post.replyCount + 1 }
        : post
    ))
    setActiveReplyForm(null)
    onReplyToPost?.(reply)
  }, [onReplyToPost])

  const handleLikePost = useCallback((postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLikedByUser ? post.likes - 1 : post.likes + 1,
            dislikes: post.isDislikedByUser ? post.dislikes - 1 : post.dislikes,
            isLikedByUser: !post.isLikedByUser,
            isDislikedByUser: false
          }
        : post
    ))
    onLikePost?.(postId)
  }, [onLikePost])

  // ===============================================================
  // 🎯 RENDER
  // ===============================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Discussion Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {content.title}
              </CardTitle>
              
              {content.description && (
                <p className="text-gray-600">{content.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm">
                <Badge variant={content.discussionData.discussionType === 'OPEN' ? 'default' : 
                              content.discussionData.discussionType === 'Q_AND_A' ? 'secondary' : 'outline'}>
                  {content.discussionData.discussionType.replace('_', ' ')}
                </Badge>
                
                {content.points > 0 && (
                  <div className="flex items-center gap-1">
                    <span>{content.points} points</span>
                  </div>
                )}
                
                {content.discussionData.minimumPosts > 0 && (
                  <div className="flex items-center gap-1">
                    <span>Min. {content.discussionData.minimumPosts} posts</span>
                  </div>
                )}
                
                {isDiscussionClosed && (
                  <Badge variant="destructive">Closed</Badge>
                )}
              </div>
            </div>
            
            <DiscussionStats 
              discussion={content} 
              posts={posts} 
              currentUserId={currentUserId} 
            />
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content.discussionData.topic }} />
          </div>
        </CardContent>
      </Card>

      {/* Discussion Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search and Filter */}
            <div className="flex flex-1 gap-3 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {content.discussionData.categories && content.discussionData.categories.length > 0 && (
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {content.discussionData.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="replies">Most Replies</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* New Post Button */}
            {!isReadOnly && !isDiscussionClosed && (
              <Button 
                onClick={() => setShowNewPostForm(true)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                New Post
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Post Form */}
      {showNewPostForm && !isReadOnly && (
        <NewPostForm
          discussion={content}
          onSubmit={handleCreatePost}
          onCancel={() => setShowNewPostForm(false)}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      )}

      {/* Discussion Posts */}
      <div className="space-y-4">
        {/* Pinned Posts */}
        {pinnedPosts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Pin className="w-4 h-4" />
              <span>Pinned Posts</span>
            </div>
            {pinnedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onReply={handleReplyToPost}
                onLike={handleLikePost}
                onReport={onReportPost!}
                currentUserId={currentUserId}
                allowReplies={!isDiscussionClosed && !isReadOnly}
                showReplies={true}
              />
            ))}
            <Separator />
          </div>
        )}

        {/* Regular Posts */}
        {regularPosts.length > 0 ? (
          regularPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onReply={handleReplyToPost}
              onLike={handleLikePost}
              onReport={onReportPost!}
              currentUserId={currentUserId}
              allowReplies={!isDiscussionClosed && !isReadOnly}
              showReplies={true}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Be the first to start the discussion!</p>
              {!isReadOnly && !isDiscussionClosed && (
                <Button onClick={() => setShowNewPostForm(true)}>
                  Create First Post
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// ✅ Arctic Siberia Export Standard
DiscussionRenderer.displayName = 'DiscussionRenderer'

// =================================================================
// 🎯 SUB-COMPONENTS
// =================================================================

function DiscussionStats({ discussion, posts, currentUserId }: DiscussionStatsProps) {
  const totalPosts = posts.length
  const totalReplies = posts.reduce((sum, post) => sum + post.replyCount, 0)
  const uniqueParticipants = new Set(posts.map(post => post.userId)).size
  const userPosts = posts.filter(post => post.userId === currentUserId).length

  return (
    <div className="text-right text-sm text-gray-600 space-y-1">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          <span>{totalPosts} posts</span>
        </div>
        <div className="flex items-center gap-1">
          <Reply className="w-4 h-4" />
          <span>{totalReplies} replies</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{uniqueParticipants} participants</span>
        </div>
      </div>
      
      {currentUserId && userPosts > 0 && (
        <div className="text-xs">
          Your posts: {userPosts} / {discussion.discussionData.minimumPosts} required
        </div>
      )}
    </div>
  )
}

function PostCard({ 
  post, 
  onReply, 
  onLike, 
  onReport, 
  currentUserId, 
  allowReplies,
  showReplies = true 
}: PostCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowRepliesState] = useState(false)

  const handleReplySubmit = (reply: DiscussionReply) => {
    onReply(post.id, reply)
    setShowReplyForm(false)
  }

  return (
    <Card className={post.isPinned ? 'border-yellow-200 bg-yellow-50' : ''}>
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.userAvatar} />
              <AvatarFallback>
                {post.isAnonymous ? '🎭' : getUserInitials(post.userName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {post.isAnonymous ? 'Anonymous' : post.userName}
                </span>
                {post.isPinned && (
                  <Badge variant="secondary" className="text-xs">
                    <Pin className="w-3 h-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                {post.category && (
                  <Badge variant="outline" className="text-xs">
                    <Hash className="w-3 h-3 mr-1" />
                    {post.category}
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: id })}
                {post.updatedAt > post.createdAt && (
                  <span className="ml-1">(edited)</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Post Content */}
        <div className="prose prose-sm max-w-none mb-4">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Post Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="mb-4 space-y-2">
            {post.attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded text-sm">
                <Paperclip className="w-4 h-4" />
                <span className="flex-1">{file.name}</span>
                <span className="text-gray-500">{formatFileSize(file.size)}</span>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1 ${post.isLikedByUser ? 'text-blue-600' : ''}`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{post.likes}</span>
            </Button>
            
            {allowReplies && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </Button>
            )}
            
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {post.replyCount > 0 && showReplies && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRepliesState(!showReplies)}
                className="text-sm text-gray-600"
              >
                {showReplies ? 'Hide' : 'Show'} {post.replyCount} replies
              </Button>
            )}
            
            <Button variant="ghost" size="sm">
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && allowReplies && (
          <div className="mt-4 pt-4 border-t">
            <ReplyForm
              postId={post.id}
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyForm(false)}
              allowAnonymous={true}
              allowAttachments={true}
              currentUserId={currentUserId}
              currentUserName="Current User"
            />
          </div>
        )}

        {/* Replies */}
        {showReplies && showReplies && post.replies.length > 0 && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {post.replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={reply.userAvatar} />
                  <AvatarFallback>
                    {reply.isAnonymous ? '🎭' : getUserInitials(reply.userName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {reply.isAnonymous ? 'Anonymous' : reply.userName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(reply.createdAt, { addSuffix: true, locale: id })}
                    </span>
                  </div>
                  
                  <div className="prose prose-sm">
                    <div dangerouslySetInnerHTML={{ __html: reply.content }} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs ${reply.isLikedByUser ? 'text-blue-600' : ''}`}
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {reply.likes}
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="text-xs">
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function NewPostForm({ 
  discussion, 
  onSubmit, 
  onCancel, 
  currentUserId, 
  currentUserName 
}: {
  discussion: DiscussionContent
  onSubmit: (post: DiscussionPost) => void
  onCancel: () => void
  currentUserId?: string
  currentUserName?: string
}) {
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
      category: '',
      isAnonymous: false,
      attachments: []
    }
  })

  const handleSubmit = async (formData: PostFormData) => {
    const post: DiscussionPost = {
      id: generatePostId(),
      discussionId: discussion.id,
      userId: currentUserId || 'anonymous',
      userName: formData.isAnonymous ? 'Anonymous' : (currentUserName || 'User'),
      content: formData.content,
      category: formData.category,
      isAnonymous: formData.isAnonymous,
      isPinned: false,
      attachments: files,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      dislikes: 0,
      replyCount: 0,
      replies: [],
      isLikedByUser: false,
      isDislikedByUser: false,
      tags: extractHashtags(formData.content)
    }
    
    onSubmit(post)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Create New Post
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Category Selection */}
          {discussion.discussionData.categories && discussion.discussionData.categories.length > 0 && (
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.watch('category') || ''}
                onValueChange={(value) => form.setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {discussion.discussionData.categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Post Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Post *</Label>
            <Textarea
              id="content"
              {...form.register('content')}
              placeholder="Share your thoughts, ask questions, or contribute to the discussion..."
              rows={6}
              className={form.formState.errors.content ? 'border-red-500' : ''}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-red-600">{form.formState.errors.content.message}</p>
            )}
          </div>

          {/* File Attachments */}
          {discussion.discussionData.allowAttachments && (
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <Paperclip className="w-4 h-4" />
                      <span className="flex-1 text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Anonymous Option */}
          {discussion.discussionData.isAnonymous && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAnonymous"
                {...form.register('isAnonymous')}
                className="rounded"
              />
              <Label htmlFor="isAnonymous" className="text-sm">
                Post anonymously
              </Label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-600">
              <p>💡 Use @username to mention someone or #tag for topics</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Post
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function ReplyForm({ 
  postId, 
  onSubmit, 
  onCancel, 
  allowAnonymous, 
  allowAttachments,
  currentUserId,
  currentUserName 
}: ReplyFormProps) {
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const form = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      content: '',
      isAnonymous: false,
      attachments: []
    }
  })

  const handleSubmit = async (formData: ReplyFormData) => {
    const reply: DiscussionReply = {
      id: generateReplyId(),
      postId,
      userId: currentUserId || 'anonymous',
      userName: formData.isAnonymous ? 'Anonymous' : (currentUserName || 'User'),
      content: formData.content,
      isAnonymous: formData.isAnonymous,
      attachments: files,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      dislikes: 0,
      isLikedByUser: false,
      isDislikedByUser: false
    }
    
    onSubmit(reply)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
      {/* Reply Content */}
      <div className="space-y-2">
        <Textarea
          {...form.register('content')}
          placeholder="Write your reply..."
          rows={3}
          className={form.formState.errors.content ? 'border-red-500' : ''}
        />
        {form.formState.errors.content && (
          <p className="text-sm text-red-600">{form.formState.errors.content.message}</p>
        )}
      </div>

      {/* File Attachments */}
      {allowAttachments && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Attach
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {allowAnonymous && (
              <label className="flex items-center space-x-2 ml-4">
                <input
                  type="checkbox"
                  {...form.register('isAnonymous')}
                  className="rounded"
                />
                <span className="text-sm">Reply anonymously</span>
              </label>
            )}
          </div>
          
          {files.length > 0 && (
            <div className="space-y-1">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-1 text-sm">
                  <Paperclip className="w-3 h-3" />
                  <span className="flex-1">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className="flex items-center gap-1">
          <Reply className="w-3 h-3" />
          Reply
        </Button>
      </div>
    </form>
  )
}

// =================================================================
// 🎯 EXPORTS - Arctic Siberia Export Standard
// =================================================================

export default DiscussionRenderer
export { 
  DiscussionStats, 
  PostCard, 
  NewPostForm, 
  ReplyForm, 
  type DiscussionRendererProps 
}