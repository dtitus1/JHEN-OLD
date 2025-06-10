import React from 'react'
import { BarChart3, Target, Video, FileText, Zap, Shield } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'

export function Features() {
  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Rankings',
      description: 'Get weekly updated rankings with detailed projections for all positions across multiple scoring formats.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Target,
      title: 'Start/Sit Tool',
      description: 'Make confident lineup decisions with our AI-powered start/sit recommendations based on matchup data.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Video,
      title: 'Video Analysis',
      description: 'Watch in-depth video breakdowns of key players, matchups, and weekly strategy sessions.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: FileText,
      title: 'Draft Guides',
      description: 'Comprehensive draft guides with auction values, sleepers, and position-by-position analysis.',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Stay ahead with instant injury reports, lineup changes, and breaking news notifications.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      icon: Shield,
      title: 'Expert Analysis',
      description: 'Access exclusive content from seasoned fantasy experts with proven track records.',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  return (
    <section className="py-20 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold font-display text-secondary-900 mb-4">
            Everything You Need to Win
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Our comprehensive suite of tools and analysis gives you the edge you need 
            to dominate your fantasy football leagues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}