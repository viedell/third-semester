import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const promises = [postsAPI.getAll({ authorId: user.id, limit: 10 })];

        if (isAdmin()) {
          promises.push(postsAPI.getStats());
          promises.push(usersAPI.getStats());
        }

        const results = await Promise.all(promises);

        setUserPosts(results[0]?.data?.data?.posts || []);

        if (isAdmin()) {
          setStats({
            posts: results[1]?.data?.data?.stats || results[1]?.data?.data || {
              total: 0,
              published: 0,
              drafts: 0,
              totalViews: 0,
            },
            users: results[2]?.data?.data?.stats || results[2]?.data?.data || { 
              total: 0, 
              byRole: {} 
            },
          });
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id, isAdmin]);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name}!</p>
      </div>

      <div className="dashboard-content">
        {isAdmin() && stats && (
          <section className="stats-section">
            <h2>Platform Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Posts</h3>
                <p className="stat-number">{stats.posts.total}</p>
              </div>
              <div className="stat-card">
                <h3>Published</h3>
                <p className="stat-number">{stats.posts.published}</p>
              </div>
              <div className="stat-card">
                <h3>Drafts</h3>
                <p className="stat-number">{stats.posts.drafts}</p>
              </div>
              <div className="stat-card">
                <h3>Total Views</h3>
                <p className="stat-number">{stats.posts.totalViews}</p>
              </div>
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">{stats.users.total}</p>
              </div>
              <div className="stat-card">
                <h3>Writers</h3>
                <p className="stat-number">{stats.users.byRole?.WRITER || 0}</p>
              </div>
            </div>
          </section>
        )}

        <section className="posts-section">
          <div className="section-header">
            <h2>Your Posts</h2>
            <Link to="/admin/posts/new" className="btn btn-primary">
              Create New Post
            </Link>
          </div>

          {userPosts.length === 0 ? (
            <div className="no-posts">
              <p>You haven't created any posts yet.</p>
              <Link to="/admin/posts/new" className="btn btn-primary">
                Create Your First Post
              </Link>
            </div>
          ) : (
            <div className="posts-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userPosts.map(post => (
                    <tr key={post.id}>
                      <td>
                        <Link to={`/blog/${post.slug}`} className="post-title">
                          {post.title}
                        </Link>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${post.published ? 'published' : 'draft'}`}
                        >
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {isAdmin() && (
          <section className="admin-section">
            <h2>Admin Tools</h2>
            <div className="admin-tools">
              <Link to="/admin/users" className="tool-card">
                <h3>👥 Manage Users</h3>
                <p>View and manage user accounts and roles</p>
              </Link>
              <Link to="/admin/posts" className="tool-card">
                <h3>📝 All Posts</h3>
                <p>View and manage all posts on the platform</p>
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};