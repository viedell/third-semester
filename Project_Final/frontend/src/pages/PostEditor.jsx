import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postsAPI } from '../services/api';
import './PostEditor.css';

export const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    published: false,
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditMode) return;

    const fetchPost = async () => {
      try {
        const response = await postsAPI.getById(id);

        // ✅ FIX: handle real backend response shape
        const post =
          response?.data?.data?.post ||
          response?.data?.post ||
          response?.data?.data ||
          response?.data;

        if (!post || !post.title) {
          setError('Post not found');
          return;
        }

        setFormData({
          title: post.title || '',
          content: post.content || '',
          excerpt: post.excerpt || '',
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
          published: Boolean(post.published),
        });
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) setError('Post not found');
        else if (status === 403) setError('You do not have permission to edit this post');
        else setError('Failed to load post');
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPost();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        published: formData.published,
      };

      if (isEditMode) {
        await postsAPI.update(id, postData);
      } else {
        await postsAPI.create(postData);
      }

      navigate('/admin');
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to save post';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="loading">Loading post...</div>;
  }

  return (
    <div className="post-editor-page">
      <div className="editor-header">
        <h1>{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>
      </div>

      <div className="editor-container">
        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="editor-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Excerpt *</label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows="3"
              value={formData.excerpt}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              rows="15"
              value={formData.content}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              placeholder="tag1, tag2"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
              />
              <span>Publish immediately</span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin')}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? 'Saving...'
                : isEditMode
                ? 'Update Post'
                : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
