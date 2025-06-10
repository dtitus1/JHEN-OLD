import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, Settings, BarChart3, Wrench, Newspaper } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false)
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false)
  const [isNewsMenuOpen, setIsNewsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  const navigation = [
    { name: 'Stats', href: '/stats' },
  ]

  const newsItems = [
    { name: 'Articles', href: '/articles' },
    { name: 'Videos', href: '/videos' },
  ]

  const toolsItems = [
    { name: 'Draft Guides', href: '/draft-guides' },
    { name: 'Rankings', href: '/rankings' },
    { name: 'Tier Rankings', href: '/tier-rankings' },
    { name: 'Start/Sit Analyzer', href: '/start-sit' },
  ]

  const dashboardItems = [
    { name: 'Positional Matchups', href: '/dashboard?tab=positional-matchups' },
    { name: 'Panic Meter', href: '/dashboard?tab=panic-meter' },
    { name: 'Bye Weeks', href: '/dashboard?tab=bye-weeks' },
    { name: 'Schedule Analysis', href: '/dashboard?tab=schedule-analysis' },
    { name: 'Defensive Schemes', href: '/dashboard?tab=defensive-schemes' },
    { name: 'O-Line Rankings', href: '/dashboard?tab=oline-rankings' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/3.png" alt="JHEN Fantasy" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* News Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNewsMenuOpen(!isNewsMenuOpen)}
                className="flex items-center text-secondary-700 hover:text-primary-600 font-medium transition-colors"
              >
                <Newspaper className="h-4 w-4 mr-1" />
                News
              </button>
              
              {isNewsMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50">
                  {newsItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      onClick={() => setIsNewsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                className="flex items-center text-secondary-700 hover:text-primary-600 font-medium transition-colors"
              >
                <Wrench className="h-4 w-4 mr-1" />
                Tools
              </button>
              
              {isToolsMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50">
                  {toolsItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      onClick={() => setIsToolsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Dashboard Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDashboardMenuOpen(!isDashboardMenuOpen)}
                className="flex items-center text-secondary-700 hover:text-primary-600 font-medium transition-colors"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Dashboard
              </button>
              
              {isDashboardMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50">
                  {dashboardItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      onClick={() => setIsDashboardMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Regular Navigation Items */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-secondary-700 hover:text-primary-600 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-secondary-700 hover:text-primary-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Account</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/signup')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-secondary-700 hover:bg-secondary-100"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200">
            <nav className="flex flex-col space-y-4">
              {/* News Section */}
              <div>
                <div className="font-medium text-secondary-900 mb-2 flex items-center">
                  <Newspaper className="h-4 w-4 mr-2" />
                  News
                </div>
                <div className="ml-6 space-y-2">
                  {newsItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block text-secondary-700 hover:text-primary-600 transition-colors text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Tools Section */}
              <div>
                <div className="font-medium text-secondary-900 mb-2 flex items-center">
                  <Wrench className="h-4 w-4 mr-2" />
                  Tools
                </div>
                <div className="ml-6 space-y-2">
                  {toolsItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block text-secondary-700 hover:text-primary-600 transition-colors text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Dashboard Section */}
              <div>
                <div className="font-medium text-secondary-900 mb-2 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </div>
                <div className="ml-6 space-y-2">
                  {dashboardItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block text-secondary-700 hover:text-primary-600 transition-colors text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Regular Navigation */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-secondary-700 hover:text-primary-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-secondary-200">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      className="block text-secondary-700 hover:text-primary-600 font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block text-secondary-700 hover:text-primary-600 font-medium transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/login')
                        setIsMenuOpen(false)
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => {
                        navigate('/signup')
                        setIsMenuOpen(false)
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}