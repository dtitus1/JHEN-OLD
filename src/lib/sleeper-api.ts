import axios from 'axios'

export interface SleeperPlayer {
  player_id: string
  full_name: string
  first_name: string
  last_name: string
  team: string | null
  position: string
  age: number | null
  height: string | null
  weight: string | null
  years_exp: number | null
  college: string | null
  injury_status: string | null
  status: string
  fantasy_positions: string[]
  number: number | null
  depth_chart_position: number | null
  depth_chart_order: number | null
  search_rank: number | null
  search_full_name: string | null
  sport: string
  active: boolean
}

export interface SleeperStats {
  [key: string]: number
}

export interface SleeperProjections {
  [key: string]: number
}

export interface SleeperTrendingPlayer {
  player_id: string
  count: number
}

export interface SleeperLeague {
  league_id: string
  name: string
  season: string
  status: string
  sport: string
  settings: {
    type: number
    scoring_type: string
  }
}

// Normalized player interface for our app
export interface Player {
  id: string
  fullName: string
  firstName: string
  lastName: string
  team: string | null
  position: string
  fantasyPositions: string[]
  age: number | null
  yearsExp: number | null
  injuryStatus: string | null
  isActive: boolean
  stats?: SleeperStats
  projections?: SleeperProjections
  ownership?: {
    percentOwned: number
    percentChange: number
  }
  searchRank: number | null
  depthChartPosition: number | null
}

export interface TrendingData {
  add: SleeperTrendingPlayer[]
  drop: SleeperTrendingPlayer[]
}

// Position mapping for consistency
export const POSITIONS: { [key: string]: string } = {
  'QB': 'QB',
  'RB': 'RB', 
  'WR': 'WR',
  'TE': 'TE',
  'K': 'K',
  'DEF': 'D/ST'
}

// NFL Teams mapping
export const NFL_TEAMS: { [key: string]: { abbrev: string; name: string; location: string } } = {
  'ARI': { abbrev: 'ARI', name: 'Cardinals', location: 'Arizona' },
  'ATL': { abbrev: 'ATL', name: 'Falcons', location: 'Atlanta' },
  'BAL': { abbrev: 'BAL', name: 'Ravens', location: 'Baltimore' },
  'BUF': { abbrev: 'BUF', name: 'Bills', location: 'Buffalo' },
  'CAR': { abbrev: 'CAR', name: 'Panthers', location: 'Carolina' },
  'CHI': { abbrev: 'CHI', name: 'Bears', location: 'Chicago' },
  'CIN': { abbrev: 'CIN', name: 'Bengals', location: 'Cincinnati' },
  'CLE': { abbrev: 'CLE', name: 'Browns', location: 'Cleveland' },
  'DAL': { abbrev: 'DAL', name: 'Cowboys', location: 'Dallas' },
  'DEN': { abbrev: 'DEN', name: 'Broncos', location: 'Denver' },
  'DET': { abbrev: 'DET', name: 'Lions', location: 'Detroit' },
  'GB': { abbrev: 'GB', name: 'Packers', location: 'Green Bay' },
  'HOU': { abbrev: 'HOU', name: 'Texans', location: 'Houston' },
  'IND': { abbrev: 'IND', name: 'Colts', location: 'Indianapolis' },
  'JAX': { abbrev: 'JAX', name: 'Jaguars', location: 'Jacksonville' },
  'KC': { abbrev: 'KC', name: 'Chiefs', location: 'Kansas City' },
  'LV': { abbrev: 'LV', name: 'Raiders', location: 'Las Vegas' },
  'LAC': { abbrev: 'LAC', name: 'Chargers', location: 'Los Angeles' },
  'LAR': { abbrev: 'LAR', name: 'Rams', location: 'Los Angeles' },
  'MIA': { abbrev: 'MIA', name: 'Dolphins', location: 'Miami' },
  'MIN': { abbrev: 'MIN', name: 'Vikings', location: 'Minnesota' },
  'NE': { abbrev: 'NE', name: 'Patriots', location: 'New England' },
  'NO': { abbrev: 'NO', name: 'Saints', location: 'New Orleans' },
  'NYG': { abbrev: 'NYG', name: 'Giants', location: 'New York' },
  'NYJ': { abbrev: 'NYJ', name: 'Jets', location: 'New York' },
  'PHI': { abbrev: 'PHI', name: 'Eagles', location: 'Philadelphia' },
  'PIT': { abbrev: 'PIT', name: 'Steelers', location: 'Pittsburgh' },
  'SF': { abbrev: 'SF', name: '49ers', location: 'San Francisco' },
  'SEA': { abbrev: 'SEA', name: 'Seahawks', location: 'Seattle' },
  'TB': { abbrev: 'TB', name: 'Buccaneers', location: 'Tampa Bay' },
  'TEN': { abbrev: 'TEN', name: 'Titans', location: 'Tennessee' },
  'WAS': { abbrev: 'WAS', name: 'Commanders', location: 'Washington' }
}

