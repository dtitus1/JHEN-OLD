import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Rankings } from './pages/Rankings'
import { Stats } from './pages/Stats'
import { Videos } from './pages/Videos'
import { Articles } from './pages/Articles'
import { Admin } from './pages/Admin'
import { StartSit } from './pages/StartSit'
import { Dashboard } from './pages/Dashboard'
import { TierRankings } from './pages/TierRankings'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/tools" element={<StartSit />} />
              <Route path="/start-sit" element={<StartSit />} />
              <Route path="/tier-rankings" element={<TierRankings />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/draft-guides" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold">Draft Guides - Coming Soon</h1></div>} />
              <Route path="/pricing" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold">Pricing - Coming Soon</h1></div>} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App