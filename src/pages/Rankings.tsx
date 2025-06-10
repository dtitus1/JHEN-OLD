import React, { useState, useEffect } from 'react'
import { Filter, Search, TrendingUp, TrendingDown, RefreshCw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { sleeperAPI, Player, POSITIONS, NFL_TEAMS } from '../lib/sleeper-api'

type SortField = 'rank' | 'name' | 'team' | 'position' | 'projection' | 'ownership'
type SortDirection = 'asc' | 'desc'

export function Rankings() {
  const [selectedFormat, setSelectedFormat] = useState('standard')
  const [selectedPosition, setSelectedPosition] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [playersPerPage, setPlayersPerPage] = useState(25)

  const formats = [
    { id: 'standard', name: 'Standard' },
    { id: 'half-ppr', name: 'Half PPR' },
    { id: 'ppr', name: 'PPR' },
  ]

  const positions = [
    { id: 'ALL', name: 'All Positions' },
    { id: 'QB', name: 'QB' },
    { id: 'RB', name: 'RB' },
    { id: 'WR', name: 'WR' },
    { id: 'TE', name: 'TE' },
    { id: 'K', name: 'K' },
    { id: 'DEF', name: 'D/ST' },
  ]

  const playersPerPageOptions = [
    { value: 20, label: '20 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
  ]

  useEffect(() => {
    loadRankings()
  }, [selectedPosition])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedPosition, searchTerm, playersPerPage])

  const loadRankings = async (forceRefresh = false) => {
    try {
      setLoading(true)
      const playerData = await sleeperAPI.getPlayerStats(
        selectedPosition === 'ALL' ? undefined : selectedPosition,
        undefined,
        200 // Limit to top 200 players for rankings
      )
      
      setPlayers(playerData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading rankings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />
  }

  const getProjection = (player: Player): number => {
    // Mock projection based on position and search rank
    const baseProjection = {
      'QB': 20,
      'RB': 15,
      'WR': 12,
      'TE': 10,
      'K': 8,
      'DEF': 8
    }[player.position] || 10

    const rankBonus = player.searchRank ? Math.max(0, (200 - player.searchRank) / 20) : 0
    const ownershipBonus = (player.ownership?.percentOwned || 50) / 20
    return Number((baseProjection + rankBonus + ownershipBonus + Math.random() * 3).toFixed(1))
  }

  const getTrend = (player: Player): 'up' | 'down' | 'neutral' => {
    const change = player.ownership?.percentChange || 0
    if (change > 2) return 'up'
    if (change < -2) return 'down'
    return 'neutral'
  }

  const getMatchup = (player: Player): string => {
    if (!player.team) return 'BYE'
    
    // Mock matchup data
    const opponents = ['vs MIA', '@ BUF', 'vs NYJ', '@ NE', 'vs DAL', '@ GB', 'vs SF']
    return opponents[Math.floor(Math.random() * opponents.length)]
  }

  const getNotes = (player: Player): string => {
    const notes = [
      'Elite matchup against weak secondary',
      'Volume king with TD upside',
      'Tough road matchup but elite talent',
      'Red zone target monster',
      'Rushing floor provides safety',
      'Injury concern limits upside',
      'Favorable game script expected',
      'Weather could impact performance'
    ]
    
    if (player.injuryStatus) {
      return `${player.injuryStatus} - Monitor status`
    }
    
    return notes[Math.floor(Math.random() * notes.length)]
  }

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (player.team && player.team.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case 'rank':
        aValue = a.searchRank || 9999
        bValue = b.searchRank || 9999
        break
      case 'name':
        aValue = a.fullName.toLowerCase()
        bValue = b.fullName.toLowerCase()
        break
      case 'team':
        aValue = a.team || 'ZZZ'
        bValue = b.team || 'ZZZ'
        break
      case 'position':
        aValue = a.position
        bValue = b.position
        break
      case 'projection':
        aValue = getProjection(a)
        bValue = getProjection(b)
        break
      case 'ownership':
        aValue = a.ownership?.percentOwned || 0
        bValue = b.ownership?.percentOwned || 0
        break
      default:
        aValue = a.searchRank || 9999
        bValue = b.searchRank || 9999
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Pagination calculations
  const totalPlayers = sortedPlayers.length
  const totalPages = Math.ceil(totalPlayers / playersPerPage)
  const startIndex = (currentPage - 1) * playersPerPage
  const endIndex = startIndex + playersPerPage
  const currentPlayers = sortedPlayers.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of table
    document.querySelector('.rankings-table')?.scrollIntoView({ behavior: 'smooth' })
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-display text-secondary-900 mb-2">
                Fantasy Football Rankings
              </h1>
              <p className="text-secondary-600">
                Latest top 200 rankings powered by Sleeper API with real player data
                {lastUpdated && (
                  <span className="block text-sm text-secondary-500 mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={() => loadRankings(true)}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Scoring Format */}
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
                    <option key={format.id} value={format.id}>
                      {format.name}
                    </option>
                  ))}
                </select>
              </div>

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
                    <option key={position.id} value={position.id}>
                      {position.name}
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
            </div>
          </CardContent>
        </Card>

        {/* Rankings Table */}
        <Card className="rankings-table">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {selectedPosition === 'ALL' ? 'All Positions' : positions.find(p => p.id === selectedPosition)?.name} Rankings
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
                <p className="text-secondary-600">Loading rankings from Sleeper...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary-50 border-b border-secondary-200">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
                          onClick={() => handleSort('rank')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Rank</span>
                            {getSortIcon('rank')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Player</span>
                            {getSortIcon('name')}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Matchup
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
                          onClick={() => handleSort('projection')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Projection</span>
                            {getSortIcon('projection')}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Trend
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {currentPlayers.map((player, index) => {
                        const team = NFL_TEAMS[player.team || '']
                        const trend = getTrend(player)
                        const actualRank = startIndex + index + 1
                        
                        return (
                          <tr key={player.id} className="hover:bg-secondary-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-800 rounded-full font-semibold text-sm">
                                {sortField === 'rank' ? actualRank : player.searchRank || actualRank}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="font-medium text-secondary-900">{player.fullName}</div>
                                <div className="text-sm text-secondary-500">
                                  {player.team || 'FA'} - {player.position}
                                  {player.injuryStatus && (
                                    <span className="ml-2 text-red-600 font-medium">
                                      {player.injuryStatus}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                              {getMatchup(player)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-semibold text-secondary-900">{getProjection(player)}</div>
                              <div className="text-sm text-secondary-500">proj pts</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {trend === 'up' ? (
                                <TrendingUp className="h-5 w-5 text-green-500" />
                              ) : trend === 'down' ? (
                                <TrendingDown className="h-5 w-5 text-red-500" />
                              ) : (
                                <div className="h-5 w-5" />
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-secondary-600 max-w-xs">
                              {getNotes(player)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
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

        {/* No Results */}
        {!loading && sortedPlayers.length === 0 && (
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <p className="text-secondary-600">No players found matching your criteria.</p>
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
      </div>
    </div>
  )
}