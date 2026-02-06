import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { BlogList } from './pages/BlogList';
import { BlogDetail } from './pages/BlogDetail';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { PostEditor } from './pages/PostEditor';
import { ManageUsers } from './pages/ManageUsers';
import { AllPosts } from './pages/AllPosts';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="WRITER">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/posts/new"
                element={
                  <ProtectedRoute requiredRole="WRITER">
                    <PostEditor />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/posts/:id/edit"
                element={
                  <ProtectedRoute requiredRole="WRITER">
                    <PostEditor />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/posts"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AllPosts />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;