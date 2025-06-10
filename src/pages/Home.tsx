import React from 'react'
import { Hero } from '../components/home/Hero'
import { Features } from '../components/home/Features'
import { ContentPreview } from '../components/home/ContentPreview'
import { Pricing } from '../components/home/Pricing'

export function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <ContentPreview />
      <Pricing />
    </div>
  )
}