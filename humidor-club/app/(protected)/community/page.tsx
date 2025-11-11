'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Send, 
  X, 
  Upload, 
  Heart,
  MoreVertical,
  Trash2,
  Edit,
  Package,
  Cigarette
} from 'lucide-react';
// Date formatting helper
const formatTimeAgo = (date: string) => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
};

interface Post {
  id: string;
  content: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  like_count: number;
  comment_count: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  cigar?: {
    id: string;
    vitola: string;
    line?: {
      name: string;
      brand?: {
        name: string;
      };
    };
  } | null;
  humidorItem?: {
    id: string;
    quantity: number;
    cigar?: {
      id: string;
      vitola: string;
      line?: {
        name: string;
        brand?: {
          name: string;
        };
      };
    };
  } | null;
}

interface Comment {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface HumidorItem {
  id: string;
  quantity: number;
  cigar?: {
    id: string;
    vitola: string;
    line?: {
      name: string;
      brand?: {
        name: string;
      };
    };
  };
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Post creation
  const [showPostForm, setShowPostForm] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedHumidorItem, setSelectedHumidorItem] = useState<string | null>(null);
  const [humidorItems, setHumidorItems] = useState<HumidorItem[]>([]);
  const [showHumidorSelector, setShowHumidorSelector] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Comments
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [commentImages, setCommentImages] = useState<Record<string, string | null>>({});
  const [postingComments, setPostingComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const commentFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetchPosts();
    fetchHumidorItems();
  }, []);

  const fetchPosts = async (cursor?: string | null) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      params.append('limit', '20');
      if (cursor) {
        params.append('cursor', cursor);
      }

      const response = await fetch(`/api/posts?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        if (cursor) {
          setPosts(prev => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }
        setNextCursor(data.nextCursor);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchHumidorItems = async () => {
    try {
      const response = await fetch('/api/humidor');
      const data = await response.json();
      
      if (data.success) {
        setHumidorItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching humidor items:', error);
    }
  };

  const fetchComments = async (postId: string) => {
    if (comments[postId]) return; // Already loaded

    setLoadingComments(prev => new Set(prev).add(postId));
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      const data = await response.json();

      if (data.success) {
        setComments(prev => ({
          ...prev,
          [postId]: data.comments,
        }));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const handleImageUpload = async (files: FileList, isComment: boolean = false, commentPostId?: string) => {
    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          uploadedUrls.push(data.url);
        } else {
          console.error('Failed to upload image:', data.error);
          alert(`Failed to upload ${file.name}: ${data.error}`);
        }
      }

      if (isComment && commentPostId) {
        setCommentImages(prev => ({
          ...prev,
          [commentPostId]: uploadedUrls[0] || null,
        }));
      } else {
        setPostImages(prev => [...prev, ...uploadedUrls]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && postImages.length === 0) {
      alert('Please add some content or images to your post');
      return;
    }

    setCreatingPost(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent.trim(),
          image_urls: postImages,
          humidor_item_id: selectedHumidorItem || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setPostContent('');
        setPostImages([]);
        setSelectedHumidorItem(null);
        setShowPostForm(false);
        // Refresh posts
        fetchPosts();
      } else {
        alert(data.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setCreatingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        alert(data.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const toggleComments = (postId: string) => {
    const isExpanded = expandedComments.has(postId);
    if (isExpanded) {
      setExpandedComments(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    } else {
      setExpandedComments(prev => new Set(prev).add(postId));
      fetchComments(postId);
    }
  };

  const handlePostComment = async (postId: string) => {
    const commentText = commentTexts[postId]?.trim() || '';
    const commentImage = commentImages[postId];

    if (!commentText && !commentImage) {
      alert('Please add a comment');
      return;
    }

    setPostingComments(prev => new Set(prev).add(postId));
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText,
          image_url: commentImage || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear comment form
        setCommentTexts(prev => {
          const next = { ...prev };
          delete next[postId];
          return next;
        });
        setCommentImages(prev => {
          const next = { ...prev };
          delete next[postId];
          return next;
        });
        // Refresh comments
        fetchComments(postId);
        // Update post comment count
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, comment_count: p.comment_count + 1 }
            : p
        ));
      } else {
        alert(data.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setPostingComments(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).filter(c => c.id !== commentId),
        }));
        // Update post comment count
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, comment_count: Math.max(0, p.comment_count - 1) }
            : p
        ));
      } else {
        alert(data.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const getCigarName = (cigar: Post['cigar']) => {
    if (!cigar) return null;
    const brandName = cigar.line?.brand?.name || '';
    const lineName = cigar.line?.name || '';
    const vitola = cigar.vitola || '';
    return `${brandName} ${lineName} - ${vitola}`.trim();
  };

  const selectedHumidorItemData = humidorItems.find(item => item.id === selectedHumidorItem);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground mt-2">
            Share your collection, experiences, and connect with fellow enthusiasts
          </p>
        </div>
        <button
          onClick={() => setShowPostForm(!showPostForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="hidden sm:inline">New Post</span>
        </button>
      </div>

      {/* Post Creation Form */}
      {showPostForm && (
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Create Post</h2>
            <button
              onClick={() => {
                setShowPostForm(false);
                setPostContent('');
                setPostImages([]);
                setSelectedHumidorItem(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />

          {/* Share Humidor Item */}
          <div className="space-y-2">
            <button
              onClick={() => setShowHumidorSelector(!showHumidorSelector)}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Package className="h-4 w-4" />
              {selectedHumidorItem ? 'Change humidor item' : 'Share from humidor'}
            </button>

            {showHumidorSelector && (
              <div className="border rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
                {humidorItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items in your humidor</p>
                ) : (
                  humidorItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedHumidorItem(item.id);
                        setShowHumidorSelector(false);
                      }}
                      className={`w-full text-left p-2 rounded hover:bg-muted transition-colors ${
                        selectedHumidorItem === item.id ? 'bg-primary/10 border border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {getCigarName(item.cigar) || 'Unknown Cigar'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        {selectedHumidorItem === item.id && (
                          <Cigarette className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {selectedHumidorItemData && (
              <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                <Cigarette className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  Sharing: {getCigarName(selectedHumidorItemData.cigar)} (Qty: {selectedHumidorItemData.quantity})
                </span>
                <button
                  onClick={() => setSelectedHumidorItem(null)}
                  className="ml-auto text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Image Preview */}
          {postImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {postImages.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                  <Image src={url} alt={`Post image ${index + 1}`} fill className="object-cover" />
                  <button
                    onClick={() => setPostImages(prev => prev.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/75 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Image Upload */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted cursor-pointer transition-colors">
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm">Add Photos</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    handleImageUpload(e.target.files);
                  }
                  e.target.value = '';
                }}
                className="hidden"
                disabled={uploadingImages}
              />
            </label>
            {uploadingImages && (
              <span className="text-sm text-muted-foreground">Uploading...</span>
            )}
          </div>

          <button
            onClick={handleCreatePost}
            disabled={creatingPost || (!postContent.trim() && postImages.length === 0)}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {creatingPost ? 'Posting...' : 'Post'}
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Posts Feed */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-xl">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
          <p className="text-muted-foreground">
            Be the first to share something with the community!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-card border rounded-xl p-6 space-y-4">
              {/* Post Header */}
              <div className="flex items-start justify-between">
                <Link
                  href={`/people?userId=${post.user.id}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  {post.user.image ? (
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20">
                      <Image
                        src={post.user.image}
                        alt={post.user.name || 'User'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <span className="text-primary font-semibold">
                        {(post.user.name || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{post.user.name || 'Member'}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeAgo(post.created_at)}
                    </p>
                  </div>
                </Link>

                {session?.user?.id === post.user.id && (
                  <div className="relative">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    <div className="absolute right-0 mt-2 bg-background border rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2 text-sm text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cigar/Humidor Item Reference */}
              {(post.cigar || post.humidorItem) && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                  <Cigarette className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    {post.humidorItem ? (
                      <Link
                        href={`/humidor`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {getCigarName(post.humidorItem.cigar) || 'Unknown Cigar'} (Qty: {post.humidorItem.quantity})
                      </Link>
                    ) : post.cigar ? (
                      <Link
                        href={`/cigars/${post.cigar.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {getCigarName(post.cigar)}
                      </Link>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Post Content */}
              {post.content && (
                <p className="whitespace-pre-wrap">{post.content}</p>
              )}

              {/* Post Images */}
              {post.image_urls && post.image_urls.length > 0 && (
                <div className={`grid gap-2 ${
                  post.image_urls.length === 1 ? 'grid-cols-1' :
                  post.image_urls.length === 2 ? 'grid-cols-2' :
                  'grid-cols-3'
                }`}>
                  {post.image_urls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                      <Image
                        src={url}
                        alt={`Post image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center gap-4 pt-2 border-t">
                <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Heart className="h-5 w-5" />
                  <span className="text-sm">{post.like_count}</span>
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm">{post.comment_count}</span>
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments.has(post.id) && (
                <div className="pt-4 border-t space-y-4">
                  {/* Comments List */}
                  {loadingComments.has(post.id) ? (
                    <p className="text-sm text-muted-foreground">Loading comments...</p>
                  ) : (
                    <div className="space-y-3">
                      {(comments[post.id] || []).map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3">
                          <Link
                            href={`/people?userId=${comment.user.id}`}
                            className="flex-shrink-0"
                          >
                            {comment.user.image ? (
                              <div className="relative h-8 w-8 rounded-full overflow-hidden border border-primary/20">
                                <Image
                                  src={comment.user.image}
                                  alt={comment.user.name || 'User'}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="text-xs text-primary font-semibold">
                                  {(comment.user.name || 'U')[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <Link
                                  href={`/people?userId=${comment.user.id}`}
                                  className="font-semibold text-sm hover:underline"
                                >
                                  {comment.user.name || 'Member'}
                                </Link>
                                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                {comment.image_url && (
                                  <div className="relative w-32 h-32 mt-2 rounded-lg overflow-hidden border bg-muted">
                                    <Image
                                      src={comment.image_url}
                                      alt="Comment image"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatTimeAgo(comment.created_at)}
                                </p>
                              </div>
                              {session?.user?.id === comment.user.id && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id, post.id)}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Form */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <textarea
                        value={commentTexts[post.id] || ''}
                        onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Write a comment..."
                        rows={2}
                        className="flex-1 p-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                      />
                      <div className="flex flex-col gap-2">
                        <label className="p-2 border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                          <ImageIcon className="h-4 w-4" />
                          <input
                            ref={(el) => {
                              commentFileInputRefs.current[post.id] = el;
                            }}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files) {
                                handleImageUpload(e.target.files, true, post.id);
                              }
                              e.target.value = '';
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={() => handlePostComment(post.id)}
                          disabled={postingComments.has(post.id)}
                          className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {commentImages[post.id] && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border bg-muted">
                        <Image
                          src={commentImages[post.id]!}
                          alt="Comment preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => setCommentImages(prev => {
                            const next = { ...prev };
                            delete next[post.id];
                            return next;
                          })}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/75"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Load More */}
          {nextCursor && (
            <div className="text-center">
              <button
                onClick={() => fetchPosts(nextCursor)}
                disabled={loadingMore}
                className="px-6 py-2 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

