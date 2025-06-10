import React, { useState, useEffect } from 'react'
import { Cloud, Sun, Moon, Star, Download } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'

interface TeamSchedule {
  team: string
  games: {
    week: number
    opponent: string
    isHome: boolean
    difficulty: 'Easy' | 'Medium' | 'Hard'
    isPrimeTime: boolean
    weatherRisk: 'Low' | 'Medium' | 'High'
    isDivisional: boolean
  }[]
  playoffSchedule: {
    week: number
    opponent: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    isHome?: boolean
    isPrimeTime?: boolean
    weatherRisk?: 'Low' | 'Medium' | 'High'
    isDivisional?: boolean
  }[]
  strengthOfSchedule: number
}

export function ScheduleAnalysis() {
  const [scheduleData, setScheduleData] = useState<TeamSchedule[]>([])
  const [selectedTeam, setSelectedTeam] = useState('All')
  const [viewMode, setViewMode] = useState<'full' | 'playoffs'>('full')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadScheduleData()
  }, [])

  const loadScheduleData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: TeamSchedule[] = [
        {
          team: 'BUF',
          games: [
            { week: 13, opponent: 'SF', isHome: true, difficulty: 'Hard', isPrimeTime: false, weatherRisk: 'High', isDivisional: false },
            { week: 14, opponent: 'LAR', isHome: false, difficulty: 'Medium', isPrimeTime: true, weatherRisk: 'Low', isDivisional: false },
            { week: 15, opponent: 'DET', isHome: true, difficulty: 'Hard', isPrimeTime: false, weatherRisk: 'High', isDivisional: false },
            { week: 16, opponent: 'NE', isHome: false, difficulty: 'Easy', isPrimeTime: false, weatherRisk: 'Medium', isDivisional: true },
            { week: 17, opponent: 'NYJ', isHome: true, difficulty: 'Easy', isPrimeTime: false, weatherRisk: 'High', isDivisional: true },
            { week: 18, opponent: 'MIA', isHome: false, difficulty: 'Medium', isPrimeTime: false, weatherRisk: 'Low', isDivisional: true }
          ],
          playoffSchedule: [
            { week: 15, opponent: 'DET', difficulty: 'Hard' },
            { week: 16, opponent: 'NE', difficulty: 'Easy' },
            { week: 17, opponent: 'NYJ', difficulty: 'Easy' }
          ],
          strengthOfSchedule: 0.52
        },
        {
          team: 'KC',
          games: [
            { week: 13, opponent: 'LV', isHome: true, difficulty: 'Easy', isPrimeTime: true, weatherRisk: 'Low', isDivisional: true },
            { week: 14, opponent: 'LAC', isHome: false, difficulty: 'Medium', isPrimeTime: false, weatherRisk: 'Low', isDivisional: true },
            { week: 15, opponent: 'CLE', isHome: true, difficulty: 'Medium', isPrimeTime: false, weatherRisk: 'Low', isDivisional: false },
            { week: 16, opponent: 'HOU', isHome: false, difficulty: 'Hard', isPrimeTime: false, weatherRisk: 'Low', isDivisional: false },
            { week: 17, opponent: 'PIT', isHome: true, difficulty: 'Hard', isPrimeTime: false, weatherRisk: 'Low', isDivisional: false },
            { week: 18, opponent: 'DEN', isHome: false, difficulty: 'Medium', isPrimeTime: false, weatherRisk: 'Medium', isDivisional: true }
          ],
          playoffSchedule: [
            { week: 15, opponent: 'CLE', difficulty: 'Medium' },
            { week: 16, opponent: 'HOU', difficulty: 'Hard' },
            { week: 17, opponent: 'PIT', difficulty: 'Hard' }
          ],
          strengthOfSchedule: 0.58
        },
        {
          team: 'SF',
          games: [
            { week: 13, opponent: 'BUF', isHome: false, difficulty: 'Hard', isPrimeTime: false, weatherRisk: 'High', isDivisional: false },
            { week: 14, opponent: 'CHI', isHome: true, difficulty: 'Easy', isPrimeTime: false, weatherRisk: 'Low', isDivisional: false },
            { week: 15, opponent: 'LAR', isHome: false, difficulty: 'Medium', isPrimeTime: true, weatherRisk: 'Low', isDivisional: true },
            { week: 16, opponent: 'MIA', isHome: true, difficulty: 'Medium', isPrimeTime: false, weatherRisk: 'Low', isDivisional: false },
            { week: 17, opponent: 'DET', isHome: false, difficulty: 'Hard', isPrimeTime: true, weatherRisk: 'Low', isDivisional: false },
            { week: 18, opponent: 'ARI', isHome: true, difficulty: 'Easy', isPrimeTime: false, weatherRisk: 'Low', isDivisional: true }
          ],
          playoffSchedule: [
            { week: 15, opponent: 'LAR', difficulty: 'Medium' },
            { week: 16, opponent: 'MIA', difficulty: 'Medium' },
            { week: 17, opponent: 'DET', difficulty: 'Hard' }
          ],
          strengthOfSchedule: 0.48
        }
      ]
      
      setScheduleData(mockData)
    } catch (error) {
      console.error('Error loading schedule data:', error)
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

  const getWeatherIcon = (risk: string) => {
    switch (risk) {
      case 'High': return <Cloud className="h-4 w-4 text-blue-600" />
      case 'Medium': return <Cloud className="h-4 w-4 text-yellow-600" />
      case 'Low': return <Sun className="h-4 w-4 text-yellow-500" />
      default: return <Sun className="h-4 w-4 text-secondary-500" />
    }
  }

  const getSOSColor = (sos: number) => {
    if (sos >= 0.55) return 'text-red-600'
    if (sos >= 0.45) return 'text-yellow-600'
    return 'text-green-600'
  }

  const filteredData = selectedTeam === 'All' ? scheduleData : scheduleData.filter(team => team.team === selectedTeam)
  const teams = ['All', ...scheduleData.map(team => team.team)]

  const exportToCSV = () => {
    const headers = ['Team', 'Week', 'Opponent', 'Home/Away', 'Difficulty', 'Prime Time', 'Weather Risk', 'Divisional']
    const rows = filteredData.flatMap(team =>
      team.games.map(game => [
        team.team,
        game.week,
        game.opponent,
        game.isHome ? 'Home' : 'Away',
        game.difficulty,
        game.isPrimeTime ? 'Yes' : 'No',
        game.weatherRisk,
        game.isDivisional ? 'Yes' : 'No'
      ])
    )

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'schedule_analysis.csv'
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
                  Team
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  View
                </label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'full' | 'playoffs')}
                  className="rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="full">Full Season</option>
                  <option value="playoffs">Playoffs Only (15-17)</option>
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

      {/* Strength of Schedule Overview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Strength of Schedule Rankings</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scheduleData
              .sort((a, b) => a.strengthOfSchedule - b.strengthOfSchedule)
              .map((team, index) => (
                <div key={team.team} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-secondary-900">#{index + 1}</span>
                    <span className="font-medium">{team.team}</span>
                  </div>
                  <span className={`font-semibold ${getSOSColor(team.strengthOfSchedule)}`}>
                    {(team.strengthOfSchedule * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {viewMode === 'full' ? 'Full Season Schedule' : 'Fantasy Playoffs Schedule (Weeks 15-17)'}
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-secondary-600">Loading schedule data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Team
                    </th>
                    {(viewMode === 'full' ? [13, 14, 15, 16, 17, 18] : [15, 16, 17]).map(week => (
                      <th key={week} className="px-6 py-3 text-center text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Week {week}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-center text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      SOS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {filteredData.map(team => (
                    <tr key={team.team} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-secondary-900">
                        {team.team}
                      </td>
                      {(viewMode === 'full' ? team.games : team.playoffSchedule).map(game => (
                        <td key={game.week} className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="space-y-1">
                            <div className="flex items-center justify-center space-x-1">
                              <span className="text-sm font-medium">
                                {viewMode === 'full' && !game.isHome ? '@' : ''}{game.opponent}
                              </span>
                              {viewMode === 'full' && (
                                <>
                                  {game.isPrimeTime && <Star className="h-3 w-3 text-yellow-500" />}
                                  {game.isDivisional && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                                </>
                              )}
                            </div>
                            <div className="flex items-center justify-center space-x-1">
                              <span className={`px-1 py-0.5 rounded text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                                {game.difficulty.charAt(0)}
                              </span>
                              {viewMode === 'full' && game.weatherRisk && getWeatherIcon(game.weatherRisk)}
                            </div>
                          </div>
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`font-semibold ${getSOSColor(team.strengthOfSchedule)}`}>
                          {(team.strengthOfSchedule * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Legend</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="font-medium text-secondary-900 mb-2">Difficulty</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">E</span>
                  <span className="text-sm">Easy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">M</span>
                  <span className="text-sm">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">H</span>
                  <span className="text-sm">Hard</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-secondary-900 mb-2">Weather Risk</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Low Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Cloud className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Medium Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Cloud className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">High Risk</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-secondary-900 mb-2">Special Games</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Prime Time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Divisional</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">@</span>
                  <span className="text-sm">Away Game</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-secondary-900 mb-2">Strength of Schedule</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 font-semibold">0-45%</span>
                  <span className="text-sm">Easy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600 font-semibold">45-55%</span>
                  <span className="text-sm">Average</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-600 font-semibold">55%+</span>
                  <span className="text-sm">Difficult</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}