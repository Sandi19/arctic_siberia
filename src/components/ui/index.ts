// File: src/components/ui/index.ts

// ✅ ALL UI COMPONENTS - Default exports (setelah manual fix)
export { default as Alert } from './alert'
export { default as Avatar } from './avatar'
export { default as Badge } from './badge'
export { default as Button } from './button'
export { default as Card } from './card'
export { default as Dialog } from './dialog'
export { default as Input } from './input'
export { default as Label } from './label'
export { default as Modal } from './modal'
export { default as Progress } from './progress'
export { default as ScrollArea } from './scroll-area'
export { default as Select } from './select'
export { default as Separator } from './separator'
export { default as Slider } from './slider'
export { default as Switch } from './switch'
export { default as Tabs } from './tabs'
export { default as Textarea } from './textarea'

// ✅ SUB-COMPONENTS - Named exports untuk compound components
export { AvatarImage, AvatarFallback, CompleteAvatar, getInitials } from './avatar'
export { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './card'
export { 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './dialog'

export { AlertDescription } from './alert'

export { SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

export { TabsContent, TabsList, TabsTrigger } from './tabs'

export { ScrollBar } from './scroll-area'

export { 
  ModalHeader, 
  ModalTitle, 
  ModalBody, 
  ModalFooter 
} from './modal'

export { 
  ProgressWithValue, 
  CircularProgress 
} from './progress'

// ✅ ALTERNATIVE: Bisa juga menggunakan wildcard untuk named exports
// export * from './avatar'  // Hanya untuk file yang pure named exports