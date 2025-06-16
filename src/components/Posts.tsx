import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Plus, Heart, MessageCircle, Share, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  videoUrl?: string;
  timestamp: string;
  likes: number;
  comments: number;
}

export const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newPost, setNewPost] = useState({
    content: '',
    imageUrl: '',
    linkUrl: '',
    videoUrl: ''
  });

  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    // Load posts from localStorage
    const savedPosts = localStorage.getItem('posts') || '[]';
    setPosts(JSON.parse(savedPosts));
  }, []);

  const handleCreatePost = () => {
    if (!currentUser) return;
    
    if (!newPost.content.trim() && !newPost.imageUrl && !newPost.linkUrl && !newPost.videoUrl) {
      toast.error('Please add some content to your post');
      return;
    }

    const post: Post = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      content: newPost.content,
      imageUrl: newPost.imageUrl || undefined,
      linkUrl: newPost.linkUrl || undefined,
      videoUrl: newPost.videoUrl || undefined,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0
    };

    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));

    // Reset form
    setNewPost({
      content: '',
      imageUrl: '',
      linkUrl: '',
      videoUrl: ''
    });

    toast.success('Post created successfully!');
  };

  const handleLike = (postId: string) => {
    const updatedPosts = posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    );
    setPosts(updatedPosts);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isVideoUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.endsWith('.mp4') || url.endsWith('.webm');
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <Tabs defaultValue="home" className="space-y-6">
      <TabsList className="bg-gray-800 border-green-500/20">
        <TabsTrigger value="home" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
          <Home className="h-4 w-4 mr-2" />
          Home
        </TabsTrigger>
        <TabsTrigger value="create" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
          <Plus className="h-4 w-4 mr-2" />
          Create
        </TabsTrigger>
      </TabsList>

      <TabsContent value="home" className="space-y-6">
        {posts.length === 0 ? (
          <Card className="bg-gray-800 border-green-500/20">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">No posts yet. Be the first to create one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="bg-gray-800 border-green-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{post.userName}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(post.timestamp).toLocaleDateString()} at {new Date(post.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {post.content && (
                    <p className="text-white">{post.content}</p>
                  )}
                  
                  {post.imageUrl && isValidUrl(post.imageUrl) && (
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        alt="Post image" 
                        className="w-full max-h-96 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {post.videoUrl && isValidUrl(post.videoUrl) && (
                    <div className="rounded-lg overflow-hidden">
                      {isVideoUrl(post.videoUrl) ? (
                        <iframe
                          src={getEmbedUrl(post.videoUrl)}
                          className="w-full h-64"
                          frameBorder="0"
                          allowFullScreen
                        />
                      ) : (
                        <video controls className="w-full max-h-96">
                          <source src={post.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  )}
                  
                  {post.linkUrl && isValidUrl(post.linkUrl) && (
                    <Card className="bg-gray-700 border-green-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-400 font-medium">External Link</p>
                            <p className="text-gray-300 text-sm truncate">{post.linkUrl}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(post.linkUrl, '_blank')}
                            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {post.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-blue-400"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {post.comments}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-green-400"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="create">
        <Card className="bg-gray-800 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-400">Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                Content
              </label>
              <Textarea
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="bg-gray-700 border-green-500/30 text-white placeholder:text-gray-400"
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                Image URL (optional)
              </label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={newPost.imageUrl}
                onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                className="bg-gray-700 border-green-500/30 text-white placeholder:text-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                Video URL (optional)
              </label>
              <Input
                placeholder="https://youtube.com/watch?v=... or direct video URL"
                value={newPost.videoUrl}
                onChange={(e) => setNewPost({ ...newPost, videoUrl: e.target.value })}
                className="bg-gray-700 border-green-500/30 text-white placeholder:text-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                Link URL (optional)
              </label>
              <Input
                placeholder="https://example.com"
                value={newPost.linkUrl}
                onChange={(e) => setNewPost({ ...newPost, linkUrl: e.target.value })}
                className="bg-gray-700 border-green-500/30 text-white placeholder:text-gray-400"
              />
            </div>
            
            <Button
              onClick={handleCreatePost}
              className="w-full bg-green-500 text-black hover:bg-green-400"
            >
              Create Post
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};