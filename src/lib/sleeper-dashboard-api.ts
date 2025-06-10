import { sleeperAPI, Player, NFL_TEAMS } from './sleeper-api'

export interface SleeperMatchupData {
  team: string
  opponent: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  projectedPoints: number
  defensiveRank: number
  allowedPoints: {
    qb: number
    rb: number
    wr: number
    te: number
  }
}

export interface SleeperInjuryData {
  playerId: string
  playerName: string
  team: string
  position: string
  status: 'Healthy' | 'Questionable' | 'Doubtful' | 'Out'
  injuryType: string
  weeklyImpact: number
  returnTimeline: string
}

export interface SleeperOwnershipData {
  playerId: string
  playerName: string
  position: string
  team: string
  percentOwned: number
  percentStarted: number
  addDropTrend: number
  weeklyChange: number
}

export interface SleeperPlayerNews {
  playerId: string
  headline: string
  summary: string
  impact: 'High' | 'Medium' | 'Low'
  timestamp: Date
  source: string
}

export class SleeperDashboardAPI {
  private baseUrl = 'https://api.sleeper.app/v1'
  private season = new Date().getFullYear().toString()
  private week = this.getCurrentWeek()

  // Get current NFL week
  private getCurrentWeek(): number {
    const now = new Date()
    const seasonStart = new Date(now.getFullYear(), 8, 1) // September 1st
    const weeksSinceStart = Math.floor((now.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
    return Math.max(1, Math.min(18, weeksSinceStart + 1))
  }

  // Enhanced matchup analysis using Sleeper data
  async getPositionalMatchups(position?: string): Promise<SleeperMatchupData[]> {
    try {
      // Get all active players for the position
      const players = await sleeperAPI.getAllPlayers(position)
      
      // Group by team and analyze defensive matchups
      const teamMatchups = new Map<string, SleeperMatchupData>()
      
      players.forEach(player => {
        if (!player.team || teamMatchups.has(player.team)) return
        
        const opponent = this.getOpponent(player.team)
        const difficulty = this.getMatchupDifficulty(player.team, opponent, position)
        const defensiveRank = this.getDefensiveRank(opponent, position)
        
        teamMatchups.set(player.team, {
          team: player.team,
          opponent,
          difficulty,
          projectedPoints: this.getProjectedPoints(player.team, position),
          defensiveRank,
          allowedPoints: this.getAllowedPoints(opponent)
        })
      })
      
      return Array.from(teamMatchups.values())
        .sort((a, b) => a.defensiveRank - b.defensiveRank)
    } catch (error) {
      console.error('Error fetching positional matchups:', error)
      return []
    }
  }

  // Get injury data from Sleeper
  async getInjuryReport(): Promise<SleeperInjuryData[]> {
    try {
      const players = await sleeperAPI.getAllPlayers()
      
      return players
        .filter(player => player.injuryStatus && player.injuryStatus !== 'Healthy')
        .map(player => ({
          playerId: player.id,
          playerName: player.fullName,
          team: player.team || 'FA',
          position: player.position,
          status: player.injuryStatus as any,
          injuryType: this.getInjuryType(player.injuryStatus),
          weeklyImpact: this.calculateInjuryImpact(player.injuryStatus),
          returnTimeline: this.getReturnTimeline(player.injuryStatus)
        }))
        .sort((a, b) => b.weeklyImpact - a.weeklyImpact)
    } catch (error) {
      console.error('Error fetching injury report:', error)
      return []
    }
  }

  // Get ownership and trending data
  async getOwnershipTrends(): Promise<SleeperOwnershipData[]> {
    try {
      const trendingPlayers = await sleeperAPI.getTrendingPlayers()
      
      return trendingPlayers.map(player => ({
        playerId: player.id,
        playerName: player.fullName,
        position: player.position,
        team: player.team || 'FA',
        percentOwned: player.ownership?.percentOwned || 0,
        percentStarted: (player.ownership?.percentOwned || 0) * 0.7, // Estimate
        addDropTrend: player.ownership?.percentChange || 0,
        weeklyChange: player.ownership?.percentChange || 0
      }))
    } catch (error) {
      console.error('Error fetching ownership trends:', error)
      return []
    }
  }

  // Get player news and updates
  async getPlayerNews(playerId?: string): Promise<SleeperPlayerNews[]> {
    try {
      // In a real implementation, this would fetch from Sleeper's news API
      // For now, we'll generate mock news based on player data
      const players = playerId ? 
        [await this.getPlayerById(playerId)] : 
        await sleeperAPI.getAllPlayers(undefined, false)
      
      return players
        .filter(player => player.injuryStatus || Math.random() > 0.8) // Mock news for some players
        .map(player => ({
          playerId: player.id,
          headline: this.generateNewsHeadline(player),
          summary: this.generateNewsSummary(player),
          impact: this.getNewsImpact(player),
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Last 24 hours
          source: 'Sleeper'
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 20)
    } catch (error) {
      console.error('Error fetching player news:', error)
      return []
    }
  }

  // Get bye week information
  async getByeWeekData(): Promise<{ week: number; teams: string[] }[]> {
    try {
      // Mock bye week data - in production this would come from Sleeper's schedule API
      return [
        { week: 12, teams: ['LAC', 'TB'] },
        { week: 13, teams: ['BUF', 'NYJ'] },
        { week: 14, teams: ['SF', 'SEA'] },
        { week: 15, teams: ['KC', 'LV'] },
        { week: 16, teams: ['DAL', 'NYG'] },
        { week: 17, teams: ['MIA', 'NE'] }
      ]
    } catch (error) {
      console.error('Error fetching bye week data:', error)
      return []
    }
  }

  // Enhanced player search with Sleeper data
  async searchPlayersWithContext(searchTerm: string, position?: string): Promise<Player[]> {
    try {
      const players = await sleeperAPI.searchPlayers(searchTerm, position)
      
      // Enhance with additional context
      return players.map(player => ({
        ...player,
        ownership: player.ownership || {
          percentOwned: Math.random() * 100,
          percentChange: (Math.random() - 0.5) * 20
        }
      }))
    } catch (error) {
      console.error('Error searching players:', error)
      return []
    }
  }

  // Helper methods
  private async getPlayerById(playerId: string): Promise<Player> {
    const players = await sleeperAPI.getAllPlayers()
    return players.find(p => p.id === playerId) || players[0]
  }

  private getOpponent(team: string): string {
    // Mock opponent data - in production this would come from schedule API
    const opponents: Record<string, string> = {
      'BUF': 'vs MIA',
      'MIA': '@ BUF',
      'KC': 'vs LV',
      'LV': '@ KC',
      'SF': 'vs SEA',
      'SEA': '@ SF'
    }
    return opponents[team] || 'vs TBD'
  }

  private getMatchupDifficulty(team: string, opponent: string, position?: string): 'Easy' | 'Medium' | 'Hard' {
    // Mock difficulty calculation
    const hash = team.charCodeAt(0) + (opponent.charCodeAt(0) || 0)
    if (hash % 3 === 0) return 'Easy'
    if (hash % 3 === 1) return 'Medium'
    return 'Hard'
  }

  private getDefensiveRank(opponent: string, position?: string): number {
    // Mock defensive ranking
    return Math.floor(Math.random() * 32) + 1
  }

  private getProjectedPoints(team: string, position?: string): number {
    const basePoints = position === 'QB' ? 20 : position === 'RB' ? 15 : position === 'WR' ? 12 : 8
    return basePoints + (Math.random() - 0.5) * 6
  }

  private getAllowedPoints(opponent: string): { qb: number; rb: number; wr: number; te: number } {
    return {
      qb: 18 + Math.random() * 8,
      rb: 12 + Math.random() * 6,
      wr: 10 + Math.random() * 5,
      te: 7 + Math.random() * 4
    }
  }

  private getInjuryType(status: string | null): string {
    if (!status) return 'Unknown'
    if (status.includes('ankle')) return 'Ankle'
    if (status.includes('knee')) return 'Knee'
    if (status.includes('shoulder')) return 'Shoulder'
    if (status.includes('hamstring')) return 'Hamstring'
    return 'General'
  }

  private calculateInjuryImpact(status: string | null): number {
    if (!status) return 0
    if (status === 'Out') return 100
    if (status === 'Doubtful') return 75
    if (status === 'Questionable') return 40
    return 10
  }

  private getReturnTimeline(status: string | null): string {
    if (!status) return 'N/A'
    if (status === 'Out') return '2-4 weeks'
    if (status === 'Doubtful') return '1-2 weeks'
    if (status === 'Questionable') return 'Day-to-day'
    return 'Monitor'
  }

  private generateNewsHeadline(player: Player): string {
    if (player.injuryStatus) {
      return `${player.fullName} listed as ${player.injuryStatus} for Week ${this.week}`
    }
    
    const headlines = [
      `${player.fullName} expected to see increased role`,
      `${player.fullName} trending up in fantasy rankings`,
      `${player.fullName} drawing favorable matchup this week`,
      `${player.fullName} practice report: Full participation`
    ]
    
    return headlines[Math.floor(Math.random() * headlines.length)]
  }

  private generateNewsSummary(player: Player): string {
    if (player.injuryStatus) {
      return `${player.fullName} has been dealing with an injury and is currently listed as ${player.injuryStatus}. Monitor his practice participation throughout the week for the latest updates on his availability.`
    }
    
    return `${player.fullName} continues to be a key player for the ${NFL_TEAMS[player.team || '']?.name || 'team'}. Fantasy managers should monitor his usage and matchup for optimal lineup decisions.`
  }

  private getNewsImpact(player: Player): 'High' | 'Medium' | 'Low' {
    if (player.injuryStatus === 'Out') return 'High'
    if (player.injuryStatus === 'Doubtful') return 'High'
    if (player.injuryStatus === 'Questionable') return 'Medium'
    if (player.searchRank && player.searchRank <= 50) return 'Medium'
    return 'Low'
  }
}

// Export singleton instance
export const sleeperDashboardAPI = new SleeperDashboardAPI()