import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import './Home.css';

export const Home = () => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const [recentRes, popularRes] = await Promise.all([
          postsAPI.getRecent(3),
          postsAPI.getPopular(3),
        ]);
        setRecentPosts(recentRes.data.data.posts);
        setPopularPosts(popularRes.data.data.posts);
      } catch (err) {
        setError('Failed to load posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Blog Platform</h1>
          <p>Discover articles, tutorials, and insights on web development, technology, and more.</p>
          <Link to="/blog" className="btn btn-primary btn-large">
            Explore Articles
          </Link>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <h2>Recent Articles</h2>
          {error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="posts-grid">
              {recentPosts.map(post => (
                <article key={post.id} className="post-card">
                  <h3>
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <div className="post-meta">
                    <span className="author">By {post.author?.name || 'Unknown'}</span>
                    <span className="date">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link to={`/blog/${post.slug}`} className="read-more">
                    Read More →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="popular-section">
        <div className="container">
          <h2>Popular Articles</h2>
          {error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="posts-grid">
              {popularPosts.map(post => (
                <article key={post.id} className="post-card">
                  <h3>
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <div className="post-meta">
                    <span className="author">By {post.author?.name || 'Unknown'}</span>
                    <span className="views">{post.viewCount} views</span>
                  </div>
                  <Link to={`/blog/${post.slug}`} className="read-more">
                    Read More →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Writing?</h2>
          <p>Join our community of writers and share your knowledge with the world.</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
};