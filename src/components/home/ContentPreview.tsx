import React from 'react'
import { ArrowRight, Clock, Lock, Play } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { useNavigate } from 'react-router-dom'

export function ContentPreview() {
  const navigate = useNavigate()

  const articles = [
    {
      title: 'Week 12 Waiver Wire Targets',
      excerpt: 'Key pickups that could make or break your playoff push...',
      readTime: '5 min read',
      isPremium: false,
      image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      title: 'Advanced Playoff Strategies',
      excerpt: 'Exclusive tactics for maximizing your championship odds...',
      readTime: '8 min read',
      isPremium: true,
      image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      title: 'RB Handcuff Analysis',
      excerpt: 'Which backup running backs deserve roster spots...',
      readTime: '6 min read',
      isPremium: true,
      image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ]

  const videos = [
    {
      title: 'Week 12 Start/Sit Decisions',
      duration: '18:45',
      thumbnail: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=400',
      isPremium: false,
      views: '12.5K',
    },
    {
      title: 'Josh Allen vs Lamar Jackson - QB1 Debate',
      duration: '22:18',
      thumbnail: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=400',
      isPremium: true,
      views: '15.2K',
    },
  ]

  return (
    <section className="py-20 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Articles Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold font-display text-secondary-900 mb-2">
                Latest Analysis
              </h2>
              <p className="text-secondary-600">
                Expert insights and data-driven analysis to give you the edge
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/articles')}>
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  {article.isPremium && (
                    <div className="absolute top-3 right-3 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Premium
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-secondary-600 text-sm mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center text-secondary-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {article.readTime}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Videos Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold font-display text-secondary-900 mb-2">
                Video Analysis
              </h2>
              <p className="text-secondary-600">
                In-depth video breakdowns from the JHEN Fantasy YouTube channel
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/videos')}>
              View All Videos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white rounded-full p-3">
                      <Play className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {video.views} views
                  </div>
                  {video.isPremium && (
                    <div className="absolute top-3 right-3 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Premium
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                    {video.title}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}