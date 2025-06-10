import React, { useState, useEffect } from 'react'
import { Search, Filter, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, RefreshCw, Target, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { sleeperAPI, Player, NFL_TEAMS } from '../lib/sleeper-api'
import { supabase } from '../lib/supabase'

interface StartSitNote {
  id: string
  player_id: string
  week: number
  season: number
  custom_note?: string
  recommendation_override?: 'start' | 'sit' | 'flex'
  confidence_override?: 'high' | 'medium' | 'low'
  projection_override?: number
  matchup_rating_override?: 'excellent' | 'good' | 'average' | 'poor' | 'terrible'
  risk_level_override?: 'low' | 'medium' | 'high'
  reasoning_override?: string[]
}

interface StartSitRecommendation {
  player: Player
  recommendation: 'start' | 'sit' | 'flex'
  confidence: 'high' | 'medium' | 'low'
  reasoning: string[]
  projectedPoints: number
  matchupRating: 'excellent' | 'good' | 'average' | 'poor' | 'terrible'
  riskLevel: 'low' | 'medium' | 'high'
  ceiling: number
  floor: number
  customNote?: string
  hasOverrides: boolean
  opponent: string
}

export function StartSit() {
  const [players, setPlayers] = useState<Player[]>([])
  const [recommendations, setRecommendations] = useState<StartSitRecommendation[]>([])
  const [startSitNotes, setStartSitNotes] = useState<StartSitNote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPosition, setSelectedPosition] = useState('ALL')
  const [selectedRecommendation, setSelectedRecommendation] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [currentWeek] = useState(getCurrentWeek())
  const [currentSeason] = useState(new Date().getFullYear())
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [playersPerPage, setPlayersPerPage] = useState(10)

  const positions = [
    { id: 'ALL', name: 'All Positions' },
    { id: 'QB', name: 'QB' },
    { id: 'RB', name: 'RB' },
    { id: 'WR', name: 'WR' },
    { id: 'TE', name: 'TE' },
  ]

  const recommendationFilters = [
    { id: 'all', name: 'All Players' },
    { id: 'start', name: 'Start Recommendations' },
    { id: 'sit', name: 'Sit Recommendations' },
    { id: 'flex', name: 'Flex Considerations' },
  ]

  const playersPerPageOptions = [
    { value: 10, label: '10 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
  ]

  useEffect(() => {
    loadStartSitData()
  }, [selectedPosition])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedPosition, selectedRecommendation, searchTerm, playersPerPage])

  const loadStartSitData = async (forceRefresh = false) => {
    try {
      setLoading(true)
      
      // Load player data
      const playerData = await sleeperAPI.getPlayerStats(
        selectedPosition === 'ALL' ? undefined : selectedPosition,
        undefined,
        200 // Get top 200 players for start/sit decisions
      )
      
      setPlayers(playerData)
      
      // Load custom notes from database if available
      let notes: StartSitNote[] = []
      if (supabase) {
        try {
          const { data: notesData, error } = await supabase
            .from('start_sit_notes')
            .select('*')
            .eq('week', currentWeek)
            .eq('season', currentSeason)

          if (!error && notesData) {
            notes = notesData
          }
        } catch (error) {
          console.log('Custom notes not available:', error)
        }
      }
      
      setStartSitNotes(notes)
      
      // Generate start/sit recommendations with custom overrides
      const recs = generateRecommendations(playerData, notes)
      setRecommendations(recs)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading start/sit data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRecommendations = (players: Player[], notes: StartSitNote[]): StartSitRecommendation[] => {
    return players.map(player => {
      // Find custom note for this player
      const customNote = notes.find(note => 
        note.player_id === player.id || 
        note.player_id === player.fullName.toLowerCase().replace(/\s+/g, '_')
      )

      const baseProjection = getBaseProjection(player)
      const matchupRating = getMatchupRating(player)
      const riskLevel = getRiskLevel(player)
      const { ceiling, floor } = getProjectionRange(baseProjection, player)
      const opponent = getOpponent(player)
      
      // Apply custom overrides if available
      const finalProjection = customNote?.projection_override || baseProjection
      const finalMatchupRating = customNote?.matchup_rating_override || matchupRating
      const finalRiskLevel = customNote?.risk_level_override || riskLevel
      
      // Determine recommendation based on multiple factors
      const recommendation = customNote?.recommendation_override || 
        getRecommendation(player, finalProjection, finalMatchupRating, finalRiskLevel)
      const confidence = customNote?.confidence_override || 
        getConfidence(player, finalMatchupRating, finalRiskLevel)
      const reasoning = customNote?.reasoning_override || 
        generateReasoning(player, finalMatchupRating, finalRiskLevel, recommendation)

      return {
        player,
        recommendation,
        confidence,
        reasoning,
        projectedPoints: finalProjection,
        matchupRating: finalMatchupRating,
        riskLevel: finalRiskLevel,
        ceiling,
        floor,
        opponent,
        customNote: customNote?.custom_note,
        hasOverrides: !!customNote
      }
    })
  }

  const getBaseProjection = (player: Player): number => {
    const positionBaselines = {
      'QB': 18,
      'RB': 12,
      'WR': 10,
      'TE': 8,
      'K': 7,
      'DEF': 8
    }

    const baseline = positionBaselines[player.position as keyof typeof positionBaselines] || 8
    const rankBonus = player.searchRank ? Math.max(0, (100 - player.searchRank) / 10) : 0
    const ownershipBonus = (player.ownership?.percentOwned || 50) / 25
    const randomVariance = (Math.random() - 0.5) * 4

    return Number((baseline + rankBonus + ownershipBonus + randomVariance).toFixed(1))
  }

  const getMatchupRating = (player: Player): 'excellent' | 'good' | 'average' | 'poor' | 'terrible' => {
    // Factor in injury status
    if (player.injuryStatus === 'Out') return 'terrible'
    if (player.injuryStatus === 'Doubtful') return 'poor'
    if (player.injuryStatus === 'Questionable') return 'average'
    
    // Mock matchup rating based on various factors
    const random = Math.random()
    if (random > 0.8) return 'excellent'
    if (random > 0.6) return 'good'
    if (random > 0.4) return 'average'
    if (random > 0.2) return 'poor'
    return 'terrible'
  }

  const getRiskLevel = (player: Player): 'low' | 'medium' | 'high' => {
    if (player.injuryStatus) return 'high'
    if (player.searchRank && player.searchRank <= 20) return 'low'
    if (player.searchRank && player.searchRank <= 50) return 'medium'
    return 'high'
  }

  const getProjectionRange = (baseProjection: number, player: Player): { ceiling: number; floor: number } => {
    const variance = player.position === 'QB' ? 8 : 6
    const ceiling = Number((baseProjection + variance).toFixed(1))
    const floor = Number(Math.max(0, baseProjection - variance).toFixed(1))
    return { ceiling, floor }
  }

  const getOpponent = (player: Player): string => {
    if (!player.team) return 'BYE'
    
    // Mock opponent data
    const opponents = ['vs MIA', '@ BUF', 'vs NYJ', '@ NE', 'vs DAL', '@ GB', 'vs SF', '@ SEA', 'vs LAR', '@ KC']
    return opponents[Math.floor(Math.random() * opponents.length)]
  }

  const getRecommendation = (
    player: Player, 
    projection: number, 
    matchup: string, 
    risk: string
  ): 'start' | 'sit' | 'flex' => {
    if (player.injuryStatus === 'Out' || player.injuryStatus === 'Doubtful') return 'sit'
    
    const positionThresholds = {
      'QB': { start: 16, flex: 12 },
      'RB': { start: 12, flex: 8 },
      'WR': { start: 10, flex: 7 },
      'TE': { start: 8, flex: 5 },
      'K': { start: 6, flex: 4 },
      'DEF': { start: 7, flex: 5 }
    }

    const thresholds = positionThresholds[player.position as keyof typeof positionThresholds]
    if (!thresholds) return 'sit'

    if (projection >= thresholds.start && matchup !== 'terrible') return 'start'
    if (projection >= thresholds.flex) return 'flex'
    return 'sit'
  }

  const getConfidence = (player: Player, matchup: string, risk: string): 'high' | 'medium' | 'low' => {
    if (risk === 'high' || matchup === 'terrible') return 'low'
    if (risk === 'low' && (matchup === 'excellent' || matchup === 'good')) return 'high'
    return 'medium'
  }

  const generateReasoning = (
    player: Player, 
    matchup: string, 
    risk: string, 
    recommendation: string
  ): string[] => {
    const reasons: string[] = []

    // Matchup-based reasoning
    if (matchup === 'excellent') {
      reasons.push('Excellent matchup against weak defense')
    } else if (matchup === 'good') {
      reasons.push('Favorable matchup expected')
    } else if (matchup === 'poor') {
      reasons.push('Tough defensive matchup')
    } else if (matchup === 'terrible') {
      reasons.push('Extremely difficult matchup')
    }

    // Injury-based reasoning
    if (player.injuryStatus) {
      reasons.push(`Injury concern: ${player.injuryStatus}`)
    }

    // Role-based reasoning
    if (player.searchRank && player.searchRank <= 10) {
      reasons.push('Elite player with consistent volume')
    } else if (player.searchRank && player.searchRank <= 30) {
      reasons.push('Reliable starter with good opportunity')
    } else if (player.searchRank && player.searchRank > 80) {
      reasons.push('Limited role and opportunity')
    }

    // Weather and game script factors
    const weatherFactors = [
      'Indoor dome game eliminates weather concerns',
      'Clear weather conditions expected',
      'Potential for high-scoring affair',
      'Game script likely favorable for passing',
      'Ground game expected to be featured',
      'Revenge game narrative adds motivation'
    ]

    // Add a random contextual factor
    if (Math.random() > 0.5) {
      reasons.push(weatherFactors[Math.floor(Math.random() * weatherFactors.length)])
    }

    // Risk-based reasoning
    if (risk === 'high') {
      reasons.push('High variance play with boom/bust potential')
    } else if (risk === 'low') {
      reasons.push('Safe floor with consistent production')
    }

    return reasons.slice(0, 3) // Limit to top 3 reasons
  }

  function getCurrentWeek(): number {
    // Simple calculation - in a real app you'd want more sophisticated logic
    const now = new Date()
    const seasonStart = new Date(now.getFullYear(), 8, 1) // September 1st
    const weeksSinceStart = Math.floor((now.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
    return Math.max(1, Math.min(18, weeksSinceStart + 1))
  }

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'start': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'sit': return <XCircle className="h-5 w-5 text-red-500" />
      case 'flex': return <Target className="h-5 w-5 text-yellow-500" />
      default: return null
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-secondary-600 bg-secondary-100'
    }
  }

  const getMatchupColor = (matchup: string) => {
    switch (matchup) {
      case 'excellent': return 'text-green-700 bg-green-100'
      case 'good': return 'text-green-600 bg-green-50'
      case 'average': return 'text-yellow-600 bg-yellow-50'
      case 'poor': return 'text-red-600 bg-red-50'
      case 'terrible': return 'text-red-700 bg-red-100'
      default: return 'text-secondary-600 bg-secondary-100'
    }
  }

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesPosition = selectedPosition === 'ALL' || rec.player.position === selectedPosition
    const matchesRecommendation = selectedRecommendation === 'all' || rec.recommendation === selectedRecommendation
    const matchesSearch = rec.player.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (rec.player.team && rec.player.team.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesPosition && matchesRecommendation && matchesSearch
  })

  // Sort by projected points in descending order
  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => b.projectedPoints - a.projectedPoints)

  // Pagination calculations
  const totalPlayers = sortedRecommendations.length
  const totalPages = Math.ceil(totalPlayers / playersPerPage)
  const startIndex = (currentPage - 1) * playersPerPage
  const endIndex = startIndex + playersPerPage
  const currentPlayers = sortedRecommendations.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of recommendations
    document.querySelector('.start-sit-recommendations')?.scrollIntoView({ behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, currentPage - 2)
      const end = Math.min(totalPages, start + maxVisiblePages - 1)
      
      if (start > 1) {
        pages.push(1)
        if (start > 2) pages.push('...')
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-display text-secondary-900 mb-2">
                Start/Sit Decision Tool
              </h1>
              <p className="text-secondary-600">
                AI-powered lineup recommendations with expert analysis and custom notes
                {lastUpdated && (
                  <span className="block text-sm text-secondary-500 mt-1">
                    Week {currentWeek}, {currentSeason} • Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={() => loadStartSitData(true)}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-secondary-900">
                    {recommendations.filter(r => r.recommendation === 'start').length}
                  </p>
                  <p className="text-sm text-secondary-600">Start Recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-secondary-900">
                    {recommendations.filter(r => r.recommendation === 'flex').length}
                  </p>
                  <p className="text-sm text-secondary-600">Flex Considerations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-secondary-900">
                    {recommendations.filter(r => r.recommendation === 'sit').length}
                  </p>
                  <p className="text-sm text-secondary-600">Sit Recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-primary-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-secondary-900">
                    {recommendations.filter(r => r.hasOverrides).length}
                  </p>
                  <p className="text-sm text-secondary-600">Expert Notes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Position Filter */}
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
                    <option key={position.id} value={position.id}>
                      {position.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recommendation Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Recommendation
                </label>
                <select
                  value={selectedRecommendation}
                  onChange={(e) => setSelectedRecommendation(e.target.value)}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  {recommendationFilters.map((filter) => (
                    <option key={filter.id} value={filter.id}>
                      {filter.name}
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

              {/* Players Per Page */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Display
                </label>
                <select
                  value={playersPerPage}
                  onChange={(e) => setPlayersPerPage(Number(e.target.value))}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  {playersPerPageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedPosition('ALL')
                    setSelectedRecommendation('all')
                    setSearchTerm('')
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="start-sit-recommendations">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Start/Sit Recommendations
              </h2>
              <div className="text-sm text-secondary-500">
                Showing {startIndex + 1}-{Math.min(endIndex, totalPlayers)} of {totalPlayers} players
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-secondary-600">Analyzing matchups and generating recommendations...</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 p-6">
                  {currentPlayers.map((rec, index) => (
                    <Card key={rec.player.id} className={`hover:shadow-lg transition-shadow ${rec.hasOverrides ? 'ring-2 ring-primary-200' : ''}`}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          {/* Player Info */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              {getRecommendationIcon(rec.recommendation)}
                              <div>
                                <h3 className="font-semibold text-secondary-900">{rec.player.fullName}</h3>
                                <p className="text-sm text-secondary-500">
                                  {NFL_TEAMS[rec.player.team || '']?.abbrev || rec.player.team || 'FA'} - {rec.player.position}
                                  {rec.player.injuryStatus && (
                                    <span className="ml-2 text-red-600 font-medium">
                                      {rec.player.injuryStatus}
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-secondary-500">{rec.opponent}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                rec.recommendation === 'start' ? 'bg-green-100 text-green-800' :
                                rec.recommendation === 'sit' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {rec.recommendation}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getConfidenceColor(rec.confidence)}`}>
                                {rec.confidence} confidence
                              </span>
                              {rec.hasOverrides && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                  Expert Note
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Projections */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-secondary-900">Projections</h4>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-lg font-bold text-secondary-900">{rec.floor}</p>
                                <p className="text-xs text-secondary-500">Floor</p>
                              </div>
                              <div>
                                <p className="text-xl font-bold text-primary-600">{rec.projectedPoints}</p>
                                <p className="text-xs text-secondary-500">Projection</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-secondary-900">{rec.ceiling}</p>
                                <p className="text-xs text-secondary-500">Ceiling</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-center space-x-2 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${
                                rec.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                                rec.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {rec.riskLevel} risk
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${getMatchupColor(rec.matchupRating)}`}>
                                {rec.matchupRating} matchup
                              </span>
                            </div>
                          </div>

                          {/* Reasoning */}
                          <div className="lg:col-span-2 space-y-3">
                            <h4 className="font-medium text-secondary-900">Analysis</h4>
                            {rec.customNote && (
                              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-3">
                                <p className="text-sm text-primary-800 font-medium">Expert Note:</p>
                                <p className="text-sm text-primary-700">{rec.customNote}</p>
                              </div>
                            )}
                            <ul className="space-y-2">
                              {rec.reasoning.map((reason, idx) => (
                                <li key={idx} className="flex items-start space-x-2 text-sm text-secondary-600">
                                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {currentPlayers.length === 0 && (
                    <div className="text-center py-12">
                      <AlertTriangle className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                      <p className="text-secondary-600 text-lg">No players found matching your criteria.</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setSelectedPosition('ALL')
                          setSelectedRecommendation('all')
                          setSearchTerm('')
                        }}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-secondary-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-secondary-700">
                        Showing {startIndex + 1} to {Math.min(endIndex, totalPlayers)} of {totalPlayers} results
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Previous Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>

                        {/* Page Numbers */}
                        <div className="flex items-center space-x-1">
                          {getPageNumbers().map((page, index) => (
                            <React.Fragment key={index}>
                              {page === '...' ? (
                                <span className="px-3 py-1 text-secondary-500">...</span>
                              ) : (
                                <Button
                                  variant={currentPage === page ? 'primary' : 'outline'}
                                  size="sm"
                                  onClick={() => handlePageChange(page as number)}
                                  className="min-w-[40px]"
                                >
                                  {page}
                                </Button>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Next Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-secondary-600">
                <p className="font-medium text-secondary-900 mb-2">Important Disclaimer</p>
                <p>
                  These recommendations combine algorithmic analysis with expert insights. 
                  Players with "Expert Note" badges have custom analysis from the JHEN Fantasy team.
                  Fantasy football involves inherent unpredictability. Always consider your league settings, 
                  scoring system, and latest injury reports before making final lineup decisions. 
                  Use this tool as guidance alongside your own research and instincts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}