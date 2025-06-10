import React from 'react'
import { Check, Star } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { useNavigate } from 'react-router-dom'

export function Pricing() {
  const navigate = useNavigate()

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for casual fantasy players',
      features: [
        'Basic weekly rankings',
        'Limited article access',
        'Community forum access',
        'Email newsletter',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Premium',
      price: '$19',
      period: 'per month',
      description: 'For serious fantasy managers',
      features: [
        'Advanced rankings & projections',
        'Start/Sit recommendations',
        'All premium articles',
        'Video analysis library',
        'Draft guide access',
        'Priority support',
        'Discord community',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Elite',
      price: '$39',
      period: 'per month',
      description: 'Maximum competitive advantage',
      features: [
        'Everything in Premium',
        'Custom player projections',
        'Advanced analytics tools',
        'One-on-one strategy calls',
        'Early access to content',
        'Exclusive Discord channels',
        'Season-long support',
      ],
      cta: 'Go Elite',
      popular: false,
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold font-display text-secondary-900 mb-4">
            Choose Your Winning Plan
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Start free and upgrade anytime. All plans include our core features 
            with increasing levels of analysis and support.
          </p>
        </div>

        {/* Updated grid with better spacing and responsive handling */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className="relative flex">
              {/* Popular badge positioned absolutely to avoid layout issues */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-lg">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <Card 
                className={`w-full flex flex-col ${
                  plan.popular 
                    ? 'ring-2 ring-primary-500 shadow-2xl lg:scale-105 lg:z-10' 
                    : 'shadow-lg hover:shadow-xl'
                } transition-all duration-300`}
              >
                <CardHeader className="text-center pb-4 pt-8">
                  <h3 className="text-2xl font-bold text-secondary-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-secondary-900">{plan.price}</span>
                    <span className="text-secondary-600">/{plan.period}</span>
                  </div>
                  <p className="text-secondary-600 mt-3">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="pt-0 flex-1 flex flex-col">
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-secondary-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className="w-full mt-auto"
                    variant={plan.popular ? 'primary' : 'outline'}
                    size="lg"
                    onClick={() => navigate('/signup')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-secondary-600">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  )
}