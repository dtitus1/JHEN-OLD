import React, { useState, useEffect } from 'react'
import { Calendar, TrendingUp, Shield, Users, Target, AlertTriangle, RefreshCw, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PositionalMatchups } from '../components/dashboard/PositionalMatchups'
import { PanicMeter } from '../components/dashboard/PanicMeter'
import { ByeWeeks } from '../components/dashboard/ByeWeeks'
import { ScheduleAnalysis } from '../components/dashboard/ScheduleAnalysis'
import { DefensiveSchemes } from '../components/dashboard/DefensiveSchemes'
import { OLineRankings } from '../components/dashboard/OLineRankings'
import { SleeperIntegration } from '../components/dashboard/SleeperIntegration'

type DashboardTab = 'positional-matchups' | 'panic-meter' | 'bye-weeks' | 'schedule-analysis' | 'defensive-schemes' | 'oline-rankings' | 'sleeper-data'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('sleeper-data')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)

  const tabs = [
    {
      id: 'sleeper-data' as DashboardTab,
      name: 'Sleeper Data',
      icon: Activity,
      description: 'Real-time data from Sleeper API'
    },
    {
      id: 'positional-matchups' as DashboardTab,
      name: 'Positional Matchups',
      icon: Target,
      description: 'Weekly defensive rankings vs positions'
    },
    {
      id: 'panic-meter' as DashboardTab,
      name: 'Panic Meter',
      icon: AlertTriangle,
      description: 'Risk assessment for underperforming players'
    },
    {
      id: 'bye-weeks' as DashboardTab,
      name: 'Bye Weeks',
      icon: Calendar,
      description: 'Interactive bye week planning tool'
    },
    {
      id: 'schedule-analysis' as DashboardTab,
      name: 'Schedule Analysis',
      icon: TrendingUp,
      description: 'Team schedule difficulty and trends'
    },
    {
      id: 'defensive-schemes' as DashboardTab,
      name: 'Defensive Schemes',
      icon: Shield,
      description: 'Defensive coordinator schemes and tendencies'
    },
    {
      id: 'oline-rankings' as DashboardTab,
      name: 'O-Line Rankings',
      icon: Users,
      description: 'Offensive line performance and rankings'
    }
  ]

  useEffect(() => {
    // Check URL parameters for tab selection
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam as DashboardTab)
    }
    
    // Simulate initial data load
    setLastUpdated(new Date())
  }, [])

  const handleRefreshData = async () => {
    setLoading(true)
    try {
      // Simulate API calls to refresh data
      await new Promise(resolve => setTimeout(resolve, 2000))
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sleeper-data':
        return <SleeperIntegration />
      case 'positional-matchups':
        return <PositionalMatchups />
      case 'panic-meter':
        return <PanicMeter />
      case 'bye-weeks':
        return <ByeWeeks />
      case 'schedule-analysis':
        return <ScheduleAnalysis />
      case 'defensive-schemes':
        return <DefensiveSchemes />
      case 'oline-rankings':
        return <OLineRankings />
      default:
        return <SleeperIntegration />
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-display text-secondary-900 mb-2">
                Fantasy Football Analysis Dashboard
              </h1>
              <p className="text-secondary-600">
                Comprehensive analysis tools powered by Sleeper API and other data sources
                {lastUpdated && (
                  <span className="block text-sm text-secondary-500 mt-1">
                    Last updated: {lastUpdated.toLocaleString()}
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={handleRefreshData}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh All Data
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-secondary-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-6 text-left hover:bg-secondary-50 transition-colors ${
                    activeTab === tab.id ? 'bg-primary-50 border-b-2 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <tab.icon className={`h-5 w-5 ${
                      activeTab === tab.id ? 'text-primary-600' : 'text-secondary-500'
                    }`} />
                    <h3 className={`font-medium ${
                      activeTab === tab.id ? 'text-primary-900' : 'text-secondary-900'
                    }`}>
                      {tab.name}
                    </h3>
                  </div>
                  <p className="text-sm text-secondary-600">{tab.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <div className="space-y-8">
          {renderTabContent()}
        </div>

        {/* Data Sources Footer */}
        <Card className="mt-12">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Data Sources</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-secondary-600">
                <div>
                  <div className="font-medium text-secondary-900">Sleeper API</div>
                  <div>Player data & trends</div>
                </div>
                <div>
                  <div className="font-medium text-secondary-900">Yahoo Fantasy Sports</div>
                  <div>Defensive rankings</div>
                </div>
                <div>
                  <div className="font-medium text-secondary-900">FantasyPros</div>
                  <div>Expert consensus</div>
                </div>
                <div>
                  <div className="font-medium text-secondary-900">FantasyLife</div>
                  <div>Injury reports</div>
                </div>
                <div>
                  <div className="font-medium text-secondary-900">Pro Football Focus</div>
                  <div>Advanced analytics</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-secondary-500">
                Data automatically refreshes daily at 4:00 AM EST • Sleeper data updates every 15 minutes
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}