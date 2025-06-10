import React, { useState, useEffect } from 'react'
import { Clock, AlertTriangle, TrendingUp, RefreshCw, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { sleeperDashboardAPI, SleeperPlayerNews } from '../../lib/sleeper-dashboard-api'

export function LatestNewsFeed() {
  const [newsData, setNewsData] = useState<SleeperPlayerNews[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedImpact, setSelectedImpact] = useState('All')

  const impactFilters = ['All', 'High', 'Medium', 'Low']

  useEffect(() => {
    loadNewsData()
  }, [])

  const loadNewsData = async () => {
    setLoading(true)
    try {
      const news = await sleeperDashboardAPI.getPlayerNews()
      setNewsData(news)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading news data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-secondary-100 text-secondary-800 border-secondary-200'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'High': return <AlertTriangle className="h-4 w-4" />
      case 'Medium': return <TrendingUp className="h-4 w-4" />
      case 'Low': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredNews = selectedImpact === 'All' 
    ? newsData 
    : newsData.filter(news => news.impact === selectedImpact)

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">Latest Fantasy News</h2>
              <p className="text-secondary-600">Real-time player updates and breaking news from Sleeper</p>
              {lastUpdated && (
                <p className="text-sm text-secondary-500 mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedImpact}
                onChange={(e) => setSelectedImpact(e.target.value)}
                className="rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                {impactFilters.map(filter => (
                  <option key={filter} value={filter}>{filter} Impact</option>
                ))}
              </select>
              <Button onClick={loadNewsData} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* News Feed */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading latest news...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNews.map((news, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Impact Badge */}
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(news.impact)}`}>
                    {getImpactIcon(news.impact)}
                    <span>{news.impact}</span>
                  </div>

                  {/* News Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2">
                      {news.headline}
                    </h3>
                    <p className="text-secondary-600 text-sm mb-3 line-clamp-3">
                      {news.summary}
                    </p>
                    
                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-secondary-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(news.timestamp)}
                        </span>
                        <span>Source: {news.source}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredNews.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-secondary-600 text-lg">No news found for the selected impact level.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSelectedImpact('All')}
                >
                  Show All News
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* News Categories */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">News Categories</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="font-semibold text-red-900">High Impact</div>
              <div className="text-sm text-red-700">
                {newsData.filter(n => n.impact === 'High').length} updates
              </div>
              <div className="text-xs text-red-600 mt-1">
                Injuries, suspensions, major role changes
              </div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="font-semibold text-yellow-900">Medium Impact</div>
              <div className="text-sm text-yellow-700">
                {newsData.filter(n => n.impact === 'Medium').length} updates
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                Practice reports, depth chart changes
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-green-900">Low Impact</div>
              <div className="text-sm text-green-700">
                {newsData.filter(n => n.impact === 'Low').length} updates
              </div>
              <div className="text-xs text-green-600 mt-1">
                General updates, minor news
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Sources */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">News Sources</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-secondary-900">Sleeper</div>
                <div className="text-secondary-600">Player updates</div>
              </div>
              <div>
                <div className="font-medium text-secondary-900">NFL.com</div>
                <div className="text-secondary-600">Official reports</div>
              </div>
              <div>
                <div className="font-medium text-secondary-900">ESPN</div>
                <div className="text-secondary-600">Breaking news</div>
              </div>
              <div>
                <div className="font-medium text-secondary-900">FantasyPros</div>
                <div className="text-secondary-600">Expert analysis</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-secondary-500">
              News updates every 5 minutes during the NFL season
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}