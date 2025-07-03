// File: src/components/course/pricing-form.tsx

'use client'

import { useState } from 'react'
import { 
  Card, CardContent, CardHeader, CardTitle,
  Input,
  Label,
  Badge,
  Alert,
  AlertDescription,
  Switch,
  Slider
} from '@/components/ui'

import { 
  DollarSign,
  Gift,
  TrendingUp,
  Info,
  CheckCircle,
  Star,
  Users,
  Clock,
  Calculator
} from 'lucide-react'

interface CourseData {
  price: number
  freeContentLimit: number
}

interface PricingFormProps {
  courseData: CourseData
  onDataChange: (field: keyof CourseData, value: number) => void
  totalSessions?: number
  totalContents?: number
}

const PRICING_TIERS = [
  { 
    range: [0, 0], 
    label: 'Free Course', 
    color: 'bg-green-100 text-green-800',
    description: 'Perfect for building audience and showcasing expertise',
    benefits: ['Maximum exposure', 'Build reputation', 'Attract students']
  },
  { 
    range: [1, 500000], 
    label: 'Budget Friendly', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Accessible pricing for beginners and short courses',
    benefits: ['Low barrier to entry', 'High conversion rate', 'Good for testing']
  },
  { 
    range: [500001, 2000000], 
    label: 'Standard Pricing', 
    color: 'bg-purple-100 text-purple-800',
    description: 'Ideal for comprehensive courses with quality content',
    benefits: ['Balanced value', 'Professional perception', 'Good margins']
  },
  { 
    range: [2000001, 10000000], 
    label: 'Premium Course', 
    color: 'bg-orange-100 text-orange-800',
    description: 'For expert-level content and specialized skills',
    benefits: ['High perceived value', 'Expert positioning', 'Better margins']
  }
]

const FREE_CONTENT_RECOMMENDATIONS = [
  { sessions: 0, recommendation: 0, reason: 'No content available' },
  { sessions: 3, recommendation: 1, reason: 'Show course introduction' },
  { sessions: 5, recommendation: 2, reason: 'Demonstrate teaching style' },
  { sessions: 8, recommendation: 3, reason: 'Balance preview and paid content' },
  { sessions: 12, recommendation: 4, reason: 'Generous preview for longer courses' },
  { sessions: 20, recommendation: 5, reason: 'Comprehensive preview for extensive courses' }
]

export default function PricingForm({ 
  courseData, 
  onDataChange, 
  totalSessions = 0,
  totalContents = 0 
}: PricingFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const getCurrentTier = () => {
    return PRICING_TIERS.find(tier => 
      courseData.price >= tier.range[0] && courseData.price <= tier.range[1]
    ) || PRICING_TIERS[1]
  }

  const getRecommendedFreeContent = () => {
    const recommendation = FREE_CONTENT_RECOMMENDATIONS
      .reverse()
      .find(rec => totalSessions >= rec.sessions)
    
    return recommendation || FREE_CONTENT_RECOMMENDATIONS[0]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const calculateRevenue = () => {
    const platformFee = 0.15 // 15% platform fee
    const instructorShare = courseData.price * (1 - platformFee)
    return {
      gross: courseData.price,
      platformFee: courseData.price * platformFee,
      instructorShare,
      platformFeePercent: platformFee * 100
    }
  }

  const currentTier = getCurrentTier()
  const recommendedFree = getRecommendedFreeContent()
  const revenue = calculateRevenue()

  return (
    <div className="max-w-4xl mx-auto px-6 space-y-6">
      {/* Pricing Strategy Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span>Course Pricing</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price Input Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center space-x-1">
                <span>Course Price (IDR)</span>
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  max="10000000"
                  step="50000"
                  placeholder="0"
                  value={courseData.price}
                  onChange={(e) => onDataChange('price', parseInt(e.target.value) || 0)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-600">
                  Set to 0 for free course. Maximum: 10,000,000 IDR
                </p>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(courseData.price)}
                </span>
              </div>
            </div>

            {/* Pricing Tier Indicator */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge className={currentTier.color}>
                  {currentTier.label}
                </Badge>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.ceil((courseData.price / 2000000) * 5) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">{currentTier.description}</p>
              <div className="flex flex-wrap gap-2">
                {currentTier.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-1 text-xs">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Price Suggestions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Price Suggestions</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0, 200000, 500000, 1000000].map(price => (
                <button
                  key={price}
                  onClick={() => onDataChange('price', price)}
                  className={`p-3 text-center border rounded-lg transition-all duration-200 hover:shadow-md ${
                    courseData.price === price 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{formatCurrency(price)}</div>
                  <div className="text-xs text-gray-600">
                    {price === 0 ? 'Free' : 
                     price <= 500000 ? 'Budget' : 
                     price <= 1000000 ? 'Standard' : 'Premium'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Free Content Strategy Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-blue-600" />
            <span>Free Preview Strategy</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="freeLimit" className="flex items-center space-x-1">
                <span>Free Content Limit</span>
                <span className="text-red-500">*</span>
              </Label>
              
              {/* Professional Slider for Free Content */}
              <div className="space-y-3">
                <Slider
                  value={[courseData.freeContentLimit]}
                  onValueChange={(value) => onDataChange('freeContentLimit', value[0])}
                  max={Math.min(10, totalSessions)}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0 sessions</span>
                  <span className="font-medium text-blue-600">
                    {courseData.freeContentLimit} sessions free
                  </span>
                  <span>{Math.min(10, totalSessions)} sessions</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-sm font-medium">Total Sessions</div>
                  <div className="text-lg font-bold text-blue-600">{totalSessions}</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Gift className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <div className="text-sm font-medium">Free Sessions</div>
                  <div className="text-lg font-bold text-green-600">{courseData.freeContentLimit}</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <div className="text-sm font-medium">Paid Sessions</div>
                  <div className="text-lg font-bold text-purple-600">
                    {Math.max(0, totalSessions - courseData.freeContentLimit)}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation Alert */}
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>Recommendation:</strong> For {totalSessions} sessions, we suggest 
                <strong> {recommendedFree.recommendation} free sessions</strong>. 
                {recommendedFree.reason}.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown Card */}
      {courseData.price > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              <span>Revenue Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Gross Revenue</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(revenue.gross)}
                </div>
                <div className="text-xs text-gray-500">Per student</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-red-600">Platform Fee ({revenue.platformFeePercent}%)</div>
                <div className="text-xl font-bold text-red-700">
                  -{formatCurrency(revenue.platformFee)}
                </div>
                <div className="text-xs text-red-500">Arctic Siberia fee</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600">Your Earnings</div>
                <div className="text-xl font-bold text-green-700">
                  {formatCurrency(revenue.instructorShare)}
                </div>
                <div className="text-xs text-green-500">Per student</div>
              </div>
            </div>

            <Alert className="border-green-200 bg-green-50">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>Revenue sharing:</strong> You keep 85% of gross revenue. 
                With 100 students, you would earn <strong>{formatCurrency(revenue.instructorShare * 100)}</strong>.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Pricing Guidelines */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 mb-2">Pricing Strategy Tips</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• <strong>Free courses:</strong> Great for building audience and establishing credibility</li>
                <li>• <strong>Budget pricing (≤500k):</strong> Perfect for short courses or testing market demand</li>
                <li>• <strong>Standard pricing (500k-2M):</strong> Ideal for comprehensive courses with 8+ sessions</li>
                <li>• <strong>Premium pricing (2M+):</strong> For expert-level content with unique value proposition</li>
                <li>• <strong>Free preview:</strong> 20-30% of content helps conversion without giving away too much</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}