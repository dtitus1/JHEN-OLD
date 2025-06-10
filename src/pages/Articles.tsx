import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Search, Filter, ArrowRight, Newspaper } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LatestNewsFeed } from '../components/news/LatestNewsFeed'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image?: string
  is_premium: boolean
  is_featured: boolean
  published_at: string
  read_time: number
  view_count: number
  category?: {
    name: string
    color: string
  }
  author?: {
    full_name: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
  color: string
}

export function Articles() {
  const { user } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'articles' | 'news'>('articles') // Default to articles

  useEffect(() => {
    if (activeTab === 'articles') {
      loadData()
    }
  }, [activeTab])

  const loadData = async () => {
    try {
      setLoading(true)

      if (supabase) {
        // Load articles with category info only (remove author join for now)
        const { data: articlesData, error: articlesError } = await supabase
          .from('articles')
          .select(`
            *,
            category:categories(name, color)
          `)
          .eq('published', true)
          .order('published_at', { ascending: false })

        if (articlesError) throw articlesError

        // Filter premium content based on user subscription
        const filteredArticles = articlesData?.filter(article => {
          if (!article.is_premium) return true
          if (!user) return false
          // Add subscription check here when implemented
          return true
        }) || []

        setArticles(filteredArticles)

        // Load categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (categoriesError) throw categoriesError
        setCategories(categoriesData || [])
      } else {
        // Fallback to mock data if database is not available
        setArticles(getMockArticles())
        setCategories(getMockCategories())
      }
    } catch (error) {
      console.error('Error loading articles:', error)
      // Fallback to mock data if database is not available
      setArticles(getMockArticles())
      setCategories(getMockCategories())
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category?.name.toLowerCase().replace(/\s+/g, '-') === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredArticles = filteredArticles.filter(article => article.is_featured).slice(0, 3)
  const regularArticles = filteredArticles.filter(article => !article.is_featured)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-secondary-900 mb-2">
            News & Analysis Hub
          </h1>
          <p className="text-secondary-600">
            Latest fantasy football news, expert analysis, and winning strategies from the JHEN Fantasy team
          </p>
        </div>

        {/* Tab Navigation */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="flex border-b border-secondary-200">
              <button
                onClick={() => setActiveTab('articles')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'articles'
                    ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Expert Articles</span>
                </div>
                <p className="text-sm mt-1 opacity-75">In-depth analysis & strategy</p>
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'news'
                    ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Newspaper className="h-5 w-5" />
                  <span>Latest News</span>
                </div>
                <p className="text-sm mt-1 opacity-75">Real-time player updates</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        {activeTab === 'news' ? (
          <LatestNewsFeed />
        ) : (
          <>
            {/* Filters */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Search Articles
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                      <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-secondary-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Filter Button */}
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-6">Featured Articles</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {featuredArticles.map((article) => (
                    <Card key={article.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <div className="relative">
                        <img
                          src={article.featured_image || 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600'}
                          alt={article.title}
                          className="w-full h-48 object-cover"
                        />
                        {article.is_premium && (
                          <div className="absolute top-3 right-3 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Premium
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      </div>
                      <CardContent className="p-6">
                        {article.category && (
                          <div className="mb-2">
                            <span 
                              className="inline-block px-2 py-1 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: article.category.color }}
                            >
                              {article.category.name}
                            </span>
                          </div>
                        )}
                        <h3 className="font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-secondary-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(article.published_at)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {article.read_time} min read
                            </div>
                          </div>
                          <div className="text-xs">
                            {article.view_count.toLocaleString()} views
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Articles */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-secondary-900 mb-6">Latest Articles</h2>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-secondary-200"></div>
                      <CardContent className="p-6">
                        <div className="h-4 bg-secondary-200 rounded mb-2"></div>
                        <div className="h-6 bg-secondary-200 rounded mb-2"></div>
                        <div className="h-4 bg-secondary-200 rounded mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-3 bg-secondary-200 rounded w-20"></div>
                          <div className="h-3 bg-secondary-200 rounded w-16"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularArticles.map((article) => (
                    <Card key={article.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <div className="relative">
                        <img
                          src={article.featured_image || 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600'}
                          alt={article.title}
                          className="w-full h-48 object-cover"
                        />
                        {article.is_premium && (
                          <div className="absolute top-3 right-3 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Premium
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6">
                        {article.category && (
                          <div className="mb-2">
                            <span 
                              className="inline-block px-2 py-1 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: article.category.color }}
                            >
                              {article.category.name}
                            </span>
                          </div>
                        )}
                        <h3 className="font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-secondary-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(article.published_at)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {article.read_time} min read
                            </div>
                          </div>
                          <div className="text-xs">
                            {article.view_count.toLocaleString()} views
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* No Results */}
            {!loading && filteredArticles.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-secondary-600 text-lg mb-4">No articles found matching your criteria.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory('all')
                      setSearchTerm('')
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Newsletter Signup */}
            <Card className="mt-12">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
                  Stay Updated with JHEN Fantasy
                </h3>
                <p className="text-secondary-600 mb-6">
                  Get the latest fantasy football analysis and insights delivered to your inbox weekly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 rounded-lg border border-secondary-300 px-4 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                  <Button>
                    Subscribe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

// Mock data for when database is not available
function getMockArticles(): Article[] {
  return [
    {
      id: '1',
      title: 'Week 12 Waiver Wire Targets: Hidden Gems for Your Playoff Push',
      slug: 'week-12-waiver-wire-targets',
      excerpt: 'Discover the under-the-radar players who could be the difference makers in your fantasy playoff run. Our analysis covers all positions with detailed breakdowns.',
      featured_image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      is_premium: false,
      is_featured: true,
      published_at: '2024-11-20T10:00:00Z',
      read_time: 8,
      view_count: 2547,
      category: { name: 'Waiver Wire', color: '#F59E0B' },
      author: { full_name: 'JHEN Fantasy Team' }
    },
    {
      id: '2',
      title: 'Advanced Playoff Strategies: Maximizing Your Championship Odds',
      slug: 'advanced-playoff-strategies',
      excerpt: 'Exclusive tactics and roster construction strategies that separate championship teams from the rest. Premium analysis for serious fantasy managers.',
      featured_image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      is_premium: true,
      is_featured: true,
      published_at: '2024-11-19T15:30:00Z',
      read_time: 12,
      view_count: 1823,
      category: { name: 'Weekly Analysis', color: '#3B82F6' },
      author: { full_name: 'JHEN Fantasy Team' }
    },
    {
      id: '3',
      title: 'RB Handcuff Analysis: Which Backup Running Backs Deserve Roster Spots',
      slug: 'rb-handcuff-analysis',
      excerpt: 'Complete breakdown of the most valuable handcuff running backs heading into the fantasy playoffs. Protect your investments and find league winners.',
      featured_image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      is_premium: true,
      is_featured: false,
      published_at: '2024-11-18T12:00:00Z',
      read_time: 10,
      view_count: 1456,
      category: { name: 'Player Breakdowns', color: '#10B981' },
      author: { full_name: 'JHEN Fantasy Team' }
    },
    {
      id: '4',
      title: 'Fantasy Football Trade Deadline: Last-Minute Moves That Win Championships',
      slug: 'trade-deadline-championship-moves',
      excerpt: 'With the trade deadline approaching, discover the strategic moves that can transform your roster from playoff hopeful to championship contender.',
      featured_image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      is_premium: false,
      is_featured: false,
      published_at: '2024-11-17T09:15:00Z',
      read_time: 7,
      view_count: 1892,
      category: { name: 'Trade Analysis', color: '#06B6D4' },
      author: { full_name: 'JHEN Fantasy Team' }
    },
    {
      id: '5',
      title: 'Week 12 Start/Sit Decisions: Playoff-Defining Lineup Choices',
      slug: 'week-12-start-sit-decisions',
      excerpt: 'Critical start/sit decisions that could make or break your playoff chances. Expert analysis on the toughest lineup calls for Week 12.',
      featured_image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      is_premium: false,
      is_featured: false,
      published_at: '2024-11-16T14:45:00Z',
      read_time: 6,
      view_count: 2156,
      category: { name: 'Start/Sit', color: '#EF4444' },
      author: { full_name: 'JHEN Fantasy Team' }
    },
    {
      id: '6',
      title: 'Rookie Wide Receiver Breakout Candidates for Fantasy Playoffs',
      slug: 'rookie-wr-breakout-candidates',
      excerpt: 'Which rookie wide receivers are primed for breakout performances during the fantasy playoffs? Our scouting report reveals the hidden gems.',
      featured_image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      is_premium: true,
      is_featured: false,
      published_at: '2024-11-15T11:30:00Z',
      read_time: 9,
      view_count: 1234,
      category: { name: 'Player Breakdowns', color: '#10B981' },
      author: { full_name: 'JHEN Fantasy Team' }
    }
  ]
}

function getMockCategories(): Category[] {
  return [
    { id: '1', name: 'Weekly Analysis', slug: 'weekly-analysis', color: '#3B82F6' },
    { id: '2', name: 'Player Breakdowns', slug: 'player-breakdowns', color: '#10B981' },
    { id: '3', name: 'Waiver Wire', slug: 'waiver-wire', color: '#F59E0B' },
    { id: '4', name: 'Start/Sit', slug: 'start-sit', color: '#EF4444' },
    { id: '5', name: 'Draft Strategy', slug: 'draft-strategy', color: '#8B5CF6' },
    { id: '6', name: 'Trade Analysis', slug: 'trade-analysis', color: '#06B6D4' }
  ]
}