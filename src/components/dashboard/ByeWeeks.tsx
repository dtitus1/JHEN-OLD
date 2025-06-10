import React, { useState, useEffect } from 'react'
import { Calendar, Download, Users, Plus, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'

interface ByeWeekData {
  week: number
  teams: {
    team: string
    logo: string
    players: {
      name: string
      position: string
      ownership: number
      replacements: string[]
    }[]
  }[]
}

export function ByeWeeks() {
  const [byeWeekData, setByeWeekData] = useState<ByeWeekData[]>([])
  const [selectedWeek, setSelectedWeek] = useState(12)
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadByeWeekData()
  }, [])

  const loadByeWeekData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: ByeWeekData[] = [
        {
          week: 12,
          teams: [
            {
              team: 'LAC',
              logo: '🏈',
              players: [
                {
                  name: 'Justin Herbert',
                  position: 'QB',
                  ownership: 85.2,
                  replacements: ['Russell Wilson', 'Derek Carr', 'Gardner Minshew']
                },
                {
                  name: 'Austin Ekeler',
                  position: 'RB',
                  ownership: 92.1,
                  replacements: ['Gus Edwards', 'Ezekiel Elliott', 'Roschon Johnson']
                },
                {
                  name: 'Keenan Allen',
                  position: 'WR',
                  ownership: 78.5,
                  replacements: ['Elijah Moore', 'Darius Slayton', 'Wan\'Dale Robinson']
                }
              ]
            },
            {
              team: 'TB',
              logo: '🏈',
              players: [
                {
                  name: 'Baker Mayfield',
                  position: 'QB',
                  ownership: 45.8,
                  replacements: ['Russell Wilson', 'Derek Carr', 'Gardner Minshew']
                },
                {
                  name: 'Rachaad White',
                  position: 'RB',
                  ownership: 68.2,
                  replacements: ['Gus Edwards', 'Ezekiel Elliott', 'Roschon Johnson']
                },
                {
                  name: 'Mike Evans',
                  position: 'WR',
                  ownership: 89.7,
                  replacements: ['Elijah Moore', 'Darius Slayton', 'Wan\'Dale Robinson']
                }
              ]
            }
          ]
        },
        {
          week: 13,
          teams: [
            {
              team: 'BUF',
              logo: '🏈',
              players: [
                {
                  name: 'Josh Allen',
                  position: 'QB',
                  ownership: 95.8,
                  replacements: ['Russell Wilson', 'Derek Carr', 'Gardner Minshew']
                },
                {
                  name: 'James Cook',
                  position: 'RB',
                  ownership: 72.4,
                  replacements: ['Gus Edwards', 'Ezekiel Elliott', 'Roschon Johnson']
                },
                {
                  name: 'Stefon Diggs',
                  position: 'WR',
                  ownership: 88.9,
                  replacements: ['Elijah Moore', 'Darius Slayton', 'Wan\'Dale Robinson']
                }
              ]
            }
          ]
        },
        {
          week: 14,
          teams: [
            {
              team: 'SF',
              logo: '🏈',
              players: [
                {
                  name: 'Brock Purdy',
                  position: 'QB',
                  ownership: 65.2,
                  replacements: ['Russell Wilson', 'Derek Carr', 'Gardner Minshew']
                },
                {
                  name: 'Christian McCaffrey',
                  position: 'RB',
                  ownership: 98.5,
                  replacements: ['Gus Edwards', 'Ezekiel Elliott', 'Roschon Johnson']
                },
                {
                  name: 'Deebo Samuel',
                  position: 'WR',
                  ownership: 82.1,
                  replacements: ['Elijah Moore', 'Darius Slayton', 'Wan\'Dale Robinson']
                }
              ]
            }
          ]
        }
      ]
      
      setByeWeekData(mockData)
    } catch (error) {
      console.error('Error loading bye week data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTeamExpansion = (team: string) => {
    const newExpanded = new Set(expandedTeams)
    if (newExpanded.has(team)) {
      newExpanded.delete(team)
    } else {
      newExpanded.add(team)
    }
    setExpandedTeams(newExpanded)
  }

  const exportToPDF = () => {
    // In a real implementation, this would generate a PDF
    alert('PDF export functionality would be implemented here')
  }

  const currentWeekData = byeWeekData.find(data => data.week === selectedWeek)
  const availableWeeks = byeWeekData.map(data => data.week)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Select Week
                </label>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  {availableWeeks.map(week => (
                    <option key={week} value={week}>Week {week}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportToPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={loadByeWeekData}>
                <Calendar className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bye Week Calendar Overview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">2024 NFL Bye Week Schedule</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {byeWeekData.map(weekData => (
              <div
                key={weekData.week}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedWeek === weekData.week
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
                onClick={() => setSelectedWeek(weekData.week)}
              >
                <div className="text-center">
                  <div className="font-semibold text-secondary-900 mb-2">
                    Week {weekData.week}
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {weekData.teams.map(team => (
                      <span
                        key={team.team}
                        className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded"
                      >
                        {team.team}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Week Details */}
      {currentWeekData && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Week {selectedWeek} Bye Week Details</h3>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-secondary-600">Loading bye week data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentWeekData.teams.map(team => (
                  <Card key={team.team} className="border border-secondary-200">
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleTeamExpansion(team.team)}
                        className="w-full p-4 flex items-center justify-between hover:bg-secondary-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{team.logo}</span>
                          <div className="text-left">
                            <h4 className="font-semibold text-secondary-900">{team.team}</h4>
                            <p className="text-sm text-secondary-600">
                              {team.players.length} fantasy relevant players
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-secondary-500" />
                          {expandedTeams.has(team.team) ? (
                            <Minus className="h-4 w-4 text-secondary-500" />
                          ) : (
                            <Plus className="h-4 w-4 text-secondary-500" />
                          )}
                        </div>
                      </button>

                      {expandedTeams.has(team.team) && (
                        <div className="border-t border-secondary-200 p-4">
                          <div className="space-y-4">
                            {team.players.map((player, index) => (
                              <div key={index} className="bg-secondary-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h5 className="font-medium text-secondary-900">
                                      {player.name}
                                    </h5>
                                    <p className="text-sm text-secondary-600">
                                      {player.position} • {player.ownership.toFixed(1)}% owned
                                    </p>
                                  </div>
                                  <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm font-medium">
                                    {player.position}
                                  </span>
                                </div>
                                
                                <div>
                                  <h6 className="text-sm font-medium text-secondary-900 mb-2">
                                    Recommended Replacements:
                                  </h6>
                                  <div className="flex flex-wrap gap-2">
                                    {player.replacements.map((replacement, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-white border border-secondary-200 rounded text-sm text-secondary-700"
                                      >
                                        {replacement}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Planning Tool */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Roster Planning Tool</h3>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Planning Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Plan ahead for bye weeks by targeting handcuffs and bench players</li>
              <li>• Consider streaming defenses and kickers during bye weeks</li>
              <li>• Look for players with favorable matchups during your stars' bye weeks</li>
              <li>• Trade for depth before bye weeks hit your core players</li>
              <li>• Monitor the waiver wire for emergency replacements</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}