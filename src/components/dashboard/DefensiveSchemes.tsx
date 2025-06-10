import React, { useState, useEffect } from 'react'
import { Shield, TrendingUp, TrendingDown, Users, Download } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'

interface DefensiveScheme {
  team: string
  coordinator: string
  scheme: '3-4' | '4-3' | 'Hybrid'
  coordinatorHistory: string[]
  pressureRate: number
  blitzRate: number
  coverageStats: {
    cover1: number
    cover2: number
    cover3: number
    manCoverage: number
  }
  personnelPackages: {
    base: number
    nickel: number
    dime: number
    goalLine: number
  }
  keyInjuries: {
    player: string
    position: string
    impact: 'High' | 'Medium' | 'Low'
  }[]
  matchupAdvantages: string[]
  matchupDisadvantages: string[]
  weeklyRank: {
    passDefense: number
    runDefense: number
    redZone: number
    thirdDown: number
  }
}

export function DefensiveSchemes() {
  const [schemeData, setSchemeData] = useState<DefensiveScheme[]>([])
  const [selectedTeam, setSelectedTeam] = useState('All')
  const [sortBy, setSortBy] = useState('pressureRate')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSchemeData()
  }, [])

  const loadSchemeData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: DefensiveScheme[] = [
        {
          team: 'SF',
          coordinator: 'Steve Wilks',
          scheme: '4-3',
          coordinatorHistory: ['Previous: Carolina (2017-2018)', 'Arizona HC (2018)', 'Cleveland (2019-2021)'],
          pressureRate: 28.5,
          blitzRate: 22.8,
          coverageStats: {
            cover1: 15.2,
            cover2: 35.8,
            cover3: 28.5,
            manCoverage: 20.5
          },
          personnelPackages: {
            base: 25.8,
            nickel: 58.2,
            dime: 12.5,
            goalLine: 3.5
          },
          keyInjuries: [
            { player: 'Nick Bosa', position: 'EDGE', impact: 'High' },
            { player: 'Dre Greenlaw', position: 'LB', impact: 'Medium' }
          ],
          matchupAdvantages: ['Strong pass rush vs weak O-lines', 'Elite run defense vs power schemes'],
          matchupDisadvantages: ['Vulnerable to quick passing games', 'Struggles vs mobile QBs'],
          weeklyRank: {
            passDefense: 8,
            runDefense: 3,
            redZone: 12,
            thirdDown: 6
          }
        },
        {
          team: 'BUF',
          coordinator: 'Leslie Frazier',
          scheme: '4-3',
          coordinatorHistory: ['Previous: Minnesota HC (2010-2013)', 'Tampa Bay (2014-2015)', 'Buffalo (2017-present)'],
          pressureRate: 32.1,
          blitzRate: 28.5,
          coverageStats: {
            cover1: 18.5,
            cover2: 42.2,
            cover3: 22.8,
            manCoverage: 16.5
          },
          personnelPackages: {
            base: 22.5,
            nickel: 62.8,
            dime: 11.2,
            goalLine: 3.5
          },
          keyInjuries: [
            { player: 'Von Miller', position: 'EDGE', impact: 'High' }
          ],
          matchupAdvantages: ['Excellent vs slot receivers', 'Strong red zone defense'],
          matchupDisadvantages: ['Can be beaten deep', 'Vulnerable to screen passes'],
          weeklyRank: {
            passDefense: 5,
            runDefense: 15,
            redZone: 4,
            thirdDown: 8
          }
        },
        {
          team: 'DAL',
          coordinator: 'Dan Quinn',
          scheme: '4-3',
          coordinatorHistory: ['Previous: Atlanta HC (2015-2020)', 'Seattle (2013-2014)', 'Florida (2011-2012)'],
          pressureRate: 30.8,
          blitzRate: 25.2,
          coverageStats: {
            cover1: 22.5,
            cover2: 38.8,
            cover3: 25.2,
            manCoverage: 13.5
          },
          personnelPackages: {
            base: 28.5,
            nickel: 55.8,
            dime: 13.2,
            goalLine: 2.5
          },
          keyInjuries: [],
          matchupAdvantages: ['Elite pass rush duo', 'Strong vs tight ends'],
          matchupDisadvantages: ['Inconsistent run defense', 'Vulnerable to play action'],
          weeklyRank: {
            passDefense: 12,
            runDefense: 22,
            redZone: 8,
            thirdDown: 14
          }
        }
      ]
      
      setSchemeData(mockData)
    } catch (error) {
      console.error('Error loading defensive scheme data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSchemeColor = (scheme: string) => {
    switch (scheme) {
      case '3-4': return 'bg-blue-100 text-blue-800'
      case '4-3': return 'bg-green-100 text-green-800'
      case 'Hybrid': return 'bg-purple-100 text-purple-800'
      default: return 'bg-secondary-100 text-secondary-800'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-secondary-100 text-secondary-800'
    }
  }

  const getRankColor = (rank: number) => {
    if (rank <= 10) return 'text-green-600'
    if (rank <= 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  const sortedData = [...schemeData].sort((a, b) => {
    switch (sortBy) {
      case 'pressureRate':
        return b.pressureRate - a.pressureRate
      case 'blitzRate':
        return b.blitzRate - a.blitzRate
      case 'passDefense':
        return a.weeklyRank.passDefense - b.weeklyRank.passDefense
      case 'runDefense':
        return a.weeklyRank.runDefense - b.weeklyRank.runDefense
      default:
        return 0
    }
  })

  const filteredData = selectedTeam === 'All' ? sortedData : sortedData.filter(team => team.team === selectedTeam)
  const teams = ['All', ...schemeData.map(team => team.team)]

  const exportToCSV = () => {
    const headers = ['Team', 'Coordinator', 'Scheme', 'Pressure Rate', 'Blitz Rate', 'Pass Defense Rank', 'Run Defense Rank']
    const rows = filteredData.map(team => [
      team.team,
      team.coordinator,
      team.scheme,
      team.pressureRate,
      team.blitzRate,
      team.weeklyRank.passDefense,
      team.weeklyRank.runDefense
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'defensive_schemes.csv'
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
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="pressureRate">Pressure Rate</option>
                  <option value="blitzRate">Blitz Rate</option>
                  <option value="passDefense">Pass Defense Rank</option>
                  <option value="runDefense">Run Defense Rank</option>
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

      {/* Scheme Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['3-4', '4-3', 'Hybrid'].map(scheme => {
          const count = schemeData.filter(team => team.scheme === scheme).length
          return (
            <Card key={scheme}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-secondary-900">{count}</p>
                    <p className="text-sm text-secondary-600">{scheme} Teams</p>
                  </div>
                  <Shield className="h-8 w-8 text-primary-500" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Defensive Scheme Cards */}
      <div className="space-y-6">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-secondary-600">Loading defensive scheme data...</p>
            </CardContent>
          </Card>
        ) : (
          filteredData.map(team => (
            <Card key={team.team} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-semibold text-secondary-900">{team.team}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSchemeColor(team.scheme)}`}>
                      {team.scheme}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-secondary-900">{team.coordinator}</div>
                    <div className="text-sm text-secondary-500">Defensive Coordinator</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Pressure & Coverage Stats */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-secondary-900">Pressure & Coverage</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Pressure Rate:</span>
                        <span className="font-medium">{team.pressureRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Blitz Rate:</span>
                        <span className="font-medium">{team.blitzRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Cover 2:</span>
                        <span className="font-medium">{team.coverageStats.cover2.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Man Coverage:</span>
                        <span className="font-medium">{team.coverageStats.manCoverage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Personnel Packages */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-secondary-900">Personnel Usage</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Base:</span>
                        <span className="font-medium">{team.personnelPackages.base.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Nickel:</span>
                        <span className="font-medium">{team.personnelPackages.nickel.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Dime:</span>
                        <span className="font-medium">{team.personnelPackages.dime.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Goal Line:</span>
                        <span className="font-medium">{team.personnelPackages.goalLine.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Rankings & Injuries */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-secondary-900">Weekly Rankings</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Pass Defense:</span>
                        <span className={`font-medium ${getRankColor(team.weeklyRank.passDefense)}`}>
                          #{team.weeklyRank.passDefense}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Run Defense:</span>
                        <span className={`font-medium ${getRankColor(team.weeklyRank.runDefense)}`}>
                          #{team.weeklyRank.runDefense}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Red Zone:</span>
                        <span className={`font-medium ${getRankColor(team.weeklyRank.redZone)}`}>
                          #{team.weeklyRank.redZone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary-600">Third Down:</span>
                        <span className={`font-medium ${getRankColor(team.weeklyRank.thirdDown)}`}>
                          #{team.weeklyRank.thirdDown}
                        </span>
                      </div>
                    </div>

                    {team.keyInjuries.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-secondary-900 mb-2">Key Injuries</h5>
                        <div className="space-y-1">
                          {team.keyInjuries.map((injury, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-secondary-600">{injury.player}</span>
                              <span className={`px-1 py-0.5 rounded text-xs font-medium ${getImpactColor(injury.impact)}`}>
                                {injury.impact}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Matchup Analysis */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-secondary-900">Matchup Analysis</h4>
                    
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Advantages
                      </h5>
                      <ul className="space-y-1">
                        {team.matchupAdvantages.map((advantage, index) => (
                          <li key={index} className="text-sm text-secondary-600">
                            • {advantage}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Disadvantages
                      </h5>
                      <ul className="space-y-1">
                        {team.matchupDisadvantages.map((disadvantage, index) => (
                          <li key={index} className="text-sm text-secondary-600">
                            • {disadvantage}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
                      <h5 className="text-sm font-medium text-secondary-900 mb-1">Coordinator History</h5>
                      <div className="space-y-1">
                        {team.coordinatorHistory.map((history, index) => (
                          <div key={index} className="text-xs text-secondary-600">
                            {history}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}