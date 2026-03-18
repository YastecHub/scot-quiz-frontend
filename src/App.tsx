import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import Home         from './pages/Home';
import Login        from './pages/Login';
import Register     from './pages/Register';
import Quiz         from './pages/Quiz';
import Topics       from './pages/Topics';
import Resources    from './pages/Resources';
import StudentTests from './pages/StudentTests';
import TakeTest     from './pages/TakeTest';
import TestReview   from './pages/TestReview';

// Admin pages
import AdminDashboard  from './pages/admin/Dashboard';
import CreateTest      from './pages/admin/CreateTest';
import ManageTest      from './pages/admin/ManageTest';
import TestResults     from './pages/admin/TestResults';
import AdminResources  from './pages/admin/Resources';

// Background decoration
function BgDecoration() {
  return (
    <>
      <div className="bg-grid" />
      <div className="bg-decoration">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
      </div>
    </>
  );
}

// Require login
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner--page" />;

  if (!user)   return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Require admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading)  return <div className="spinner--page" />;
  if (!user)    return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Students only — redirect admins to their dashboard
function StudentRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading)  return <div className="spinner--page" />;
  if (!user)    return <Navigate to="/login" replace />;
  if (isAdmin)  return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <BgDecoration />
      <div className="page">
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/"          element={<Home />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/resources" element={<Resources />} />

          {/* Students only (admins redirected to /admin) */}
          <Route path="/quiz"    element={<StudentRoute><Quiz /></StudentRoute>} />
          <Route path="/topics"  element={<StudentRoute><Topics /></StudentRoute>} />

          <Route path="/tests"   element={<StudentRoute><StudentTests /></StudentRoute>} />
          <Route path="/tests/:testId/take"   element={<StudentRoute><TakeTest /></StudentRoute>} />
          <Route path="/tests/:testId/review" element={<StudentRoute><TestReview /></StudentRoute>} />

          {/* Admin only */}
          <Route path="/admin"                         element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/tests/new"               element={<AdminRoute><CreateTest /></AdminRoute>} />
          <Route path="/admin/tests/:id/manage"        element={<AdminRoute><ManageTest /></AdminRoute>} />
          <Route path="/admin/tests/:id/results"       element={<AdminRoute><TestResults /></AdminRoute>} />
          <Route path="/admin/resources"               element={<AdminRoute><AdminResources /></AdminRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
