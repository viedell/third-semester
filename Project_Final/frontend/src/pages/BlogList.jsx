import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import './BlogList.css';

export const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await postsAPI.getAll({ published: true });
        setPosts(res.data.data.posts);
      } catch (err) {
        console.error(err);
        setError('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (posts.length === 0) {
    return <div className="empty">No blog posts yet.</div>;
  }

  return (
    <div className="blog-list-page">
      <div className="page-header">
        <h1>Blog</h1>
        <p>Latest articles and insights</p>
      </div>

      <div className="blog-list">
        {posts.map(post => (
          <article key={post.id} className="blog-card">
            <h2>
              <Link to={`/blog/${post.slug}`}>
                {post.title}
              </Link>
            </h2>

            <p className="excerpt">{post.excerpt}</p>

            <div className="meta">
              <span>By {post.author.name}</span>
              <span>
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            <Link className="read-more" to={`/blog/${post.slug}`}>
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};
