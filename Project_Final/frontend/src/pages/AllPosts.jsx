import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import './AllPosts.css';

export const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); // all, published, drafts

  useEffect(() => {
    fetchPosts();
  }, [currentPage, filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 20 };
      
      if (filter === 'published') params.published = true;
      if (filter === 'drafts') params.published = false;

      const response = await postsAPI.getAll(params);
      setPosts(response.data.data.posts);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postsAPI.delete(postId);
      fetchPosts();
    } catch (err) {
      alert('Failed to delete post: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="all-posts-page">
      <div className="page-header">
        <h1>All Posts</h1>
        <p>Manage all blog posts on the platform</p>
      </div>

      <div className="container">
        <div className="filters">
          <button
            onClick={() => setFilter('all')}
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          >
            All Posts ({pagination.total || 0})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`filter-btn ${filter === 'published' ? 'active' : ''}`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter('drafts')}
            className={`filter-btn ${filter === 'drafts' ? 'active' : ''}`}
          >
            Drafts
          </button>
        </div>

        <div className="posts-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Views</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>
                    <Link to={`/blog/${post.slug}`} className="post-title">
                      {post.title}
                    </Link>
                  </td>
                  <td>{post.author?.name || 'Unknown'}</td>
                  <td>
                    <span className={`status-badge ${post.published ? 'published' : 'draft'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>{post.viewCount}</td>
                  <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/admin/posts/${post.id}/edit`}
                        className="btn btn-sm btn-secondary"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};