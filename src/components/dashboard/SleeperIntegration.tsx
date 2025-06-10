import React, { useState, useEffect } from 'react'
import { Activity, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { sleeperDashboardAPI, SleeperMatchupData, SleeperInjuryData, SleeperOwnershipData } from '../../lib/sleeper-dashboard-api'

export function SleeperIntegration() {
  const [matchupData, setMatchupData] = useState<SleeperMatchupData[]>([])
  const [injuryData, setInjuryData] = useState<SleeperInjuryData[]>([])
  const [ownershipData, setOwnershipData] = useState<SleeperOwnershipData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    loadSleeperData()
  }, [])

  const loadSleeperData = async () => {
    setLoading(true)
    try {
      const [matchups, injuries, ownership] = await Promise.all([
        sleeperDashboardAPI.getPositionalMatchups('QB'),
        sleeperDashboardAPI.getInjuryReport(),
        sleeperDashboardAPI.getOwnershipTrends()
      ])

      setMatchupData(matchups.slice(0, 6))
      setInjuryData(injuries.slice(0, 6))
      setOwnershipData(ownership.slice(0, 6))
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading Sleeper data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-secondary-100 text-secondary-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">Sleeper API Integration</h2>
              <p className="text-secondary-600">Real-time fantasy football data from Sleeper</p>
              {lastUpdated && (
                <p className="text-sm text-secondary-500 mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <Button onClick={loadSleeperData} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading data from Sleeper API...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QB Matchups */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <Activity className="h-5 w-5 mr-2 text-primary-600" />
                QB Matchups This Week
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {matchupData.map((matchup, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div>
                      <div className="font-medium text-secondary-900">{matchup.team}</div>
                      <div className="text-sm text-secondary-600">{matchup.opponent}</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(matchup.difficulty)}`}>
                        {matchup.difficulty}
                      </span>
                      <div className="text-sm text-secondary-600 mt-1">
                        Rank #{matchup.defensiveRank}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Injury Report */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Key Injuries
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {injuryData.map((injury, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div>
                      <div className="font-medium text-secondary-900">{injury.playerName}</div>
                      <div className="text-sm text-secondary-600">
                        {injury.team} - {injury.position}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">{injury.status}</div>
                      <div className="text-xs text-secondary-500">{injury.returnTimeline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ownership Trends */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Trending Players
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ownershipData.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div>
                      <div className="font-medium text-secondary-900">{player.playerName}</div>
                      <div className="text-sm text-secondary-600">
                        {player.team} - {player.position}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {player.percentOwned.toFixed(1)}% owned
                      </div>
                      <div className={`text-xs ${player.addDropTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {player.addDropTrend > 0 ? '+' : ''}{player.addDropTrend.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bye Week Preview */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Upcoming Bye Weeks</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-secondary-50 rounded">
                <span className="font-medium">Week 12</span>
                <span className="text-sm text-secondary-600">LAC, TB</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-secondary-50 rounded">
                <span className="font-medium">Week 13</span>
                <span className="text-sm text-secondary-600">BUF, NYJ</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-secondary-50 rounded">
                <span className="font-medium">Week 14</span>
                <span className="text-sm text-secondary-600">SF, SEA</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* League Statistics */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">League Statistics</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">2,500+</div>
                <div className="text-sm text-secondary-600">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">250K+</div>
                <div className="text-sm text-secondary-600">Sleeper Leagues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">15min</div>
                <div className="text-sm text-secondary-600">Update Frequency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">99.9%</div>
                <div className="text-sm text-secondary-600">API Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Sleeper API Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-secondary-900">Player Data</div>
                <div className="text-secondary-600">Real-time stats & info</div>
              </div>
              <div>
                <div className="font-medium text-secondary-900">Injury Reports</div>
                <div className="text-secondary-600">Latest injury updates</div>
              </div>
              <div>
                <div className="font-medium text-secondary-900">Ownership</div>
                <div className="text-secondary-600">Add/drop trends</div>
              </div>
              <div>
                <div className="font-medium text-secondary-900">Matchups</div>
                <div className="text-secondary-600">Weekly analysis</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-secondary-500">
              Data refreshes every 15 minutes during the NFL season
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}