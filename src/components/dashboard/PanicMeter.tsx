import React, { useState, useEffect } from 'react'
import { AlertTriangle, TrendingDown, Activity, Clock, Download } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'

interface PanicPlayer {
  id: string
  name: string
  position: string
  team: string
  riskLevel: 'Low' | 'Medium' | 'High'
  last3WeeksStats: {
    points: number[]
    expected: number[]
  }
  upcomingSchedule: {
    week: number
    opponent: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
  }[]
  injuryStatus: string | null
  practiceParticipation: string[]
  usageTrends: {
    snaps: number[]
    routes: number[]
    touches: number[]
  }
  panicScore: number
}

export function PanicMeter() {
  const [panicPlayers, setPanicPlayers] = useState<PanicPlayer[]>([])
  const [selectedRisk, setSelectedRisk] = useState('All')
  const [selectedPosition, setSelectedPosition] = useState('All')
  const [loading, setLoading] = useState(true)

  const riskLevels = ['All', 'High', 'Medium', 'Low']
  const positions = ['All', 'QB', 'RB', 'WR', 'TE']

  useEffect(() => {
    loadPanicData()
  }, [])

  const loadPanicData = async () => {
    setLoading(true)
    try {
      // Simulate API call to FantasyLife API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: PanicPlayer[] = [
        {
          id: '1',
          name: 'Cooper Kupp',
          position: 'WR',
          team: 'LAR',
          riskLevel: 'High',
          last3WeeksStats: {
            points: [8.2, 5.8, 12.1],
            expected: [18.5, 16.2, 19.8]
          },
          upcomingSchedule: [
            { week: 13, opponent: 'vs SEA', difficulty: 'Medium' },
            { week: 14, opponent: '@ ARI', difficulty: 'Easy' },
            { week: 15, opponent: 'vs WAS', difficulty: 'Medium' },
            { week: 16, opponent: '@ NYG', difficulty: 'Easy' }
          ],
          injuryStatus: 'Questionable - Ankle',
          practiceParticipation: ['Limited', 'Limited', 'Full'],
          usageTrends: {
            snaps: [65, 58, 72],
            routes: [28, 24, 31],
            touches: [8, 6, 9]
          },
          panicScore: 85
        },
        {
          id: '2',
          name: 'Saquon Barkley',
          position: 'RB',
          team: 'PHI',
          riskLevel: 'Medium',
          last3WeeksStats: {
            points: [14.2, 22.8, 11.5],
            expected: [16.8, 18.2, 15.9]
          },
          upcomingSchedule: [
            { week: 13, opponent: 'vs SF', difficulty: 'Hard' },
            { week: 14, opponent: '@ DAL', difficulty: 'Medium' },
            { week: 15, opponent: 'vs WAS', difficulty: 'Easy' },
            { week: 16, opponent: '@ NYG', difficulty: 'Easy' }
          ],
          injuryStatus: null,
          practiceParticipation: ['Full', 'Full', 'Full'],
          usageTrends: {
            snaps: [68, 72, 65],
            routes: [18, 22, 16],
            touches: [22, 28, 19]
          },
          panicScore: 45
        },
        {
          id: '3',
          name: 'Tua Tagovailoa',
          position: 'QB',
          team: 'MIA',
          riskLevel: 'High',
          last3WeeksStats: {
            points: [12.8, 8.2, 15.6],
            expected: [22.5, 19.8, 21.2]
          },
          upcomingSchedule: [
            { week: 13, opponent: '@ GB', difficulty: 'Hard' },
            { week: 14, opponent: 'vs NYJ', difficulty: 'Easy' },
            { week: 15, opponent: '@ HOU', difficulty: 'Medium' },
            { week: 16, opponent: 'vs SF', difficulty: 'Hard' }
          ],
          injuryStatus: 'Healthy',
          practiceParticipation: ['Full', 'Full', 'Full'],
          usageTrends: {
            snaps: [65, 58, 68],
            routes: [0, 0, 0],
            touches: [0, 0, 0]
          },
          panicScore: 78
        }
      ]
      
      setPanicPlayers(mockData)
    } catch (error) {
      console.error('Error loading panic meter data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-secondary-100 text-secondary-800 border-secondary-200'
    }
  }

  const getPanicScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Hard': return 'bg-red-100 text-red-700'
      case 'Medium': return 'bg-yellow-100 text-yellow-700'
      case 'Easy': return 'bg-green-100 text-green-700'
      default: return 'bg-secondary-100 text-secondary-700'
    }
  }

  const filteredPlayers = panicPlayers.filter(player => {
    const matchesRisk = selectedRisk === 'All' || player.riskLevel === selectedRisk
    const matchesPosition = selectedPosition === 'All' || player.position === selectedPosition
    return matchesRisk && matchesPosition
  })

  const exportToCSV = () => {
    const headers = ['Name', 'Position', 'Team', 'Risk Level', 'Panic Score', 'Injury Status', 'Avg Points L3W', 'Expected Points L3W']
    const rows = filteredPlayers.map(player => [
      player.name,
      player.position,
      player.team,
      player.riskLevel,
      player.panicScore,
      player.injuryStatus || 'Healthy',
      (player.last3WeeksStats.points.reduce((a, b) => a + b, 0) / 3).toFixed(1),
      (player.last3WeeksStats.expected.reduce((a, b) => a + b, 0) / 3).toFixed(1)
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'panic_meter.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Risk Level
                </label>
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  {riskLevels.map(risk => (
                    <option key={risk} value={risk}>{risk}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Position
                </label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Panic Meter Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['High', 'Medium', 'Low'].map(risk => {
          const count = panicPlayers.filter(p => p.riskLevel === risk).length
          return (
            <Card key={risk}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-secondary-900">{count}</p>
                    <p className="text-sm text-secondary-600">{risk} Risk Players</p>
                  </div>
                  <AlertTriangle className={`h-8 w-8 ${
                    risk === 'High' ? 'text-red-500' :
                    risk === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                  }`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Player Cards */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-secondary-600">Loading panic meter data...</p>
            </CardContent>
          </Card>
        ) : (
          filteredPlayers.map(player => (
            <Card key={player.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Player Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-secondary-900">{player.name}</h3>
                        <p className="text-sm text-secondary-500">{player.team} - {player.position}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getPanicScoreColor(player.panicScore)}`}>
                          {player.panicScore}
                        </div>
                        <div className="text-xs text-secondary-500">Panic Score</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(player.riskLevel)}`}>
                        {player.riskLevel} Risk
                      </span>
                      {player.injuryStatus && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          {player.injuryStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-secondary-900">Last 3 Weeks</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Actual Points:</span>
                        <span className="font-medium">
                          {player.last3WeeksStats.points.map(p => p.toFixed(1)).join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Expected:</span>
                        <span className="font-medium">
                          {player.last3WeeksStats.expected.map(p => p.toFixed(1)).join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Difference:</span>
                        <span className="font-medium text-red-600">
                          {(
                            player.last3WeeksStats.points.reduce((a, b) => a + b, 0) -
                            player.last3WeeksStats.expected.reduce((a, b) => a + b, 0)
                          ).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Trends */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-secondary-900">Usage Trends</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Snaps:</span>
                        <span className="font-medium">
                          {player.usageTrends.snaps.join(', ')}
                        </span>
                      </div>
                      {player.position !== 'QB' && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-secondary-600">Routes:</span>
                            <span className="font-medium">
                              {player.usageTrends.routes.join(', ')}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-secondary-600">Touches:</span>
                            <span className="font-medium">
                              {player.usageTrends.touches.join(', ')}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-xs text-secondary-500 mb-1">Practice Participation</div>
                      <div className="flex space-x-1">
                        {player.practiceParticipation.map((status, index) => (
                          <span key={index} className={`px-1 py-0.5 rounded text-xs ${
                            status === 'Full' ? 'bg-green-100 text-green-700' :
                            status === 'Limited' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {status.charAt(0)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Schedule */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-secondary-900">Next 4 Weeks</h4>
                    <div className="space-y-2">
                      {player.upcomingSchedule.map((game, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-secondary-600">Wk {game.week}:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{game.opponent}</span>
                            <span className={`px-1 py-0.5 rounded text-xs ${getDifficultyColor(game.difficulty)}`}>
                              {game.difficulty}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredPlayers.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600 text-lg">No players found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}