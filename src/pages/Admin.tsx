import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Target, BarChart3, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image?: string
  is_premium: boolean
  is_featured: boolean
  published: boolean
  published_at?: string
  read_time: number
  view_count: number
  category_id?: string
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
}

interface StartSitNote {
  id: string
  player_id: string
  week: number
  season: number
  custom_note?: string
  recommendation_override?: 'start' | 'sit' | 'flex'
  confidence_override?: 'high' | 'medium' | 'low'
  projection_override?: number
  matchup_rating_override?: 'excellent' | 'good' | 'average' | 'poor' | 'terrible'
  risk_level_override?: 'low' | 'medium' | 'high'
  reasoning_override?: string[]
  created_at: string
  updated_at: string
}

export function Admin() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'articles' | 'start-sit'>('articles')
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [startSitNotes, setStartSitNotes] = useState<StartSitNote[]>([])
  const [loading, setLoading] = useState(true)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [editingNote, setEditingNote] = useState<StartSitNote | null>(null)
  const [showNewArticleForm, setShowNewArticleForm] = useState(false)
  const [showNewNoteForm, setShowNewNoteForm] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, activeTab])

  const loadData = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      if (activeTab === 'articles') {
        // Load articles
        const { data: articlesData, error: articlesError } = await supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false })

        if (articlesError) throw articlesError
        setArticles(articlesData || [])

        // Load categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (categoriesError) throw categoriesError
        setCategories(categoriesData || [])
      } else if (activeTab === 'start-sit') {
        // Load start/sit notes
        const { data: notesData, error: notesError } = await supabase
          .from('start_sit_notes')
          .select('*')
          .order('created_at', { ascending: false })

        if (notesError) throw notesError
        setStartSitNotes(notesData || [])
      }

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveArticle = async (articleData: Partial<Article>) => {
    if (!supabase) {
      toast.error('Database not available')
      return
    }

    try {
      if (editingArticle) {
        // Update existing article
        const { error } = await supabase
          .from('articles')
          .update({
            ...articleData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingArticle.id)

        if (error) throw error
        toast.success('Article updated successfully')
      } else {
        // Create new article
        const { error } = await supabase
          .from('articles')
          .insert([{
            ...articleData,
            author_id: user?.id,
            slug: articleData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '',
          }])

        if (error) throw error
        toast.success('Article created successfully')
      }

      setEditingArticle(null)
      setShowNewArticleForm(false)
      loadData()
    } catch (error) {
      console.error('Error saving article:', error)
      toast.error('Failed to save article')
    }
  }

  const handleSaveStartSitNote = async (noteData: Partial<StartSitNote>) => {
    if (!supabase) {
      toast.error('Database not available')
      return
    }

    try {
      if (editingNote) {
        // Update existing note
        const { error } = await supabase
          .from('start_sit_notes')
          .update({
            ...noteData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingNote.id)

        if (error) throw error
        toast.success('Start/Sit note updated successfully')
      } else {
        // Create new note
        const { error } = await supabase
          .from('start_sit_notes')
          .insert([{
            ...noteData,
            created_by: user?.id,
          }])

        if (error) throw error
        toast.success('Start/Sit note created successfully')
      }

      setEditingNote(null)
      setShowNewNoteForm(false)
      loadData()
    } catch (error) {
      console.error('Error saving start/sit note:', error)
      toast.error('Failed to save start/sit note')
    }
  }

  const handleDeleteArticle = async (id: string) => {
    if (!supabase) {
      toast.error('Database not available')
      return
    }

    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Article deleted successfully')
      loadData()
    } catch (error) {
      console.error('Error deleting article:', error)
      toast.error('Failed to delete article')
    }
  }

  const handleDeleteStartSitNote = async (id: string) => {
    if (!supabase) {
      toast.error('Database not available')
      return
    }

    if (!confirm('Are you sure you want to delete this start/sit note?')) return

    try {
      const { error } = await supabase
        .from('start_sit_notes')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Start/Sit note deleted successfully')
      loadData()
    } catch (error) {
      console.error('Error deleting start/sit note:', error)
      toast.error('Failed to delete start/sit note')
    }
  }

  const handleTogglePublished = async (article: Article) => {
    if (!supabase) {
      toast.error('Database not available')
      return
    }

    try {
      const { error } = await supabase
        .from('articles')
        .update({
          published: !article.published,
          published_at: !article.published ? new Date().toISOString() : null
        })
        .eq('id', article.id)

      if (error) throw error
      toast.success(`Article ${!article.published ? 'published' : 'unpublished'} successfully`)
      loadData()
    } catch (error) {
      console.error('Error toggling published status:', error)
      toast.error('Failed to update article status')
    }
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">
              Database Not Connected
            </h2>
            <p className="text-secondary-600 mb-4">
              Please connect to Supabase to access the admin panel.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-display text-secondary-900 mb-2">
                Content Management
              </h1>
              <p className="text-secondary-600">
                Manage articles, videos, and start/sit recommendations for JHEN Fantasy
              </p>
            </div>
            <Button 
              onClick={() => activeTab === 'articles' ? setShowNewArticleForm(true) : setShowNewNoteForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === 'articles' ? 'New Article' : 'New Start/Sit Note'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-secondary-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'articles'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Articles
                </div>
              </button>
              <button
                onClick={() => setActiveTab('start-sit')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'start-sit'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Start/Sit Tool
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'articles' ? (
          /* Articles Table */
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Articles</h2>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-secondary-600">Loading articles...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary-50 border-b border-secondary-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {articles.map((article) => (
                        <tr key={article.id} className="hover:bg-secondary-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-secondary-900">{article.title}</div>
                              <div className="text-sm text-secondary-500">{article.excerpt}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              article.published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {article.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-1">
                              {article.is_premium && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800">
                                  Premium
                                </span>
                              )}
                              {article.is_featured && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  Featured
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-secondary-900">
                            {article.view_count.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-secondary-500">
                            {new Date(article.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingArticle(article)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTogglePublished(article)}
                              >
                                {article.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteArticle(article.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Start/Sit Notes Table */
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Start/Sit Tool Management</h2>
              <p className="text-sm text-secondary-600">
                Manage custom notes, recommendations, and projections for the Start/Sit tool
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-secondary-600">Loading start/sit notes...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary-50 border-b border-secondary-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Player
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Week/Season
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Recommendation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Projection
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Custom Note
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {startSitNotes.map((note) => (
                        <tr key={note.id} className="hover:bg-secondary-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-secondary-900">{note.player_id}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-secondary-900">
                            Week {note.week}, {note.season}
                          </td>
                          <td className="px-6 py-4">
                            {note.recommendation_override && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                note.recommendation_override === 'start' ? 'bg-green-100 text-green-800' :
                                note.recommendation_override === 'sit' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {note.recommendation_override}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-secondary-900">
                            {note.projection_override || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-secondary-600 max-w-xs truncate">
                            {note.custom_note || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingNote(note)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteStartSitNote(note.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Article Form Modal */}
        {(editingArticle || showNewArticleForm) && (
          <ArticleForm
            article={editingArticle}
            categories={categories}
            onSave={handleSaveArticle}
            onCancel={() => {
              setEditingArticle(null)
              setShowNewArticleForm(false)
            }}
          />
        )}

        {/* Start/Sit Note Form Modal */}
        {(editingNote || showNewNoteForm) && (
          <StartSitNoteForm
            note={editingNote}
            onSave={handleSaveStartSitNote}
            onCancel={() => {
              setEditingNote(null)
              setShowNewNoteForm(false)
            }}
          />
        )}
      </div>
    </div>
  )
}

interface ArticleFormProps {
  article: Article | null
  categories: Category[]
  onSave: (article: Partial<Article>) => void
  onCancel: () => void
}

function ArticleForm({ article, categories, onSave, onCancel }: ArticleFormProps) {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    featured_image: article?.featured_image || '',
    is_premium: article?.is_premium || false,
    is_featured: article?.is_featured || false,
    published: article?.published || false,
    category_id: article?.category_id || '',
    read_time: article?.read_time || 5,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              {article ? 'Edit Article' : 'New Article'}
            </h3>
            <Button variant="ghost" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>

            <Input
              label="Featured Image URL"
              value={formData.featured_image}
              onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Read Time (minutes)"
                type="number"
                value={formData.read_time}
                onChange={(e) => setFormData({ ...formData, read_time: parseInt(e.target.value) || 5 })}
                min="1"
                max="60"
              />
            </div>

            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_premium}
                  onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">Premium Content</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">Featured Article</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">Publish Now</span>
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {article ? 'Update Article' : 'Create Article'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

interface StartSitNoteFormProps {
  note: StartSitNote | null
  onSave: (note: Partial<StartSitNote>) => void
  onCancel: () => void
}

function StartSitNoteForm({ note, onSave, onCancel }: StartSitNoteFormProps) {
  const [formData, setFormData] = useState({
    player_id: note?.player_id || '',
    week: note?.week || new Date().getWeek(),
    season: note?.season || new Date().getFullYear(),
    custom_note: note?.custom_note || '',
    recommendation_override: note?.recommendation_override || '',
    confidence_override: note?.confidence_override || '',
    projection_override: note?.projection_override || '',
    matchup_rating_override: note?.matchup_rating_override || '',
    risk_level_override: note?.risk_level_override || '',
    reasoning_override: note?.reasoning_override?.join('\n') || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      projection_override: formData.projection_override ? parseFloat(formData.projection_override.toString()) : null,
      reasoning_override: formData.reasoning_override ? formData.reasoning_override.split('\n').filter(r => r.trim()) : null,
      recommendation_override: formData.recommendation_override || null,
      confidence_override: formData.confidence_override || null,
      matchup_rating_override: formData.matchup_rating_override || null,
      risk_level_override: formData.risk_level_override || null,
    }
    
    onSave(submitData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              {note ? 'Edit Start/Sit Note' : 'New Start/Sit Note'}
            </h3>
            <Button variant="ghost" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Player ID"
                value={formData.player_id}
                onChange={(e) => setFormData({ ...formData, player_id: e.target.value })}
                placeholder="e.g., josh_allen"
                required
              />
              <Input
                label="Week"
                type="number"
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) || 1 })}
                min="1"
                max="18"
                required
              />
              <Input
                label="Season"
                type="number"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: parseInt(e.target.value) || new Date().getFullYear() })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Custom Note
              </label>
              <textarea
                value={formData.custom_note}
                onChange={(e) => setFormData({ ...formData, custom_note: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="Custom analysis note for this player..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Recommendation Override
                </label>
                <select
                  value={formData.recommendation_override}
                  onChange={(e) => setFormData({ ...formData, recommendation_override: e.target.value })}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">No Override</option>
                  <option value="start">Start</option>
                  <option value="sit">Sit</option>
                  <option value="flex">Flex</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Confidence Override
                </label>
                <select
                  value={formData.confidence_override}
                  onChange={(e) => setFormData({ ...formData, confidence_override: e.target.value })}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">No Override</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Projection Override"
                type="number"
                step="0.1"
                value={formData.projection_override}
                onChange={(e) => setFormData({ ...formData, projection_override: e.target.value })}
                placeholder="e.g., 18.5"
              />

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Matchup Rating Override
                </label>
                <select
                  value={formData.matchup_rating_override}
                  onChange={(e) => setFormData({ ...formData, matchup_rating_override: e.target.value })}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">No Override</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="poor">Poor</option>
                  <option value="terrible">Terrible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Risk Level Override
                </label>
                <select
                  value={formData.risk_level_override}
                  onChange={(e) => setFormData({ ...formData, risk_level_override: e.target.value })}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">No Override</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Custom Reasoning (one per line)
              </label>
              <textarea
                value={formData.reasoning_override}
                onChange={(e) => setFormData({ ...formData, reasoning_override: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="Elite matchup against weak secondary&#10;Volume king with TD upside&#10;Favorable game script expected"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {note ? 'Update Note' : 'Create Note'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper to get current week number
declare global {
  interface Date {
    getWeek(): number
  }
}

Date.prototype.getWeek = function() {
  const onejan = new Date(this.getFullYear(), 0, 1)
  const today = new Date(this.getFullYear(), this.getMonth(), this.getDate())
  const dayOfYear = ((today.getTime() - onejan.getTime() + 86400000) / 86400000)
  return Math.ceil(dayOfYear / 7)
}