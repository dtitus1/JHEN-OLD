import React, { useState, useEffect } from 'react'
import { Users, TrendingUp, TrendingDown, AlertTriangle, Download } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'

interface OLineData {
  team: string
  overallGrade: number
  runBlockingGrade: number
  passBlockingGrade: number
  pressureRate: number
  sackRate: number
  runStuffRate: number
  starters: {
    position: string
    player: string
    grade: number
    injuryStatus: string | null
    experience: number
  }[]
  injuryImpact: 'Low' | 'Medium' | 'High'
  cohesionMetrics: {
    gamesStartedTogether: number
    communicationRating: number
    chemistryScore: number
  }
  matchupProjections: {
    vsPassRush: 'Favorable' | 'Neutral' | 'Difficult'
    vsRunDefense: 'Favorable' | 'Neutral' | 'Difficult'
  }
  trends: {
    last4Weeks: number[]
    direction: 'up' | 'down' | 'stable'
  }
}

export function OLineRankings() {
  const [olineData, setOlineData] = useState<OLineData[]>([])
  const [sortBy, setSortBy] = useState('overallGrade')
  const [filterBy, setFilterBy] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOLineData()
  }, [])

  const loadOLineData = async () => {
    setLoading(true)
    try {
      // Simulate API call to PFF
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: OLineData[] = [
        {
          team: 'PHI',
          overallGrade: 85.2,
          runBlockingGrade: 88.5,
          passBlockingGrade: 82.8,
          pressureRate: 18.5,
          sackRate: 3.2,
          runStuffRate: 15.8,
          starters: [
            { position: 'LT', player: 'Jordan Mailata', grade: 82.5, injuryStatus: null, experience: 4 },
            { position: 'LG', player: 'Landon Dickerson', grade: 88.2, injuryStatus: null, experience: 3 },
            { position: 'C', player: 'Jason Kelce', grade: 89.5, injuryStatus: null, experience: 13 },
            { position: 'RG', player: 'Isaac Seumalo', grade: 85.8, injuryStatus: null, experience: 7 },
            { position: 'RT', player: 'Lane Johnson', grade: 87.2, injuryStatus: 'Questionable', experience: 11 }
          ],
          injuryImpact: 'Low',
          cohesionMetrics: {
            gamesStartedTogether: 28,
            communicationRating: 92,
            chemistryScore: 88
          },
          matchupProjections: {
            vsPassRush: 'Favorable',
            vsRunDefense: 'Favorable'
          },
          trends: {
            last4Weeks: [83.2, 85.8, 86.1, 85.2],
            direction: 'stable'
          }
        },
        {
          team: 'SF',
          overallGrade: 82.8,
          runBlockingGrade: 85.2,
          passBlockingGrade: 80.5,
          pressureRate: 22.1,
          sackRate: 4.1,
          runStuffRate: 18.2,
          starters: [
            { position: 'LT', player: 'Trent Williams', grade: 91.2, injuryStatus: null, experience: 14 },
            { position: 'LG', player: 'Aaron Banks', grade: 78.5, injuryStatus: null, experience: 3 },
            { position: 'C', player: 'Jake Brendel', grade: 82.8, injuryStatus: null, experience: 8 },
            { position: 'RG', player: 'Spencer Burford', grade: 75.2, injuryStatus: 'Questionable', experience: 2 },
            { position: 'RT', player: 'Mike McGlinchey', grade: 79.8, injuryStatus: null, experience: 6 }
          ],
          injuryImpact: 'Medium',
          cohesionMetrics: {
            gamesStartedTogether: 18,
            communicationRating: 85,
            chemistryScore: 82
          },
          matchupProjections: {
            vsPassRush: 'Neutral',
            vsRunDefense: 'Favorable'
          },
          trends: {
            last4Weeks: [85.1, 83.2, 81.8, 82.8],
            direction: 'down'
          }
        },
        {
          team: 'NYG',
          overallGrade: 65.2,
          runBlockingGrade: 62.8,
          passBlockingGrade: 67.5,
          pressureRate: 35.8,
          sackRate: 7.2,
          runStuffRate: 28.5,
          starters: [
            { position: 'LT', player: 'Andrew Thomas', grade: 78.5, injuryStatus: null, experience: 4 },
            { position: 'LG', player: 'Ben Bredeson', grade: 58.2, injuryStatus: 'Out', experience: 4 },
            { position: 'C', player: 'John Michael Schmitz', grade: 65.8, injuryStatus: null, experience: 1 },
            { position: 'RG', player: 'Mark Glowinski', grade: 62.5, injuryStatus: null, experience: 8 },
            { position: 'RT', player: 'Evan Neal', grade: 55.8, injuryStatus: 'Questionable', experience: 2 }
          ],
          injuryImpact: 'High',
          cohesionMetrics: {
            gamesStartedTogether: 8,
            communicationRating: 68,
            chemistryScore: 65
          },
          matchupProjections: {
            vsPassRush: 'Difficult',
            vsRunDefense: 'Difficult'
          },
          trends: {
            last4Weeks: [68.2, 66.8, 64.5, 65.2],
            direction: 'down'
          }
        }
      ]
      
      setOlineData(mockData)
    } catch (error) {
      console.error('Error loading O-Line data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return 'text-green-600'
    if (grade >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getInjuryColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-secondary-100 text-secondary-800'
    }
  }

  const getMatchupColor = (matchup: string) => {
    switch (matchup) {
      case 'Favorable': return 'bg-green-100 text-green-800'
      case 'Neutral': return 'bg-yellow-100 text-yellow-800'
      case 'Difficult': return 'bg-red-100 text-red-800'
      default: return 'bg-secondary-100 text-secondary-800'
    }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <div className="h-4 w-4" />
    }
  }

  const sortedData = [...olineData].sort((a, b) => {
    switch (sortBy) {
      case 'overallGrade':
        return b.overallGrade - a.overallGrade
      case 'runBlockingGrade':
        return b.runBlockingGrade - a.runBlockingGrade
      case 'passBlockingGrade':
        return b.passBlockingGrade - a.passBlockingGrade
      case 'pressureRate':
        return a.pressureRate - b.pressureRate
      default:
        return 0
    }
  })

  const filteredData = filterBy === 'All' ? sortedData : 
    sortedData.filter(team => team.injuryImpact === filterBy)

  const exportToCSV = () => {
    const headers = ['Team', 'Overall Grade', 'Run Blocking', 'Pass Blocking', 'Pressure Rate', 'Sack Rate', 'Injury Impact']
    const rows = filteredData.map(team => [
      team.team,
      team.overallGrade,
      team.runBlockingGrade,
      team.passBlockingGrade,
      team.pressureRate,
      team.sackRate,
      team.injuryImpact
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'oline_rankings.csv'
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
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="overallGrade">Overall Grade</option>
                  <option value="runBlockingGrade">Run Blocking</option>
                  <option value="passBlockingGrade">Pass Blocking</option>
                  <option value="pressureRate">Pressure Rate</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Filter by Injury Impact
                </label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="All">All Teams</option>
                  <option value="Low">Low Impact</option>
                  <option value="Medium">Medium Impact</option>
                  <option value="High">High Impact</option>
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

      {/* O-Line Rankings */}
      <div className="space-y-6">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-secondary-600">Loading O-Line rankings from PFF...</p>
            </CardContent>
          </Card>
        ) : (
          filteredData.map((team, index) => (
            <Card key={team.team} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-800 rounded-full font-semibold text-sm">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-secondary-900">{team.team}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInjuryColor(team.injuryImpact)}`}>
                      {team.injuryImpact} Injury Impact
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getGradeColor(team.overallGrade)}`}>
                        {team.overallGrade.toFixed(1)}
                      </div>
                      <div className="text-xs text-secondary-500">Overall Grade</div>
                    </div>
                    {getTrendIcon(team.trends.direction)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Grades & Metrics */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-secondary-900">PFF Grades</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Run Blocking:</span>
                        <span className={`font-medium ${getGradeColor(team.runBlockingGrade)}`}>
                          {team.runBlockingGrade.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Pass Blocking:</span>
                        <span className={`font-medium ${getGradeColor(team.passBlockingGrade)}`}>
                          {team.passBlockingGrade.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Pressure Rate:</span>
                        <span className="font-medium">{team.pressureRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Sack Rate:</span>
                        <span className="font-medium">{team.sackRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Run Stuff Rate:</span>
                        <span className="font-medium">{team.runStuffRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Starting Lineup */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-secondary-900">Starting Lineup</h4>
                    <div className="space-y-2">
                      {team.starters.map((starter, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-secondary-900 w-6">{starter.position}</span>
                            <span className="text-secondary-700">{starter.player}</span>
                            {starter.injuryStatus && (
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${getGradeColor(starter.grade)}`}>
                              {starter.grade.toFixed(1)}
                            </span>
                            <span className="text-xs text-secondary-500">
                              {starter.experience}yr
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cohesion Metrics */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-secondary-900">Unit Cohesion</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Games Together:</span>
                        <span className="font-medium">{team.cohesionMetrics.gamesStartedTogether}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Communication:</span>
                        <span className="font-medium">{team.cohesionMetrics.communicationRating}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Chemistry Score:</span>
                        <span className="font-medium">{team.cohesionMetrics.chemistryScore}/100</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-secondary-900 mb-2">Matchup Projections</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-secondary-600">vs Pass Rush:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getMatchupColor(team.matchupProjections.vsPassRush)}`}>
                            {team.matchupProjections.vsPassRush}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-secondary-600">vs Run Defense:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getMatchupColor(team.matchupProjections.vsRunDefense)}`}>
                            {team.matchupProjections.vsRunDefense}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trends & Injuries */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-secondary-900">Recent Trends</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-secondary-600">Last 4 Weeks:</div>
                      <div className="flex space-x-1">
                        {team.trends.last4Weeks.map((grade, idx) => (
                          <div key={idx} className="flex-1 text-center">
                            <div className={`text-sm font-medium ${getGradeColor(grade)}`}>
                              {grade.toFixed(1)}
                            </div>
                            <div className="text-xs text-secondary-500">W{idx + 1}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {team.starters.some(s => s.injuryStatus) && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h5 className="text-sm font-medium text-red-900 mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Injury Concerns
                        </h5>
                        <div className="space-y-1">
                          {team.starters
                            .filter(s => s.injuryStatus)
                            .map((starter, idx) => (
                              <div key={idx} className="text-sm text-red-800">
                                {starter.player} ({starter.position}) - {starter.injuryStatus}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredData.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600 text-lg">No teams found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}