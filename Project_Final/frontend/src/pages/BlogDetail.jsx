import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './BlogDetail.css';

export const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await postsAPI.getBySlug(slug);

        // Backend returns { data: post }
        const postData = response.data.data;

        // Normalize fields to prevent crashes
        setPost({
          ...postData,
          tags: Array.isArray(postData.tags) ? postData.tags : [],
          content: postData.content || '', // ⚡ Ensure content is always a string
        });
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.error?.message || 'Post not found'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postsAPI.delete(post.id);
      navigate('/blog');
    } catch (err) {
      console.error(err);
      alert('Failed to delete post');
    }
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error || !post) {
    return (
      <div className="error-container">
        <h2>Post Not Found</h2>
        <p>{error || 'This post does not exist.'}</p>
        <Link to="/blog" className="btn btn-primary">
          Back to Blog
        </Link>
      </div>
    );
  }

  const canEdit =
    user && (user.id === post.authorId || user.role === 'ADMIN');

  return (
    <div className="blog-detail-page">
      <article className="post-detail">
        <header className="post-header">
          {/* TAGS */}
          {post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1>{post.title || 'Untitled Post'}</h1>

          <div className="post-meta">
            <div className="author-info">
              <span className="author">
                By {post.author?.name || 'Unknown'}
              </span>
              <span className="date">
                Published on{' '}
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Unknown Date'}
              </span>
            </div>

            <span className="views">{post.viewCount ?? 0} views</span>
          </div>

          {canEdit && (
            <div className="post-actions">
              <Link
                to={`/admin/posts/${post.id}/edit`}
                className="btn btn-secondary"
              >
                Edit Post
              </Link>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete Post
              </button>
            </div>
          )}
        </header>

        {/* CONTENT RENDERING */}
        <div className="post-content">
          {(post.content || '').split('\n').map((line, index) => {
            const text = line.trim();

            if (!text) return <br key={index} />;

            if (text.startsWith('### ')) return <h3 key={index}>{text.slice(4)}</h3>;
            if (text.startsWith('## ')) return <h2 key={index}>{text.slice(3)}</h2>;
            if (text.startsWith('- ')) return <li key={index}>{text.slice(2)}</li>;
            if (/^\d+\. /.test(text)) return <li key={index}>{text.replace(/^\d+\. /, '')}</li>;
            if (text.startsWith('**') && text.endsWith('**')) return <p key={index}><strong>{text.slice(2, -2)}</strong></p>;

            return <p key={index}>{text}</p>;
          })}
        </div>

        <footer className="post-footer">
          <span>
            Last updated:{' '}
            {post.updatedAt
              ? new Date(post.updatedAt).toLocaleDateString()
              : 'Unknown'}
          </span>

          <Link to="/blog" className="back-link">
            ← Back to all articles
          </Link>
        </footer>
      </article>
    </div>
  );
};
