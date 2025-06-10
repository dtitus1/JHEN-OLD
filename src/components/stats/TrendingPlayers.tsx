import React from 'react'
import { TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react'
import { Player, NFL_TEAMS } from '../../lib/sleeper-api'
import { Card, CardContent, CardHeader } from '../ui/Card'

interface TrendingPlayersProps {
  players: Player[]
  loading: boolean
}

export function TrendingPlayers({ players, loading }: TrendingPlayersProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Trending Players</h3>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary-200 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-secondary-200 rounded w-24"></div>
                    <div className="h-3 bg-secondary-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="w-12 h-4 bg-secondary-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const addDrops = players.filter(p => (p.ownership?.percentChange || 0) > 2)
  const drops = players.filter(p => (p.ownership?.percentChange || 0) < -2)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Most Added */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Plus className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold">Most Added</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {addDrops.slice(0, 5).map((player) => {
              const team = NFL_TEAMS[player.team || '']
              const trend = player.ownership?.percentChange || 0

              return (
                <div key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary-900">{player.fullName}</div>
                      <div className="text-sm text-secondary-500">
                        {team?.abbrev || player.team || 'FA'} - {player.position}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      +{trend.toFixed(1)}%
                    </div>
                    <div className="text-xs text-secondary-500">
                      {(player.ownership?.percentOwned || 0).toFixed(1)}% owned
                    </div>
                  </div>
                </div>
              )
            })}
            {addDrops.length === 0 && (
              <div className="text-center py-8">
                <p className="text-secondary-500">No significant adds this week</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Most Dropped */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Minus className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold">Most Dropped</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {drops.length > 0 ? (
              drops.slice(0, 5).map((player) => {
                const team = NFL_TEAMS[player.team || '']
                const trend = player.ownership?.percentChange || 0

                return (
                  <div key={player.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-secondary-900">{player.fullName}</div>
                        <div className="text-sm text-secondary-500">
                          {team?.abbrev || player.team || 'FA'} - {player.position}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">
                        {trend.toFixed(1)}%
                      </div>
                      <div className="text-xs text-secondary-500">
                        {(player.ownership?.percentOwned || 0).toFixed(1)}% owned
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-secondary-500">No significant drops this week</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}