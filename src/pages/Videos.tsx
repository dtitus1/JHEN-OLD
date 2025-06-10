import React, { useState } from 'react'
import { Play, Clock, Calendar, Filter, Search, ExternalLink, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

interface Video {
  id: string | number
  title: string
  description: string
  thumbnail: string
  duration: string
  uploadDate: string
  category: string
  isPremium: boolean
  views: string
  videoId?: string
  isFeatured?: boolean
}

export function Videos() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [embedError, setEmbedError] = useState(false)

  const categories = [
    { id: 'all', name: 'All Videos' },
    { id: 'weekly-analysis', name: 'Weekly Analysis' },
    { id: 'player-breakdown', name: 'Player Breakdowns' },
    { id: 'draft-strategy', name: 'Draft Strategy' },
    { id: 'waiver-wire', name: 'Waiver Wire' },
    { id: 'start-sit', name: 'Start/Sit' },
  ]

  // JHEN Fantasy YouTube channel videos - including the embedded Marvin Harrison Jr. video
  const videos: Video[] = [
    {
      id: 'featured',
      title: 'Marvin Harrison Jr. Fantasy Football Analysis - Rookie WR Breakdown',
      description: 'Complete breakdown of Marvin Harrison Jr.\'s fantasy football potential. Analyzing his college production, NFL draft profile, and what to expect from the Cardinals rookie receiver.',
      thumbnail: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: '12:45',
      uploadDate: '2024-11-20',
      category: 'player-breakdown',
      isPremium: false,
      views: '25.3K',
      videoId: 'ISg3XIDwXdY',
      isFeatured: true,
    },
    {
      id: 1,
      title: 'Week 12 Fantasy Football Start/Sit Decisions',
      description: 'Complete breakdown of who to start and sit for Week 12 of fantasy football. Covering all positions with detailed analysis.',
      thumbnail: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: '18:45',
      uploadDate: '2024-11-20',
      category: 'start-sit',
      isPremium: false,
      views: '12.5K',
    },
    {
      id: 2,
      title: 'Fantasy Football Waiver Wire Pickups - Week 12',
      description: 'Top waiver wire targets for Week 12. Find the hidden gems that could win you your league.',
      thumbnail: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: '15:32',
      uploadDate: '2024-11-19',
      category: 'waiver-wire',
      isPremium: false,
      views: '8.7K',
    },
    {
      id: 3,
      title: 'Josh Allen vs Lamar Jackson - QB1 Debate',
      description: 'Deep dive analysis comparing Josh Allen and Lamar Jackson for fantasy playoffs. Who should you trust?',
      thumbnail: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: '22:18',
      uploadDate: '2024-11-18',
      category: 'player-breakdown',
      isPremium: true,
      views: '15.2K',
    },
    {
      id: 4,
      title: '2024 Fantasy Football Draft Strategy Guide',
      description: 'Complete draft strategy for 2024 fantasy football season. Position-by-position breakdown and value picks.',
      thumbnail: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: '35:42',
      uploadDate: '2024-08-15',
      category: 'draft-strategy',
      isPremium: true,
      views: '45.8K',
    },
    {
      id: 5,
      title: 'Fantasy Football Week 11 Recap & Week 12 Preview',
      description: 'Analyzing the biggest fantasy performances from Week 11 and looking ahead to Week 12 matchups.',
      thumbnail: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: '28:15',
      uploadDate: '2024-11-17',
      category: 'weekly-analysis',
      isPremium: false,
      views: '9.3K',
    },
    {
      id: 6,
      title: 'Christian McCaffrey Injury Update & Handcuff Analysis',
      description: 'Breaking down CMC\'s injury situation and analyzing the best handcuff options for fantasy managers.',
      thumbnail: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: '12:28',
      uploadDate: '2024-11-16',
      category: 'player-breakdown',
      isPremium: true,
      views: '18.9K',
    },
    {
      id: 7,
      title: 'Fantasy Football Playoff Push - Must-Win Strategies',
      description: 'Essential strategies for making the fantasy playoffs. Trade targets, waiver priorities, and lineup optimization.',
      thumbnail: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: '24:56',
      uploadDate: '2024-11-15',
      category: 'weekly-analysis',
      isPremium: true,
      views: '22.1K',
    },
    {
      id: 8,
      title: 'Top 10 Fantasy Football Sleepers for Week 12',
      description: 'Uncovering the best sleeper picks for Week 12. Low-owned players with high upside potential.',
      thumbnail: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: '16:33',
      uploadDate: '2024-11-14',
      category: 'start-sit',
      isPremium: false,
      views: '11.7K',
    },
  ]

  const filteredVideos = videos.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const openJHENFantasyChannel = () => {
    window.open('https://www.youtube.com/@JHENFantasy/videos', '_blank')
  }

  const openVideoOnYouTube = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')
  }

  const featuredVideo = videos.find(v => v.isFeatured)

  const handleEmbedError = () => {
    setEmbedError(true)
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display text-secondary-900 mb-2">
                JHEN Fantasy Video Hub
              </h1>
              <p className="text-secondary-600">
                Expert fantasy football analysis, strategy guides, and weekly breakdowns from the JHEN Fantasy YouTube channel
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                onClick={openJHENFantasyChannel}
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit YouTube Channel
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Video */}
        {featuredVideo && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-2xl font-semibold text-secondary-900">Featured Video</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Video Embed or Fallback */}
                <div className="aspect-video">
                  {!embedError ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube-nocookie.com/embed/${featuredVideo.videoId}?rel=0&modestbranding=1&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0&controls=1&showinfo=0`}
                      title={featuredVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="rounded-lg"
                      onError={handleEmbedError}
                    ></iframe>
                  ) : (
                    <div 
                      className="w-full h-full bg-gradient-to-br from-secondary-800 to-secondary-900 rounded-lg flex flex-col items-center justify-center text-white cursor-pointer hover:from-secondary-700 hover:to-secondary-800 transition-all"
                      onClick={() => featuredVideo.videoId && openVideoOnYouTube(featuredVideo.videoId)}
                    >
                      <AlertCircle className="h-12 w-12 mb-4 text-primary-400" />
                      <h3 className="text-lg font-semibold mb-2">Video Embedding Restricted</h3>
                      <p className="text-secondary-300 text-center mb-4 px-4">
                        This video cannot be embedded. Click to watch on YouTube.
                      </p>
                      <Button className="bg-red-600 hover:bg-red-700">
                        <Play className="h-4 w-4 mr-2" />
                        Watch on YouTube
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Video Info */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-secondary-900">
                    {featuredVideo.title}
                  </h3>
                  <p className="text-secondary-600 leading-relaxed">
                    {featuredVideo.description}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-secondary-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(featuredVideo.uploadDate)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {featuredVideo.duration}
                    </div>
                    <div>
                      {featuredVideo.views} views
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => featuredVideo.videoId && openVideoOnYouTube(featuredVideo.videoId)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Watch on YouTube
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://www.youtube.com/@JHENFantasy?sub_confirmation=1', '_blank')}
                    >
                      Subscribe to Channel
                    </Button>
                  </div>

                  {/* Embedding Tips */}
                  <div className="bg-secondary-100 p-4 rounded-lg">
                    <h4 className="font-medium text-secondary-900 mb-2">Having trouble viewing?</h4>
                    <ul className="text-sm text-secondary-600 space-y-1">
                      <li>• Try disabling ad blockers</li>
                      <li>• Check if third-party cookies are enabled</li>
                      <li>• Click "Watch on YouTube" for the best experience</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Search Videos
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search videos..."
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

        {/* Video Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-secondary-900 mb-6">All Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.filter(v => !v.isFeatured).map((video) => (
              <Card key={video.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="relative" onClick={() => video.videoId && openVideoOnYouTube(video.videoId)}>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white rounded-full p-4 shadow-lg">
                      <Play className="h-8 w-8 text-primary-600 ml-1" />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                    {video.duration}
                  </div>

                  {/* Premium Badge */}
                  {video.isPremium && (
                    <div className="absolute top-3 right-3 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Premium
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  
                  <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                    {video.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-secondary-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(video.uploadDate)}
                    </div>
                    <div className="flex items-center">
                      <span>{video.views} views</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => video.videoId && openVideoOnYouTube(video.videoId)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch on YouTube
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* No Results */}
        {filteredVideos.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-secondary-600 text-lg">No videos found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
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

        {/* Channel Info */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                Subscribe to JHEN Fantasy
              </h3>
              <p className="text-secondary-600 mb-4">
                Get the latest fantasy football analysis, weekly rankings, and winning strategies delivered straight to your feed.
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => window.open('https://www.youtube.com/@JHENFantasy?sub_confirmation=1', '_blank')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Subscribe on YouTube
                </Button>
                <Button
                  variant="outline"
                  onClick={openJHENFantasyChannel}
                >
                  Browse All Videos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}