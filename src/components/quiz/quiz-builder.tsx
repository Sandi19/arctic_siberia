// File: src/components/quiz/quiz-builder.tsx

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Settings, 
  Eye, 
  Trash2, 
  GripVertical, 
  Copy, 
  Save,
  AlertTriangle,
  Clock,
  Target,
  FileText
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// Import quiz builders
import MCQBuilder from './builder/mcq-builder';
import TrueFalseBuilder from './builder/true-false-builder';
import EssayBuilder from './builder/essay-builder';
import CheckboxBuilder from './builder/checkbox-builder';
import FillBlankBuilder from './builder/fill-blank-builder';
import MatchingBuilder from './builder/matching-builder';
import DragDropBuilder from './builder/drag-drop-builder';
import CodeInputBuilder from './builder/code-input-builder';

// Import quiz renderer for preview
import QuizRenderer from './quiz-renderer';

// Import types
import type { 
  Quiz, 
  QuizQuestion, 
  QuizSettings, 
  QuestionType 
} from './types';

// Quiz form schema
const quizFormSchema = z.object({
  title: z.string().min(1, 'Judul quiz wajib diisi'),
  description: z.string().optional(),
  settings: z.object({
    timeLimit: z.number().min(0).optional(),
    passingScore: z.number().min(0).max(100).optional(),
    allowRetakes: z.boolean().default(true),
    showResults: z.boolean().default(true),
    randomizeQuestions: z.boolean().default(false),
    randomizeOptions: z.boolean().default(false),
    maxAttempts: z.number().min(1).optional()
  })
});

type QuizFormData = z.infer<typeof quizFormSchema>;

