import React, { useState, useEffect } from 'react'
import { Filter, Search, TrendingUp, BarChart3, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatsOverview } from '../components/stats/StatsOverview'
import { PlayerStatsTable } from '../components/stats/PlayerStatsTable'
import { TrendingPlayers } from '../components/stats/TrendingPlayers'
import { sleeperAPI, Player } from '../lib/sleeper-api'

export function Stats() {
  const [players, setPlayers] = useState<Player[]>([])
  const [trendingPlayers, setTrendingPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPosition, setSelectedPosition] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [statsOverview, setStatsOverview] = useState({
    totalPlayers: 0,
    activeLeagues: 0,
    weeklyUpdates: 0
  })

  const positions = [
    { id: 'ALL', name: 'All Positions' },
    { id: 'QB', name: 'Quarterbacks' },
    { id: 'RB', name: 'Running Backs' },
    { id: 'WR', name: 'Wide Receivers' },
    { id: 'TE', name: 'Tight Ends' },
    { id: 'K', name: 'Kickers' },
    { id: 'DEF', name: 'Defense/ST' },
  ]

  useEffect(() => {
    loadData()
  }, [selectedPosition])

  const loadData = async (forceRefresh = false) => {
    setLoading(true)
    try {
      const [playerData, trendingData, overviewData] = await Promise.all([
        sleeperAPI.getPlayerStats(selectedPosition === 'ALL' ? undefined : selectedPosition),
        sleeperAPI.getTrendingPlayers(),
        sleeperAPI.getLeagueStats()
      ])
      
      setPlayers(playerData)
      setTrendingPlayers(trendingData)
      setStatsOverview(overviewData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading stats data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setLoading(true)
      try {
        const searchResults = await sleeperAPI.searchPlayers(
          searchTerm,
          selectedPosition === 'ALL' ? undefined : selectedPosition
        )
        setPlayers(searchResults)
      } catch (error) {
        console.error('Error searching players:', error)
      } finally {
        setLoading(false)
      }
    } else {
      loadData()
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-display text-secondary-900 mb-2">
                Fantasy Football Stats
              </h1>
              <p className="text-secondary-600">
                Real-time player statistics, ownership trends, and fantasy insights powered by Sleeper API
                {lastUpdated && (
                  <span className="block text-sm text-secondary-500 mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={() => loadData(true)}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview
          totalPlayers={statsOverview.totalPlayers}
          activeLeagues={statsOverview.activeLeagues}
          weeklyUpdates={statsOverview.weeklyUpdates}
          loading={loading}
        />

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Search Player
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Player name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-secondary-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Clear/Refresh Button */}
              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setSearchTerm('')
                    loadData()
                  }}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {loading ? 'Loading...' : 'Show All'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trending Players */}
        <div className="mb-8">
          <TrendingPlayers players={trendingPlayers} loading={loading} />
        </div>

        {/* Player Stats Table */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {selectedPosition === 'ALL' ? 'All Players' : positions.find(p => p.id === selectedPosition)?.name} Stats
                  <span className="text-sm font-normal text-secondary-500 ml-2">
                    ({filteredPlayers.length} players)
                  </span>
                </h2>
                <div className="flex items-center text-sm text-secondary-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Live Sleeper Data
                </div>
              </div>
            </CardHeader>
            <PlayerStatsTable players={filteredPlayers} loading={loading} />
          </Card>
        </div>

        {/* Cache Status (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-8">
            <CardHeader>
              <h3 className="text-lg font-semibold">Cache Status (Dev Only)</h3>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  const status = sleeperAPI.getCacheStatus()
                  console.log('Cache Status:', status)
                  alert('Cache status logged to console')
                }}
                variant="outline"
                size="sm"
              >
                Log Cache Status
              </Button>
              <Button
                onClick={() => {
                  sleeperAPI.clearCache()
                  alert('Cache cleared')
                }}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                Clear Cache
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}