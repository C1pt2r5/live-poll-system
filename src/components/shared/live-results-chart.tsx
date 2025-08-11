"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "motion/react"
import { BarChart3, PieChart, List, Users } from "lucide-react"

interface PollOption {
  id: string
  text: string
  votes: number
  voters?: Array<{
    id: string
    name: string
    avatar?: string
  }>
}

interface LiveResultsChartProps {
  question: string
  options: PollOption[]
  totalVotes: number
  isLoading?: boolean
  showVoters?: boolean
  className?: string
}

type ChartType = "bar" | "pie" | "list"

const CHART_COLORS = [
  "var(--chart-1)", // Primary blue
  "var(--chart-2)", // Success green
  "var(--chart-3)", // Warning orange
  "var(--chart-4)", // Error red
  "var(--chart-5)", // Secondary gray
]

export default function LiveResultsChart({
  question,
  options,
  totalVotes,
  isLoading = false,
  showVoters = false,
  className = ""
}: LiveResultsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [animationKey, setAnimationKey] = useState(0)

  // Trigger re-animation when data changes
  useEffect(() => {
    setAnimationKey(prev => prev + 1)
  }, [options, totalVotes])

  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const renderBarChart = () => (
    <div className="space-y-4">
      {options.map((option, index) => {
        const percentage = getPercentage(option.votes)
        const color = CHART_COLORS[index % CHART_COLORS.length]
        
        return (
          <div key={`${option.id}-${animationKey}`} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{option.text}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {option.votes} vote{option.votes !== 1 ? "s" : ""}
                </span>
                <Badge variant="secondary" className="min-w-[3rem] justify-center">
                  {percentage}%
                </Badge>
              </div>
            </div>
            
            <div className="relative h-8 bg-muted rounded-md overflow-hidden">
              <motion.div
                className="h-full rounded-md"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            {showVoters && option.voters && option.voters.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {option.voters.slice(0, 8).map((voter) => (
                  <Avatar key={voter.id} className="h-6 w-6">
                    <AvatarImage src={voter.avatar} alt={voter.name} />
                    <AvatarFallback className="text-xs">
                      {getInitials(voter.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {option.voters.length > 8 && (
                  <Badge variant="outline" className="h-6 text-xs">
                    +{option.voters.length - 8}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  const renderPieChart = () => {
    const radius = 80
    const centerX = 100
    const centerY = 100
    
    let currentAngle = 0
    const segments = options.map((option, index) => {
      const percentage = getPercentage(option.votes)
      const angle = (percentage / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle += angle

      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
      const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
      const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

      const largeArcFlag = angle > 180 ? 1 : 0
      const pathData = percentage > 0 
        ? `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
        : ""

      return {
        ...option,
        percentage,
        pathData,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }
    })

    return (
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {segments.map((segment, index) => (
              <motion.path
                key={`${segment.id}-${animationKey}`}
                d={segment.pathData}
                fill={segment.color}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="hover:opacity-80 cursor-pointer"
              />
            ))}
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalVotes}</div>
              <div className="text-sm text-muted-foreground">votes</div>
            </div>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          {segments.map((segment) => (
            <div key={segment.id} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: segment.color }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {segment.text}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {segment.votes}
                    </span>
                    <Badge variant="secondary" className="min-w-[3rem] justify-center">
                      {segment.percentage}%
                    </Badge>
                  </div>
                </div>
                
                {showVoters && segment.voters && segment.voters.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {segment.voters.slice(0, 6).map((voter) => (
                      <Avatar key={voter.id} className="h-5 w-5">
                        <AvatarImage src={voter.avatar} alt={voter.name} />
                        <AvatarFallback className="text-xs">
                          {getInitials(voter.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {segment.voters.length > 6 && (
                      <Badge variant="outline" className="h-5 text-xs px-1">
                        +{segment.voters.length - 6}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderList = () => (
    <div className="space-y-3">
      {options.map((option, index) => {
        const percentage = getPercentage(option.votes)
        const color = CHART_COLORS[index % CHART_COLORS.length]
        
        return (
          <motion.div
            key={`${option.id}-${animationKey}`}
            className="flex items-center justify-between p-3 bg-muted rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="font-medium text-foreground">{option.text}</span>
            </div>
            
            <div className="flex items-center gap-4">
              {showVoters && option.voters && option.voters.length > 0 && (
                <div className="flex -space-x-1">
                  {option.voters.slice(0, 3).map((voter) => (
                    <Avatar key={voter.id} className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={voter.avatar} alt={voter.name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(voter.name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {option.voters.length > 3 && (
                    <div className="h-6 w-6 bg-muted-foreground text-white rounded-full flex items-center justify-center text-xs border-2 border-background">
                      +{option.voters.length - 3}
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">{percentage}%</div>
                <div className="text-xs text-muted-foreground">
                  {option.votes} vote{option.votes !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )

  if (isLoading) {
    return (
      <Card className={`bg-card ${className}`}>
        <CardHeader>
          <div className="h-6 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                <div className="h-8 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-card ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground mb-2">
              {question}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{totalVotes} participant{totalVotes !== 1 ? "s" : ""}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={chartType === "bar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setChartType("bar")}
              className="h-8 w-8 p-0"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "pie" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setChartType("pie")}
              className="h-8 w-8 p-0"
            >
              <PieChart className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setChartType("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {totalVotes === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No votes yet</p>
            <p className="text-sm">Results will appear as participants vote</p>
          </div>
        ) : (
          <>
            {chartType === "bar" && renderBarChart()}
            {chartType === "pie" && renderPieChart()}
            {chartType === "list" && renderList()}
          </>
        )}
      </CardContent>
    </Card>
  )
}