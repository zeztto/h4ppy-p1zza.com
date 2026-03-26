import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/app/admin/AuthContext';
import { ProtectedRoute } from '@/app/admin/ProtectedRoute';

import { PublicLayout } from '@/app/layouts/PublicLayout';
import { AdminLayout } from '@/app/layouts/AdminLayout';

import { LandingPage } from '@/app/pages/landing/LandingPage';
import { PortfolioPage } from '@/app/pages/portfolio/PortfolioPage';
import { ProjectDetailPage } from '@/app/pages/portfolio/ProjectDetailPage';
import { ProfilePage } from '@/app/pages/profile/ProfilePage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';

import LoginPage from '@/app/pages/admin/LoginPage';
import DashboardPage from '@/app/pages/admin/DashboardPage';
import AdminProjectsPage from '@/app/pages/admin/ProjectsPage';
import AdminProfilePage from '@/app/pages/admin/ProfilePage';
import SectionsPage from '@/app/pages/admin/SectionsPage';
import BlogPage from '@/app/pages/admin/BlogPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:id" element={<ProjectDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="sections" element={<SectionsPage />} />
          <Route path="blog" element={<BlogPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
