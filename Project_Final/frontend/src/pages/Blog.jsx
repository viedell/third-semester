import { useEffect, useState } from 'react';
import './Blog.css';

export const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:5000/posts?published=true');
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error('Failed to fetch posts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="blog-page">
      <div className="page-header">
        <h1>Blog</h1>
        <p>Read our latest articles and insights</p>
      </div>

      <div className="blog-content">
        {loading && <p>Loading posts...</p>}

        {!loading && posts.length === 0 && (
          <p>No blog posts yet.</p>
        )}

        <div className="blog-grid">
          {posts.map(post => (
            <article key={post.id} className="blog-card">
              <h2>{post.title}</h2>
              <p className="blog-excerpt">{post.excerpt}</p>

              <div className="blog-meta">
                <span>By {post.author?.name}</span>
                <span>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              <a href={`/blog/${post.slug}`} className="read-more">
                Read more →
              </a>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
