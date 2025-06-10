import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Users, ChevronUp, ChevronDown } from 'lucide-react'
import { Player, NFL_TEAMS } from '../../lib/sleeper-api'
import { Card, CardContent } from '../ui/Card'

interface PlayerStatsTableProps {
  players: Player[]
  loading: boolean
}

type SortField = 'rank' | 'name' | 'team' | 'position' | 'age' | 'ownership'
type SortDirection = 'asc' | 'desc'

export function PlayerStatsTable({ players, loading }: PlayerStatsTableProps) {
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />
  }

  const sortedPlayers = [...players].sort((a, b) => {
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
      case 'age':
        aValue = a.age || 0
        bValue = b.age || 0
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-secondary-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/6"></div>
                </div>
                <div className="w-16 h-4 bg-secondary-200 rounded"></div>
                <div className="w-12 h-4 bg-secondary-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (players.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-secondary-600">No players found for the selected criteria.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Player</span>
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
                  onClick={() => handleSort('team')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Team</span>
                    {getSortIcon('team')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
                  onClick={() => handleSort('position')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Position</span>
                    {getSortIcon('position')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
                  onClick={() => handleSort('age')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Age/Exp</span>
                    {getSortIcon('age')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
                  onClick={() => handleSort('ownership')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Ownership</span>
                    {getSortIcon('ownership')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {sortedPlayers.slice(0, 50).map((player, index) => {
                const team = NFL_TEAMS[player.team || '']
                const ownership = player.ownership?.percentOwned || 0
                const trend = player.ownership?.percentChange || 0

                return (
                  <tr key={player.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-800 rounded-full font-semibold text-sm mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-secondary-900">{player.fullName}</div>
                          {player.injuryStatus && (
                            <div className="text-sm text-red-600 font-medium">
                              {player.injuryStatus}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {team?.abbrev || player.team || 'FA'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {player.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      <div>
                        {player.age && <div>Age: {player.age}</div>}
                        {player.yearsExp !== null && <div className="text-xs text-secondary-500">Exp: {player.yearsExp}yr</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-secondary-400" />
                        {ownership.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {trend > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : trend < 0 ? (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        ) : (
                          <div className="h-4 w-4 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-secondary-600'
                        }`}>
                          {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}