export class SleeperFantasyAPI {
  private baseUrl: string = 'https://api.sleeper.app/v1'
  private season: string
  private playerCache: Map<string, Player[]> = new Map()
  private playersDataCache: Map<string, SleeperPlayer> = new Map()
  private cacheExpiry: Map<string, number> = new Map()
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  constructor(season?: string) {
    this.season = season || new Date().getFullYear().toString()
  }

  // Get all NFL players from Sleeper
  async getAllPlayers(position?: string, forceRefresh: boolean = false): Promise<Player[]> {
    const cacheKey = `all_players_${position || 'all'}_${this.season}`
    
    // Check cache first
    if (!forceRefresh && this.isValidCache(cacheKey)) {
      return this.playerCache.get(cacheKey) || []
    }

    try {
      // Get all players data if not cached
      if (!this.playersDataCache.size || forceRefresh) {
        await this.loadAllPlayersData()
      }

      // Convert to our Player format and filter
      const allPlayers = Array.from(this.playersDataCache.values())
        .filter(player => {
          // Only include active NFL players
          if (!player.active || player.sport !== 'nfl') return false
          
          // Filter by position if specified
          if (position && position !== 'ALL') {
            return player.fantasy_positions?.includes(position) || player.position === position
          }
          
          return true
        })
        .map(this.convertToPlayer)
        .filter(player => player.position && player.fullName) // Remove invalid players
        .sort((a, b) => {
          // Sort by search rank (lower is better), then by name
          const aRank = a.searchRank || 9999
          const bRank = b.searchRank || 9999
          if (aRank !== bRank) return aRank - bRank
          return a.fullName.localeCompare(b.fullName)
        })

      // Cache the results
      this.playerCache.set(cacheKey, allPlayers)
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION)

      console.log(`Loaded ${allPlayers.length} players from Sleeper API`)
      return allPlayers
    } catch (error) {
      console.error('Error fetching players from Sleeper API:', error)
      return this.getMockPlayerData(position)
    }
  }

  // Load all players data from Sleeper
  private async loadAllPlayersData(): Promise<void> {
    try {
      console.log('Loading all players data from Sleeper...')
      const response = await axios.get(`${this.baseUrl}/players/nfl`, {
        timeout: 30000 // 30 second timeout
      })

      if (response.data) {
        this.playersDataCache.clear()
        Object.entries(response.data).forEach(([playerId, playerData]) => {
          this.playersDataCache.set(playerId, playerData as SleeperPlayer)
        })
        console.log(`Loaded ${this.playersDataCache.size} players from Sleeper`)
      }
    } catch (error) {
      console.error('Error loading players data from Sleeper:', error)
      throw error
    }
  }

  // Convert Sleeper player to our Player format
  private convertToPlayer = (sleeperPlayer: SleeperPlayer): Player => {
    return {
      id: sleeperPlayer.player_id,
      fullName: sleeperPlayer.full_name || `${sleeperPlayer.first_name} ${sleeperPlayer.last_name}`,
      firstName: sleeperPlayer.first_name || '',
      lastName: sleeperPlayer.last_name || '',
      team: sleeperPlayer.team,
      position: sleeperPlayer.position || '',
      fantasyPositions: sleeperPlayer.fantasy_positions || [],
      age: sleeperPlayer.age,
      yearsExp: sleeperPlayer.years_exp,
      injuryStatus: sleeperPlayer.injury_status,
      isActive: sleeperPlayer.active && sleeperPlayer.status === 'Active',
      searchRank: sleeperPlayer.search_rank,
      depthChartPosition: sleeperPlayer.depth_chart_position,
      ownership: {
        percentOwned: Math.random() * 100, // Mock data - would need league-specific data
        percentChange: (Math.random() - 0.5) * 20
      }
    }
  }

  // Get player stats for a specific week
  async getPlayerStats(position?: string, week?: number, limit?: number): Promise<Player[]> {
    try {
      const allPlayers = await this.getAllPlayers(position)
      
      // Apply limit if specified (default to 200 for rankings)
      const limitedPlayers = limit ? allPlayers.slice(0, limit) : allPlayers.slice(0, 200)
      
      // Try to get actual stats if week is specified
      if (week) {
        await this.enrichWithStats(limitedPlayers, week)
      }

      return limitedPlayers
    } catch (error) {
      console.error('Error fetching player stats:', error)
      return this.getMockPlayerData(position)
    }
  }

  // Enrich players with actual stats
  private async enrichWithStats(players: Player[], week: number): Promise<void> {
    try {
      const response = await axios.get(`${this.baseUrl}/stats/nfl/${this.season}/${week}`)
      const statsData = response.data

      players.forEach(player => {
        if (statsData[player.id]) {
          player.stats = statsData[player.id]
        }
      })
    } catch (error) {
      console.log('Stats not available for this week:', error.message)
    }
  }

  // Search players by name
  async searchPlayers(searchTerm: string, position?: string): Promise<Player[]> {
    try {
      const allPlayers = await this.getAllPlayers(position)
      
      const searchLower = searchTerm.toLowerCase()
      return allPlayers
        .filter(player => 
          player.fullName.toLowerCase().includes(searchLower) ||
          player.firstName.toLowerCase().includes(searchLower) ||
          player.lastName.toLowerCase().includes(searchLower) ||
          (player.team && player.team.toLowerCase().includes(searchLower))
        )
        .slice(0, 200) // Limit search results to top 200
    } catch (error) {
      console.error('Error searching players:', error)
      return []
    }
  }

  // Get players by team
  async getPlayersByTeam(teamAbbrev: string): Promise<Player[]> {
    try {
      const allPlayers = await this.getAllPlayers()
      return allPlayers.filter(player => player.team === teamAbbrev).slice(0, 200)
    } catch (error) {
      console.error('Error fetching players by team:', error)
      return []
    }
  }

  // Get trending players (most added/dropped)
  async getTrendingPlayers(): Promise<Player[]> {
    try {
      // Get trending data from Sleeper
      const [addResponse, dropResponse] = await Promise.all([
        axios.get(`${this.baseUrl}/players/nfl/trending/add`),
        axios.get(`${this.baseUrl}/players/nfl/trending/drop`)
      ])

      const trendingPlayerIds = [
        ...addResponse.data.slice(0, 10).map((item: SleeperTrendingPlayer) => item.player_id),
        ...dropResponse.data.slice(0, 10).map((item: SleeperTrendingPlayer) => item.player_id)
      ]

      // Get player details for trending players
      const allPlayers = await this.getAllPlayers()
      const trendingPlayers = allPlayers.filter(player => 
        trendingPlayerIds.includes(player.id)
      )

      // Add trending data
      trendingPlayers.forEach(player => {
        const addData = addResponse.data.find((item: SleeperTrendingPlayer) => item.player_id === player.id)
        const dropData = dropResponse.data.find((item: SleeperTrendingPlayer) => item.player_id === player.id)
        
        if (addData) {
          player.ownership = {
            percentOwned: Math.random() * 100,
            percentChange: Math.min(addData.count / 100, 20) // Convert to percentage
          }
        } else if (dropData) {
          player.ownership = {
            percentOwned: Math.random() * 100,
            percentChange: -Math.min(dropData.count / 100, 20) // Negative for drops
          }
        }
      })

      return trendingPlayers
    } catch (error) {
      console.error('Error fetching trending players:', error)
      return this.getMockTrendingData()
    }
  }

  // Get league statistics
  async getLeagueStats(): Promise<{ totalPlayers: number; activeLeagues: number; weeklyUpdates: number }> {
    try {
      const allPlayers = await this.getAllPlayers()
      
      return {
        totalPlayers: allPlayers.length,
        activeLeagues: 250000, // Estimated based on Sleeper's popularity
        weeklyUpdates: 50000
      }
    } catch (error) {
      console.error('Error fetching league stats:', error)
      return {
        totalPlayers: 2500,
        activeLeagues: 250000,
        weeklyUpdates: 50000
      }
    }
  }

  // Get current NFL week
  private getCurrentWeek(): number {
    // Simple calculation - in a real app you'd want more sophisticated logic
    const now = new Date()
    const seasonStart = new Date(parseInt(this.season), 8, 1) // September 1st
    const weeksSinceStart = Math.floor((now.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
    return Math.max(1, Math.min(18, weeksSinceStart + 1))
  }

  // Helper methods
  private isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key)
    return expiry ? Date.now() < expiry : false
  }

  // Clear cache manually
  clearCache(): void {
    this.playerCache.clear()
    this.playersDataCache.clear()
    this.cacheExpiry.clear()
  }

  // Get cache status
  getCacheStatus(): { [key: string]: { size: number; lastUpdated: Date | null } } {
    const status: { [key: string]: { size: number; lastUpdated: Date | null } } = {}
    
    for (const [key, players] of this.playerCache.entries()) {
      const expiry = this.cacheExpiry.get(key)
      status[key] = {
        size: players.length,
        lastUpdated: expiry ? new Date(expiry - this.CACHE_DURATION) : null
      }
    }
    
    return status
  }

  // Mock data fallback - Generate 200 players
  private getMockPlayerData(position?: string): Player[] {
    const mockPlayers: Player[] = []
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']
    const teams = Object.keys(NFL_TEAMS)
    
    // Generate 200 mock players
    for (let i = 1; i <= 200; i++) {
      const randomPosition = positions[Math.floor(Math.random() * positions.length)]
      const randomTeam = teams[Math.floor(Math.random() * teams.length)]
      
      // Filter by position if specified
      if (position && position !== 'ALL' && randomPosition !== position) {
        continue
      }
      
      mockPlayers.push({
        id: i.toString(),
        fullName: `Player ${i}`,
        firstName: 'Player',
        lastName: i.toString(),
        team: randomTeam,
        position: randomPosition,
        fantasyPositions: [randomPosition],
        age: 20 + Math.floor(Math.random() * 15),
        yearsExp: Math.floor(Math.random() * 15),
        injuryStatus: Math.random() > 0.9 ? 'Questionable' : null,
        isActive: true,
        searchRank: i,
        depthChartPosition: Math.floor(Math.random() * 3) + 1,
        ownership: { 
          percentOwned: Math.max(0, 100 - (i * 0.5) + (Math.random() * 20)), 
          percentChange: (Math.random() - 0.5) * 20 
        }
      })
    }

    // Add some star players at the top
    const starPlayers = [
      {
        id: 'josh_allen',
        fullName: 'Josh Allen',
        firstName: 'Josh',
        lastName: 'Allen',
        team: 'BUF',
        position: 'QB',
        fantasyPositions: ['QB'],
        age: 27,
        yearsExp: 6,
        injuryStatus: null,
        isActive: true,
        searchRank: 1,
        depthChartPosition: 1,
        ownership: { percentOwned: 99.8, percentChange: 0.1 }
      },
      {
        id: 'christian_mccaffrey',
        fullName: 'Christian McCaffrey',
        firstName: 'Christian',
        lastName: 'McCaffrey',
        team: 'SF',
        position: 'RB',
        fantasyPositions: ['RB'],
        age: 27,
        yearsExp: 7,
        injuryStatus: null,
        isActive: true,
        searchRank: 2,
        depthChartPosition: 1,
        ownership: { percentOwned: 99.9, percentChange: 0.0 }
      },
      {
        id: 'tyreek_hill',
        fullName: 'Tyreek Hill',
        firstName: 'Tyreek',
        lastName: 'Hill',
        team: 'MIA',
        position: 'WR',
        fantasyPositions: ['WR'],
        age: 29,
        yearsExp: 8,
        injuryStatus: null,
        isActive: true,
        searchRank: 3,
        depthChartPosition: 1,
        ownership: { percentOwned: 99.5, percentChange: 0.2 }
      }
    ]

    // Replace first few mock players with star players
    starPlayers.forEach((star, index) => {
      if (!position || position === 'ALL' || star.position === position) {
        mockPlayers[index] = star
      }
    })

    return mockPlayers.slice(0, 200)
  }

  private getMockTrendingData(): Player[] {
    return [
      {
        id: '101',
        fullName: 'Gus Edwards',
        firstName: 'Gus',
        lastName: 'Edwards',
        team: 'BAL',
        position: 'RB',
        fantasyPositions: ['RB'],
        age: 28,
        yearsExp: 6,
        injuryStatus: null,
        isActive: true,
        searchRank: 150,
        depthChartPosition: 2,
        ownership: { percentOwned: 45.2, percentChange: 15.8 }
      },
      {
        id: '102',
        fullName: 'Elijah Moore',
        firstName: 'Elijah',
        lastName: 'Moore',
        team: 'CLE',
        position: 'WR',
        fantasyPositions: ['WR'],
        age: 24,
        yearsExp: 3,
        injuryStatus: null,
        isActive: true,
        searchRank: 200,
        depthChartPosition: 3,
        ownership: { percentOwned: 23.1, percentChange: 12.4 }
      }
    ]
  }
}

// Export singleton instance
export const sleeperAPI = new SleeperFantasyAPI()