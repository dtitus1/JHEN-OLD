import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { uploadArticleImage, uploadVideo, uploadVideoThumbnail } from '../lib/supabaseStorage';
import { FileUpload } from '../components/ui/FileUpload';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

interface Article {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image: string;
  published: boolean;
  created_at?: string;
}

interface Video {
  id?: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  published: boolean;
  created_at?: string;
}

export function Admin() {
  const [activeTab, setActiveTab] = useState<'articles' | 'videos'>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadArticles();
    loadVideos();
  }, []);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const ArticleForm = () => {
    const [formData, setFormData] = useState<Article>(
      editingArticle || {
        title: '',
        content: '',
        excerpt: '',
        featured_image: '',
        published: false
      }
    );
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleSaveArticle = async () => {
      try {
        setUploading(true);
        let imageUrl = formData.featured_image;

        if (imageFile) {
          imageUrl = await uploadArticleImage(imageFile);
        }

        const articleData = {
          ...formData,
          featured_image: imageUrl
        };

        if (editingArticle?.id) {
          const { error } = await supabase
            .from('articles')
            .update(articleData)
            .eq('id', editingArticle.id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('articles')
            .insert([articleData]);
          
          if (error) throw error;
        }

        await loadArticles();
        setShowArticleForm(false);
        setEditingArticle(null);
        setImageFile(null);
      } catch (error) {
        console.error('Error saving article:', error);
        alert('Error saving article. Please try again.');
      } finally {
        setUploading(false);
      }
    };

    return (
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">
          {editingArticle ? 'Edit Article' : 'New Article'}
        </h3>
        
        <div className="space-y-4">
          <Input
            placeholder="Article Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          
          <textarea
            className="w-full p-3 border rounded-lg resize-vertical min-h-[100px]"
            placeholder="Article Excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          />
          
          <textarea
            className="w-full p-3 border rounded-lg resize-vertical min-h-[200px]"
            placeholder="Article Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
          
          <div>
            <label className="block text-sm font-medium mb-2">Featured Image</label>
            <FileUpload
              accept="image/*"
              onFileSelect={setImageFile}
              currentUrl={formData.featured_image}
              maxSize={5 * 1024 * 1024} // 5MB
            />
          </div>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            />
            <span>Published</span>
          </label>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleSaveArticle} 
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? 'Saving...' : 'Save Article'}
            </Button>
            <Button 
              onClick={() => {
                setShowArticleForm(false);
                setEditingArticle(null);
                setImageFile(null);
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const VideoForm = () => {
    const [formData, setFormData] = useState<Video>(
      editingVideo || {
        title: '',
        description: '',
        video_url: '',
        thumbnail_url: '',
        duration: 0,
        published: false
      }
    );
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [videoType, setVideoType] = useState<'youtube' | 'upload'>('youtube');
    const [uploading, setUploading] = useState(false);

    const handleSaveVideo = async () => {
      try {
        setUploading(true);
        let videoUrl = formData.video_url;
        let thumbnailUrl = formData.thumbnail_url;

        if (videoType === 'upload' && videoFile) {
          videoUrl = await uploadVideo(videoFile);
        }

        if (thumbnailFile) {
          thumbnailUrl = await uploadVideoThumbnail(thumbnailFile);
        }

        const videoData = {
          ...formData,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl
        };

        if (editingVideo?.id) {
          const { error } = await supabase
            .from('videos')
            .update(videoData)
            .eq('id', editingVideo.id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('videos')
            .insert([videoData]);
          
          if (error) throw error;
        }

        await loadVideos();
        setShowVideoForm(false);
        setEditingVideo(null);
        setVideoFile(null);
        setThumbnailFile(null);
      } catch (error) {
        console.error('Error saving video:', error);
        alert('Error saving video. Please try again.');
      } finally {
        setUploading(false);
      }
    };

    return (
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">
          {editingVideo ? 'Edit Video' : 'New Video'}
        </h3>
        
        <div className="space-y-4">
          <Input
            placeholder="Video Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          
          <textarea
            className="w-full p-3 border rounded-lg resize-vertical min-h-[100px]"
            placeholder="Video Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          
          <div>
            <label className="block text-sm font-medium mb-2">Video Type</label>
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="youtube"
                  checked={videoType === 'youtube'}
                  onChange={(e) => setVideoType(e.target.value as 'youtube' | 'upload')}
                />
                <span>YouTube URL</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="upload"
                  checked={videoType === 'upload'}
                  onChange={(e) => setVideoType(e.target.value as 'youtube' | 'upload')}
                />
                <span>Upload Video File</span>
              </label>
            </div>
            
            {videoType === 'youtube' ? (
              <Input
                placeholder="YouTube Video URL"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              />
            ) : (
              <FileUpload
                accept="video/*"
                onFileSelect={setVideoFile}
                currentUrl={formData.video_url}
                maxSize={100 * 1024 * 1024} // 100MB
              />
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Video Thumbnail</label>
            <FileUpload
              accept="image/*"
              onFileSelect={setThumbnailFile}
              currentUrl={formData.thumbnail_url}
              maxSize={2 * 1024 * 1024} // 2MB
            />
          </div>
          
          <Input
            type="number"
            placeholder="Duration (seconds)"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
          />
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            />
            <span>Published</span>
          </label>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleSaveVideo} 
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? 'Saving...' : 'Save Video'}
            </Button>
            <Button 
              onClick={() => {
                setShowVideoForm(false);
                setEditingVideo(null);
                setVideoFile(null);
                setThumbnailFile(null);
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'articles'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Articles
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'videos'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Videos
          </button>
        </div>

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Articles</h2>
              <Button
                onClick={() => setShowArticleForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                New Article
              </Button>
            </div>

            {showArticleForm && <ArticleForm />}

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {articles.map((article) => (
                      <tr key={article.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {article.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            article.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {article.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {article.created_at ? new Date(article.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setEditingArticle(article);
                              setShowArticleForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteArticle(article.id!)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Videos</h2>
              <Button
                onClick={() => setShowVideoForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                New Video
              </Button>
            </div>

            {showVideoForm && <VideoForm />}

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {videos.map((video) => (
                      <tr key={video.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {video.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            video.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {video.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {video.created_at ? new Date(video.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setEditingVideo(video);
                              setShowVideoForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteVideo(video.id!)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}