interface QuizBuilderProps {
  initialQuiz?: Partial<Quiz>;
  onSave?: (quiz: Quiz) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

const QUESTION_TYPES: { value: QuestionType; label: string; description: string }[] = [
  { value: 'multiple-choice', label: 'Pilihan Ganda', description: 'Satu jawaban benar dari beberapa pilihan' },
  { value: 'true-false', label: 'Benar/Salah', description: 'Pertanyaan dengan jawaban benar atau salah' },
  { value: 'checkbox', label: 'Checkbox', description: 'Beberapa jawaban benar dari beberapa pilihan' },
  { value: 'fill-blank', label: 'Isi Titik-titik', description: 'Mengisi bagian yang kosong' },
  { value: 'essay', label: 'Essay', description: 'Jawaban berupa teks panjang' },
  { value: 'matching', label: 'Menjodohkan', description: 'Mencocokkan item dengan pasangannya' },
  { value: 'drag-drop', label: 'Drag & Drop', description: 'Menyusun item dengan menarik dan melepas' },
  { value: 'code-input', label: 'Input Kode', description: 'Menulis kode program' }
];

export default function QuizBuilder({
  initialQuiz,
  onSave,
  onCancel,
  isLoading = false,
  className = ''
}: QuizBuilderProps) {
  // Form management
  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: initialQuiz?.title || '',
      description: initialQuiz?.description || '',
      settings: {
        timeLimit: initialQuiz?.settings?.timeLimit || undefined,
        passingScore: initialQuiz?.settings?.passingScore || undefined,
        allowRetakes: initialQuiz?.settings?.allowRetakes ?? true,
        showResults: initialQuiz?.settings?.showResults ?? true,
        randomizeQuestions: initialQuiz?.settings?.randomizeQuestions ?? false,
        randomizeOptions: initialQuiz?.settings?.randomizeOptions ?? false,
        maxAttempts: initialQuiz?.settings?.maxAttempts || undefined
      }
    }
  });

  // State management
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuiz?.questions || []);
  const [activeTab, setActiveTab] = useState<'builder' | 'settings' | 'preview'>('builder');
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>('multiple-choice');

  // Calculate quiz stats
  const totalQuestions = questions.length;
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
  const estimatedTime = questions.length * 2; // Rough estimate: 2 minutes per question

  // Handle question drag and drop
  const handleQuestionReorder = useCallback((result: any) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order field
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setQuestions(updatedItems);
  }, [questions]);

  // Add new question
  const handleAddQuestion = useCallback((type: QuestionType) => {
    const newQuestion: Partial<QuizQuestion> = {
      id: `question-${Date.now()}`,
      type,
      question: '',
      order: questions.length,
      points: 1,
      required: true
    };

    setEditingQuestion(newQuestion as QuizQuestion);
    setSelectedQuestionType(type);
    setShowQuestionDialog(true);
  }, [questions.length]);

  // Edit question
  const handleEditQuestion = useCallback((question: QuizQuestion) => {
    setEditingQuestion(question);
    setSelectedQuestionType(question.type);
    setShowQuestionDialog(true);
  }, []);

  // Save question
  const handleSaveQuestion = useCallback((questionData: QuizQuestion) => {
    setQuestions(prev => {
      const existingIndex = prev.findIndex(q => q.id === questionData.id);
      
      if (existingIndex >= 0) {
        // Update existing question
        const updated = [...prev];
        updated[existingIndex] = questionData;
        return updated;
      } else {
        // Add new question
        return [...prev, questionData];
      }
    });

    setShowQuestionDialog(false);
    setEditingQuestion(null);
    toast.success('Pertanyaan berhasil disimpan');
  }, []);

  // Delete question
  const handleDeleteQuestion = useCallback((questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    toast.success('Pertanyaan berhasil dihapus');
  }, []);

  // Duplicate question
  const handleDuplicateQuestion = useCallback((question: QuizQuestion) => {
    const duplicated: QuizQuestion = {
      ...question,
      id: `question-${Date.now()}`,
      question: `${question.question} (Copy)`,
      order: questions.length
    };

    setQuestions(prev => [...prev, duplicated]);
    toast.success('Pertanyaan berhasil diduplikasi');
  }, [questions.length]);

  // Save quiz
  const handleSaveQuiz = useCallback(async (data: QuizFormData) => {
    if (questions.length === 0) {
      toast.error('Quiz harus memiliki minimal 1 pertanyaan');
      return;
    }

    try {
      const quiz: Quiz = {
        id: initialQuiz?.id || `quiz-${Date.now()}`,
        title: data.title,
        description: data.description || '',
        questions: questions.sort((a, b) => a.order - b.order),
        settings: data.settings,
        createdAt: initialQuiz?.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (onSave) {
        onSave(quiz);
      }

      toast.success('Quiz berhasil disimpan');
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Gagal menyimpan quiz');
    }
  }, [questions, initialQuiz, onSave]);

  // Render question builder based on type
  const renderQuestionBuilder = () => {
    if (!editingQuestion) return null;

    const commonProps = {
      question: editingQuestion,
      onSave: handleSaveQuestion,
      onCancel: () => {
        setShowQuestionDialog(false);
        setEditingQuestion(null);
      }
    };

    switch (selectedQuestionType) {
      case 'multiple-choice':
        return <MCQBuilder {...commonProps} />;
      case 'true-false':
        return <TrueFalseBuilder {...commonProps} />;
      case 'essay':
        return <EssayBuilder {...commonProps} />;
      case 'checkbox':
        return <CheckboxBuilder {...commonProps} />;
      case 'fill-blank':
        return <FillBlankBuilder {...commonProps} />;
      case 'matching':
        return <MatchingBuilder {...commonProps} />;
      case 'drag-drop':
        return <DragDropBuilder {...commonProps} />;
      case 'code-input':
        return <CodeInputBuilder {...commonProps} />;
      default:
        return null;
    }
  };

  // Generate preview quiz
  const getPreviewQuiz = (): Quiz => {
    const formData = form.getValues();
    return {
      id: 'preview',
      title: formData.title || 'Quiz Preview',
      description: formData.description || '',
      questions: questions.sort((a, b) => a.order - b.order),
      settings: formData.settings,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quiz Builder</h2>
          <p className="text-muted-foreground">
            Buat dan kelola quiz untuk pembelajaran yang interaktif
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            onClick={form.handleSubmit(handleSaveQuiz)}
            disabled={isLoading || questions.length === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Menyimpan...' : 'Simpan Quiz'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Pertanyaan</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{totalPoints}</p>
              <p className="text-sm text-muted-foreground">Total Poin</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">~{estimatedTime}</p>
              <p className="text-sm text-muted-foreground">Menit (Estimasi)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          <TabsTrigger value="preview" disabled={questions.length === 0}>
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          {/* Basic Quiz Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Quiz *</Label>
                  <Input
                    id="title"
                    {...form.register('title')}
                    placeholder="Masukkan judul quiz"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Deskripsi singkat tentang quiz"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Question Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pertanyaan Quiz</CardTitle>
                <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Pertanyaan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingQuestion?.id?.includes('question-') && !questions.find(q => q.id === editingQuestion.id)
                          ? 'Tambah Pertanyaan Baru'
                          : 'Edit Pertanyaan'
                        }
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {/* Question Type Selector */}
                      <div className="space-y-2">
                        <Label>Tipe Pertanyaan</Label>
                        <Select
                          value={selectedQuestionType}
                          onValueChange={(value) => setSelectedQuestionType(value as QuestionType)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUESTION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div>
                                  <div className="font-medium">{type.label}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {type.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Question Builder */}
                      {renderQuestionBuilder()}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Belum ada pertanyaan</h3>
                  <p className="text-muted-foreground mb-4">
                    Mulai buat quiz dengan menambahkan pertanyaan pertama
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
                    {QUESTION_TYPES.slice(0, 4).map((type) => (
                      <Button
                        key={type.value}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddQuestion(type.value)}
                        className="flex-col h-auto p-3"
                      >
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.description}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleQuestionReorder}>
                  <Droppable droppableId="questions">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {questions
                          .sort((a, b) => a.order - b.order)
                          .map((question, index) => (
                            <Draggable
                              key={question.id}
                              draggableId={question.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`transition-shadow ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                      {/* Drag Handle */}
                                      <div
                                        {...provided.dragHandleProps}
                                        className="mt-1 p-1 hover:bg-muted rounded cursor-move"
                                      >
                                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                                      </div>

                                      {/* Question Content */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Badge variant="outline">
                                            {QUESTION_TYPES.find(t => t.value === question.type)?.label}
                                          </Badge>
                                          <Badge variant="secondary">
                                            {question.points || 1} Poin
                                          </Badge>
                                          {question.required && (
                                            <Badge variant="destructive" className="text-xs">
                                              Wajib
                                            </Badge>
                                          )}
                                        </div>
                                        
                                        <h4 className="font-medium mb-1 truncate">
                                          {question.question || 'Pertanyaan belum diisi'}
                                        </h4>
                                        
                                        <p className="text-sm text-muted-foreground">
                                          Pertanyaan {index + 1} dari {questions.length}
                                        </p>
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditQuestion(question)}
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDuplicateQuestion(question)}
                                        >
                                          <Copy className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteQuestion(question.id)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Pengaturan Quiz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Pengaturan Waktu</h4>
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Batas Waktu (menit)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="0"
                    {...form.register('settings.timeLimit', { valueAsNumber: true })}
                    placeholder="Kosongkan untuk tanpa batas waktu"
                  />
                  <p className="text-sm text-muted-foreground">
                    Biarkan kosong jika tidak ada batas waktu
                  </p>
                </div>
              </div>

              <Separator />

              {/* Scoring Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Pengaturan Nilai</h4>
                <div className="space-y-2">
                  <Label htmlFor="passingScore">Nilai Lulus (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    {...form.register('settings.passingScore', { valueAsNumber: true })}
                    placeholder="Masukkan persentase nilai lulus"
                  />
                  <p className="text-sm text-muted-foreground">
                    Nilai minimum untuk lulus quiz (0-100%)
                  </p>
                </div>
              </div>

              <Separator />

              {/* Attempt Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Pengaturan Percobaan</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Izinkan Mengulang</Label>
                    <p className="text-sm text-muted-foreground">
                      Peserta dapat mengulang quiz
                    </p>
                  </div>
                  <Switch
                    {...form.register('settings.allowRetakes')}
                    checked={form.watch('settings.allowRetakes')}
                    onCheckedChange={(checked) => 
                      form.setValue('settings.allowRetakes', checked)
                    }
                  />
                </div>

                {form.watch('settings.allowRetakes') && (
                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Maksimal Percobaan</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      min="1"
                      {...form.register('settings.maxAttempts', { valueAsNumber: true })}
                      placeholder="Kosongkan untuk tanpa batas"
                    />
                    <p className="text-sm text-muted-foreground">
                      Biarkan kosong untuk percobaan tak terbatas
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Display Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Pengaturan Tampilan</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Tampilkan Hasil</Label>
                    <p className="text-sm text-muted-foreground">
                      Peserta dapat melihat hasil setelah selesai
                    </p>
                  </div>
                  <Switch
                    {...form.register('settings.showResults')}
                    checked={form.watch('settings.showResults')}
                    onCheckedChange={(checked) => 
                      form.setValue('settings.showResults', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Acak Urutan Pertanyaan</Label>
                    <p className="text-sm text-muted-foreground">
                      Pertanyaan ditampilkan secara acak
                    </p>
                  </div>
                  <Switch
                    {...form.register('settings.randomizeQuestions')}
                    checked={form.watch('settings.randomizeQuestions')}
                    onCheckedChange={(checked) => 
                      form.setValue('settings.randomizeQuestions', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Acak Urutan Opsi</Label>
                    <p className="text-sm text-muted-foreground">
                      Opsi jawaban ditampilkan secara acak
                    </p>
                  </div>
                  <Switch
                    {...form.register('settings.randomizeOptions')}
                    checked={form.watch('settings.randomizeOptions')}
                    onCheckedChange={(checked) => 
                      form.setValue('settings.randomizeOptions', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          {questions.length > 0 ? (
            <div>
              <Alert className="mb-6">
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  Ini adalah preview quiz. Semua fungsi akan bekerja seperti quiz sesungguhnya, 
                  tetapi jawaban tidak akan disimpan.
                </AlertDescription>
              </Alert>
              
              <QuizRenderer
                quiz={getPreviewQuiz()}
                isPreview={true}
                showTimer={!!form.watch('settings.timeLimit')}
                allowNavigation={true}
                autoSubmit={false}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tidak ada preview</h3>
                <p className="text-muted-foreground">
                  Tambahkan pertanyaan di tab Builder untuk melihat preview quiz
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}