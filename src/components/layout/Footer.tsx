import React from 'react'
import { Link } from 'react-router-dom'
import { Twitter, Instagram, Youtube, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img src="/3.png" alt="JHEN Fantasy" className="h-12 w-auto" />
            </Link>
            <p className="text-secondary-300 mb-4 max-w-md">
              Your ultimate destination for fantasy football analysis, rankings, and tools. 
              Dominate your leagues with expert insights and data-driven strategies.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary-400 hover:text-primary-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-400 hover:text-primary-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-400 hover:text-primary-500 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-400 hover:text-primary-500 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/draft-guides" className="text-secondary-300 hover:text-primary-500 transition-colors">Draft Guides</Link></li>
              <li><Link to="/rankings" className="text-secondary-300 hover:text-primary-500 transition-colors">Rankings</Link></li>
              <li><Link to="/tier-rankings" className="text-secondary-300 hover:text-primary-500 transition-colors">Tier Rankings</Link></li>
              <li><Link to="/start-sit" className="text-secondary-300 hover:text-primary-500 transition-colors">Start/Sit Tool</Link></li>
              <li><Link to="/stats" className="text-secondary-300 hover:text-primary-500 transition-colors">Stats</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/articles" className="text-secondary-300 hover:text-primary-500 transition-colors">Articles</Link></li>
              <li><Link to="/videos" className="text-secondary-300 hover:text-primary-500 transition-colors">Videos</Link></li>
              <li><Link to="/pricing" className="text-secondary-300 hover:text-primary-500 transition-colors">Pricing</Link></li>
              <li><Link to="/contact" className="text-secondary-300 hover:text-primary-500 transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="text-secondary-300 hover:text-primary-500 transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-800 mt-8 pt-8 text-center">
          <p className="text-secondary-400">
            © {currentYear} JHEN Fantasy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}