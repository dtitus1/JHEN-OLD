import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Trophy, TrendingUp, Users } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../contexts/AuthContext'

export function Hero() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <section className="relative bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold font-display leading-tight">
                Dominate Your
                <span className="text-primary-500 block">Fantasy League</span>
              </h1>
              <p className="text-xl text-secondary-300 leading-relaxed">
                Get expert analysis, advanced rankings, and winning strategies from JHEN Fantasy. 
                Join thousands of fantasy managers who trust our data-driven insights.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-lg mx-auto mb-2">
                  <Trophy className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm text-secondary-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-lg mx-auto mb-2">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm text-secondary-400">Predictions</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-lg mx-auto mb-2">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-secondary-400">Members</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate(user ? '/rankings' : '/signup')}
                className="group"
              >
                {user ? 'View Rankings' : 'Start Free Trial'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/pricing')}
                className="border-white text-white hover:bg-white hover:text-secondary-900"
              >
                View Pricing
              </Button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8 shadow-2xl">
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-secondary-900">Week 12 Rankings</h3>
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm font-medium">
                    Premium
                  </span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: 'Josh Allen', team: 'BUF', proj: '24.8' },
                    { name: 'Lamar Jackson', team: 'BAL', proj: '23.2' },
                    { name: 'Jalen Hurts', team: 'PHI', proj: '22.1' },
                  ].map((player, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-800 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-secondary-900">{player.name}</div>
                          <div className="text-sm text-secondary-500">{player.team}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-secondary-900">{player.proj}</div>
                        <div className="text-sm text-secondary-500">proj</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}