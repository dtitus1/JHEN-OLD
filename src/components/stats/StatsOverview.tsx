import React from 'react'
import { BarChart3, Users, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'

interface StatsOverviewProps {
  totalPlayers: number
  activeLeagues: number
  weeklyUpdates: number
  loading: boolean
}

export function StatsOverview({ totalPlayers, activeLeagues, weeklyUpdates, loading }: StatsOverviewProps) {
  const stats = [
    {
      title: 'Total Players Tracked',
      value: totalPlayers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Leagues',
      value: activeLeagues.toLocaleString(),
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Weekly Updates',
      value: weeklyUpdates.toLocaleString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Data Sources',
      value: '5+',
      icon: Activity,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} mb-4`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-secondary-900">
                {loading ? (
                  <div className="h-8 bg-secondary-200 rounded animate-pulse"></div>
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-sm text-secondary-600">{stat.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}