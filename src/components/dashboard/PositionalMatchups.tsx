import React, { useState, useEffect } from 'react'
import { Download, Filter, Search, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'

interface MatchupData {
  team: string
  opponent: string
  qbRank: number
  rbRank: number
  wrRank: number
  teRank: number
  pointsAllowed: {
    qb: number
    rb: number
    wr: number
    te: number
  }
  yardsAllowed: {
    qb: number
    rb: number
    wr: number
    te: number
  }
  tdRate: {
    qb: number
    rb: number
    wr: number
    te: number
  }
  dvoa: {
    qb: number
    rb: number
    wr: number
    te: number
  }
}

export function PositionalMatchups() {
  const [matchupData, setMatchupData] = useState<MatchupData[]>([])
  const [selectedPosition, setSelectedPosition] = useState('QB')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const positions = ['QB', 'RB', 'WR', 'TE']

  useEffect(() => {
    loadMatchupData()
  }, [])

  const loadMatchupData = async () => {
    setLoading(true)
    try {
      // Simulate API call to Yahoo Fantasy Sports & FantasyPros
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: MatchupData[] = [
        {
          team: 'BUF',
          opponent: 'vs MIA',
          qbRank: 32,
          rbRank: 28,
          wrRank: 30,
          teRank: 25,
          pointsAllowed: { qb: 22.5, rb: 18.2, wr: 15.8, te: 12.1 },
          yardsAllowed: { qb: 285, rb: 145, wr: 220, te: 85 },
          tdRate: { qb: 0.65, rb: 0.45, wr: 0.38, te: 0.25 },
          dvoa: { qb: -15.2, rb: -8.5, wr: -12.3, te: -5.8 }
        },
        {
          team: 'MIA',
          opponent: '@ BUF',
          qbRank: 15,
          rbRank: 12,
          wrRank: 18,
          teRank: 8,
          pointsAllowed: { qb: 18.8, rb: 14.5, wr: 12.2, te: 8.9 },
          yardsAllowed: { qb: 245, rb: 115, wr: 185, te: 65 },
          tdRate: { qb: 0.45, rb: 0.32, wr: 0.28, te: 0.18 },
          dvoa: { qb: 5.2, rb: 8.5, wr: 2.3, te: 12.8 }
        },
        {
          team: 'KC',
          opponent: 'vs LV',
          qbRank: 8,
          rbRank: 5,
          wrRank: 12,
          teRank: 3,
          pointsAllowed: { qb: 16.2, rb: 12.8, wr: 11.5, te: 7.2 },
          yardsAllowed: { qb: 225, rb: 98, wr: 165, te: 55 },
          tdRate: { qb: 0.38, rb: 0.28, wr: 0.22, te: 0.15 },
          dvoa: { qb: 12.5, rb: 15.2, wr: 8.8, te: 18.5 }
        },
        {
          team: 'LV',
          opponent: '@ KC',
          qbRank: 25,
          rbRank: 22,
          wrRank: 26,
          teRank: 20,
          pointsAllowed: { qb: 20.8, rb: 16.5, wr: 14.2, te: 10.8 },
          yardsAllowed: { qb: 265, rb: 125, wr: 195, te: 75 },
          tdRate: { qb: 0.55, rb: 0.38, wr: 0.32, te: 0.22 },
          dvoa: { qb: -8.2, rb: -2.5, wr: -5.8, te: -1.2 }
        }
      ]
      
      setMatchupData(mockData)
    } catch (error) {
      console.error('Error loading matchup data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMatchupRating = (rank: number) => {
    if (rank >= 28) return { color: 'bg-green-600 text-white', label: 'Excellent' }
    if (rank >= 22) return { color: 'bg-green-400 text-white', label: 'Good' }
    if (rank >= 15) return { color: 'bg-yellow-400 text-black', label: 'Neutral' }
    if (rank >= 8) return { color: 'bg-orange-400 text-white', label: 'Tough' }
    return { color: 'bg-red-600 text-white', label: 'Avoid' }
  }

  const getRankForPosition = (data: MatchupData, position: string) => {
    switch (position) {
      case 'QB': return data.qbRank
      case 'RB': return data.rbRank
      case 'WR': return data.wrRank
      case 'TE': return data.teRank
      default: return data.qbRank
    }
  }

  const getStatsForPosition = (data: MatchupData, position: string) => {
    const pos = position.toLowerCase() as keyof typeof data.pointsAllowed
    return {
      points: data.pointsAllowed[pos],
      yards: data.yardsAllowed[pos],
      tdRate: data.tdRate[pos],
      dvoa: data.dvoa[pos]
    }
  }

  const filteredData = matchupData.filter(data =>
    data.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.opponent.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const exportToCSV = () => {
    const headers = ['Team', 'Opponent', 'Rank', 'Points Allowed', 'Yards Allowed', 'TD Rate', 'DVOA']
    const rows = filteredData.map(data => {
      const rank = getRankForPosition(data, selectedPosition)
      const stats = getStatsForPosition(data, selectedPosition)
      return [
        data.team,
        data.opponent,
        rank,
        stats.points,
        stats.yards,
        stats.tdRate,
        stats.dvoa
      ]
    })

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedPosition}_matchups.csv`
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
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Search Teams
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Team or opponent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 rounded-lg border border-secondary-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={loadMatchupData}>
                <Filter className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matchup Ratings Legend */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Matchup Rating Legend</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {[
              { color: 'bg-green-600 text-white', label: 'Excellent (28-32)' },
              { color: 'bg-green-400 text-white', label: 'Good (22-27)' },
              { color: 'bg-yellow-400 text-black', label: 'Neutral (15-21)' },
              { color: 'bg-orange-400 text-white', label: 'Tough (8-14)' },
              { color: 'bg-red-600 text-white', label: 'Avoid (1-7)' }
            ].map((rating, index) => (
              <div key={index} className={`px-3 py-1 rounded-full text-sm font-medium ${rating.color}`}>
                {rating.label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matchup Data Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{selectedPosition} Matchup Analysis</h3>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-secondary-600">Loading matchup data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Opponent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Matchup Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Points Allowed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Yards Allowed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      TD Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      DVOA
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {filteredData.map((data, index) => {
                    const rank = getRankForPosition(data, selectedPosition)
                    const rating = getMatchupRating(rank)
                    const stats = getStatsForPosition(data, selectedPosition)
                    
                    return (
                      <tr key={index} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-secondary-900">
                          {data.team}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-secondary-600">
                          {data.opponent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${rating.color}`}>
                              {rating.label}
                            </span>
                            <span className="text-sm text-secondary-500">#{rank}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-secondary-900">
                          {stats.points.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-secondary-900">
                          {stats.yards}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-secondary-900">
                          {(stats.tdRate * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {stats.dvoa > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={stats.dvoa > 0 ? 'text-green-600' : 'text-red-600'}>
                              {stats.dvoa > 0 ? '+' : ''}{stats.dvoa.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}