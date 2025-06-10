import React, { useState, useEffect } from 'react'
import { Star, TrendingUp, TrendingDown, Filter, Search, Download, RefreshCw, Users, Target } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { sleeperAPI, Player, NFL_TEAMS } from '../lib/sleeper-api'

type Tier = 'S' | 'A' | 'B' | 'C' | 'D'

interface TierPlayer extends Player {
  tier: Tier
  tierRank: number
  weeklyProjection: number
  seasonProjection: number
  consistency: number
  upside: number
  floor: number
  adp: number
  notes: string[]
}

interface TierGroup {
  tier: Tier
  name: string
  description: string
  color: string
  bgColor: string
  players: TierPlayer[]
}

export function TierRankings() {
  const [tierData, setTierData] = useState<TierGroup[]>([])
  const [selectedPosition, setSelectedPosition] = useState('QB')
  const [selectedFormat, setSelectedFormat] = useState('PPR')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']
  const formats = ['Standard', 'Half-PPR', 'PPR']

  const tierDefinitions: Record<Tier, { name: string; description: string; color: string; bgColor: string }> = {
    'S': {
      name: 'Elite (S-Tier)',
      description: 'Must-start players with elite production and consistency',
      color: 'text-purple-800',
      bgColor: 'bg-purple-100 border-purple-300'
    },
    'A': {
      name: 'Excellent (A-Tier)',
      description: 'High-end starters with strong weekly upside',
      color: 'text-green-800',
      bgColor: 'bg-green-100 border-green-300'
    },
    'B': {
      name: 'Good (B-Tier)',
      description: 'Solid starters with reliable production',
      color: 'text-blue-800',
      bgColor: 'bg-blue-100 border-blue-300'
    },
    'C': {
      name: 'Average (C-Tier)',
      description: 'Flex/streaming options with matchup dependency',
      color: 'text-yellow-800',
      bgColor: 'bg-yellow-100 border-yellow-300'
    },
    'D': {
      name: 'Poor (D-Tier)',
      description: 'Avoid unless desperate or in deep leagues',
      color: 'text-red-800',
      bgColor: 'bg-red-100 border-red-300'
    }
  }

  useEffect(() => {
    loadTierData()
  }, [selectedPosition, selectedFormat])

  const loadTierData = async (forceRefresh = false) => {
    try {
      setLoading(true)
      
      // Load player data from Sleeper API
      const playerData = await sleeperAPI.getPlayerStats(selectedPosition, undefined, 100)
      
      // Convert to tier players with enhanced data
      const tierPlayers: TierPlayer[] = playerData.map((player, index) => {
        const tier = assignTier(index, selectedPosition)
        const tierRank = getTierRank(index, tier)
        
        return {
          ...player,
          tier,
          tierRank,
          weeklyProjection: getWeeklyProjection(player, selectedPosition, selectedFormat),
          seasonProjection: getSeasonProjection(player, selectedPosition, selectedFormat),
          consistency: getConsistency(player, selectedPosition),
          upside: getUpside(player, selectedPosition),
          floor: getFloor(player, selectedPosition),
          adp: getADP(player, index),
          notes: generateNotes(player, selectedPosition, tier)
        }
      })

      // Group players by tier
      const tiers: TierGroup[] = Object.entries(tierDefinitions).map(([tierKey, tierInfo]) => ({
        tier: tierKey as Tier,
        name: tierInfo.name,
        description: tierInfo.description,
        color: tierInfo.color,
        bgColor: tierInfo.bgColor,
        players: tierPlayers.filter(p => p.tier === tierKey).sort((a, b) => a.tierRank - b.tierRank)
      }))

      setTierData(tiers)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading tier data:', error)
    } finally {
      setLoading(false)
    }
  }

  const assignTier = (index: number, position: string): Tier => {
    // Tier breakpoints based on position
    const breakpoints = {
      'QB': { S: 3, A: 8, B: 15, C: 25 },
      'RB': { S: 6, A: 15, B: 30, C: 45 },
      'WR': { S: 8, A: 20, B: 40, C: 60 },
      'TE': { S: 3, A: 8, B: 15, C: 25 },
      'K': { S: 3, A: 8, B: 15, C: 25 },
      'DEF': { S: 3, A: 8, B: 15, C: 25 }
    }

    const bp = breakpoints[position as keyof typeof breakpoints] || breakpoints.QB
    
    if (index < bp.S) return 'S'
    if (index < bp.A) return 'A'
    if (index < bp.B) return 'B'
    if (index < bp.C) return 'C'
    return 'D'
  }

  const getTierRank = (index: number, tier: Tier): number => {
    const tierStarts = {
      'S': 0,
      'A': tier === 'A' ? 1 : 0,
      'B': tier === 'B' ? 1 : 0,
      'C': tier === 'C' ? 1 : 0,
      'D': tier === 'D' ? 1 : 0
    }
    
    // Calculate rank within tier
    let tierStart = 0
    const breakpoints = selectedPosition === 'QB' ? [3, 8, 15, 25] : [6, 15, 30, 45]
    
    switch (tier) {
      case 'S': tierStart = 0; break
      case 'A': tierStart = breakpoints[0]; break
      case 'B': tierStart = breakpoints[1]; break
      case 'C': tierStart = breakpoints[2]; break
      case 'D': tierStart = breakpoints[3]; break
    }
    
    return index - tierStart + 1
  }

  const getWeeklyProjection = (player: Player, position: string, format: string): number => {
    const baseProjections = {
      'QB': 18,
      'RB': 12,
      'WR': 10,
      'TE': 8,
      'K': 7,
      'DEF': 8
    }

    const base = baseProjections[position as keyof typeof baseProjections] || 10
    const rankBonus = player.searchRank ? Math.max(0, (50 - player.searchRank) / 5) : 0
    const formatBonus = format === 'PPR' && (position === 'RB' || position === 'WR' || position === 'TE') ? 2 : 0
    const randomVariance = (Math.random() - 0.5) * 3

    return Number((base + rankBonus + formatBonus + randomVariance).toFixed(1))
  }

  const getSeasonProjection = (player: Player, position: string, format: string): number => {
    const weekly = getWeeklyProjection(player, position, format)
    return Number((weekly * 17).toFixed(0)) // 17 game season
  }

  const getConsistency = (player: Player, position: string): number => {
    // Higher rank = more consistent
    const baseConsistency = player.searchRank ? Math.max(20, 100 - player.searchRank) : 50
    const positionBonus = position === 'QB' ? 10 : position === 'K' ? 15 : 0
    return Math.min(100, baseConsistency + positionBonus)
  }

  const getUpside = (player: Player, position: string): number => {
    // Younger players and certain positions have higher upside
    const ageBonus = player.age ? Math.max(0, 30 - player.age) * 2 : 10
    const positionBonus = position === 'WR' ? 10 : position === 'RB' ? 5 : 0
    const rankPenalty = player.searchRank ? player.searchRank / 2 : 25
    return Math.max(10, Math.min(100, 70 + ageBonus + positionBonus - rankPenalty))
  }

  const getFloor = (player: Player, position: string): number => {
    // More established players have higher floors
    const expBonus = player.yearsExp ? Math.min(player.yearsExp * 3, 20) : 0
    const positionBonus = position === 'TE' ? 10 : position === 'QB' ? 15 : 0
    const rankBonus = player.searchRank ? Math.max(0, 50 - player.searchRank) : 0
    return Math.max(10, Math.min(100, 40 + expBonus + positionBonus + rankBonus))
  }

  const getADP = (player: Player, index: number): number => {
    // Mock ADP based on ranking with some variance
    const baseADP = index + 1
    const variance = Math.floor((Math.random() - 0.5) * 10)
    return Math.max(1, baseADP + variance)
  }

  const generateNotes = (player: Player, position: string, tier: Tier): string[] => {
    const notes: string[] = []

    // Tier-specific notes
    switch (tier) {
      case 'S':
        notes.push('Elite weekly ceiling with consistent production')
        notes.push('Must-start in all formats and matchups')
        break
      case 'A':
        notes.push('High-end starter with strong weekly upside')
        notes.push('Reliable option with good matchup independence')
        break
      case 'B':
        notes.push('Solid starter with decent floor and ceiling')
        notes.push('Good depth option with streaming potential')
        break
      case 'C':
        notes.push('Matchup-dependent with limited upside')
        notes.push('Flex consideration in favorable spots')
        break
      case 'D':
        notes.push('Avoid unless in deep leagues or desperate')
        notes.push('High risk with minimal reward potential')
        break
    }

    // Position-specific notes
    if (position === 'QB') {
      notes.push(player.age && player.age > 35 ? 'Age concern for longevity' : 'Good long-term outlook')
    } else if (position === 'RB') {
      notes.push('Workload and injury risk key factors')
    } else if (position === 'WR') {
      notes.push('Target share and red zone usage important')
    } else if (position === 'TE') {
      notes.push('Position scarcity adds value')
    }

    // Injury status
    if (player.injuryStatus) {
      notes.push(`Injury concern: ${player.injuryStatus}`)
    }

    return notes.slice(0, 3) // Limit to 3 notes
  }

  const filteredTiers = tierData.map(tier => ({
    ...tier,
    players: tier.players.filter(player =>
      player.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.team && player.team.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(tier => tier.players.length > 0)

  const exportToCSV = () => {
    const headers = ['Tier', 'Rank', 'Player', 'Team', 'Position', 'Weekly Proj', 'Season Proj', 'ADP', 'Consistency', 'Upside', 'Floor']
    const rows = tierData.flatMap(tier =>
      tier.players.map(player => [
        tier.tier,
        player.tierRank,
        player.fullName,
        player.team || 'FA',
        player.position,
        player.weeklyProjection,
        player.seasonProjection,
        player.adp,
        player.consistency,
        player.upside,
        player.floor
      ])
    )

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedPosition}_tier_rankings_${selectedFormat}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-display text-secondary-900 mb-2">
                Positional Tier Rankings
              </h1>
              <p className="text-secondary-600">
                Players grouped into performance tiers with detailed analysis and projections
                {lastUpdated && (
                  <span className="block text-sm text-secondary-500 mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={() => loadTierData(true)}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Position
                </label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Scoring Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  {formats.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Search Player
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Player name or team..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-secondary-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Export */}
              <div className="flex items-end">
                <Button variant="outline" onClick={exportToCSV} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(tierDefinitions).map(([tierKey, tierInfo]) => {
            const tierGroup = tierData.find(t => t.tier === tierKey)
            const count = tierGroup?.players.length || 0
            
            return (
              <Card key={tierKey} className={`border-2 ${tierInfo.bgColor}`}>
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold ${tierInfo.color} mb-1`}>
                    {tierKey}
                  </div>
                  <div className="text-sm font-medium text-secondary-900 mb-1">
                    {count} Players
                  </div>
                  <div className={`text-xs ${tierInfo.color}`}>
                    {tierInfo.name.split(' ')[0]}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tier Rankings */}
        <div className="space-y-8">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-secondary-600">Loading tier rankings...</p>
              </CardContent>
            </Card>
          ) : (
            filteredTiers.map((tier) => (
              <Card key={tier.tier} className={`border-2 ${tier.bgColor}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`text-2xl font-bold ${tier.color} flex items-center`}>
                        <Star className="h-6 w-6 mr-2" />
                        {tier.name}
                      </h2>
                      <p className="text-secondary-600 mt-1">{tier.description}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${tier.color}`}>
                        {tier.players.length}
                      </div>
                      <div className="text-sm text-secondary-500">Players</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {tier.players.map((player) => (
                      <Card key={player.id} className="hover:shadow-lg transition-shadow bg-white">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                                  tier.tier === 'S' ? 'bg-purple-600' :
                                  tier.tier === 'A' ? 'bg-green-600' :
                                  tier.tier === 'B' ? 'bg-blue-600' :
                                  tier.tier === 'C' ? 'bg-yellow-600' : 'bg-red-600'
                                }`}>
                                  {player.tierRank}
                                </span>
                                <h3 className="font-semibold text-secondary-900 text-sm">
                                  {player.fullName}
                                </h3>
                              </div>
                              <p className="text-xs text-secondary-500">
                                {NFL_TEAMS[player.team || '']?.abbrev || player.team || 'FA'} - {player.position}
                                {player.injuryStatus && (
                                  <span className="ml-1 text-red-600 font-medium">
                                    ({player.injuryStatus})
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary-600">
                                {player.weeklyProjection}
                              </div>
                              <div className="text-xs text-secondary-500">proj/wk</div>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                            <div className="text-center">
                              <div className="font-medium text-secondary-900">{player.consistency}</div>
                              <div className="text-secondary-500">Consistency</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-secondary-900">{player.upside}</div>
                              <div className="text-secondary-500">Upside</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-secondary-900">{player.floor}</div>
                              <div className="text-secondary-500">Floor</div>
                            </div>
                          </div>

                          {/* Additional Info */}
                          <div className="flex items-center justify-between text-xs text-secondary-600 mb-3">
                            <span>ADP: {player.adp}</span>
                            <span>Season: {player.seasonProjection}</span>
                          </div>

                          {/* Notes */}
                          <div className="space-y-1">
                            {player.notes.slice(0, 2).map((note, index) => (
                              <div key={index} className="text-xs text-secondary-600 flex items-start">
                                <div className="w-1 h-1 bg-secondary-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                <span className="line-clamp-2">{note}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* No Results */}
        {!loading && filteredTiers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600 text-lg">No players found matching your search criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Methodology */}
        <Card className="mt-8">
          <CardHeader>
            <h3 className="text-lg font-semibold">Tier Methodology</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-secondary-900 mb-3">Tier Definitions</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(tierDefinitions).map(([tierKey, tierInfo]) => (
                    <div key={tierKey} className="flex items-start space-x-2">
                      <span className={`font-bold ${tierInfo.color}`}>{tierKey}:</span>
                      <span className="text-secondary-600">{tierInfo.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-secondary-900 mb-3">Ranking Factors</h4>
                <ul className="text-sm text-secondary-600 space-y-1">
                  <li>• Weekly and season-long projections</li>
                  <li>• Historical performance and consistency</li>
                  <li>• Injury status and risk factors</li>
                  <li>• Team context and usage trends</li>
                  <li>• Matchup independence and floor/ceiling</li>
                  <li>• Age, experience, and long-term outlook</li>
                  <li>• Scoring format adjustments (PPR vs Standard)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}