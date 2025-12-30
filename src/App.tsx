import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { ArchivePage } from './pages/ArchivePage';
import { AudioDetailPage } from './pages/AudioDetailPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { BlogListPage } from './pages/BlogListPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { AuthorProfilePage } from './pages/AuthorProfilePage';

function App() {
  return (
    <AuthProvider>
      <AudioPlayerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/ar" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/:lang"
              element={
                <LanguageProvider>
                  <MainLayout>
                    <HomePage />
                  </MainLayout>
                </LanguageProvider>
              }
            />
            <Route
              path="/:lang/about"
              element={
                <LanguageProvider>
                  <MainLayout>
                    <AboutPage />
                  </MainLayout>
                </LanguageProvider>
              }
            />
            <Route
              path="/:lang/contact-us"
              element={
                <LanguageProvider>
                  <MainLayout>
                    <ContactPage />
                  </MainLayout>
                </LanguageProvider>
              }
            />
            <Route
              path="/:lang/privacy-policy"
              element={
                <LanguageProvider>
                  <MainLayout>
                    <PrivacyPolicyPage />
                  </MainLayout>
                </LanguageProvider>
              }
            />
            <Route
              path="/:lang/disclaimer"
              element={
                <LanguageProvider>
                  <MainLayout>
                    <DisclaimerPage />
                  </MainLayout>
                </LanguageProvider>
              }
            />
            <Route
              path="/:lang/archive"
              element={
                <LanguageProvider>
                  <MainLayout>
                    <ArchivePage />
                  </MainLayout>
                </LanguageProvider>
              }
            />
            <Route
              path="/:lang/audio/:id"
              element={
                <LanguageProvider>
                  <MainLayout>
                    <AudioDetailPage />
                  </MainLayout>
                </LanguageProvider>
              }
            />
            <Route
              path="/:lang/blog"
              element={
                <LanguageProvider>
                  <MainLayout>
                    <BlogListPage />
                  </MainLayout>
                </LanguageProvider>
              }
            />
            <Route
              path="/:lang/blog/:slug"
              element={
                <LanguageProvider>
                  <MainLayout>
                    <BlogPostPage />
                  </MainLayout>
                </LanguageProvider>
              }
            />
            <Route
              path="/:lang/authors/:slug"
              element={
                <LanguageProvider>
                  <MainLayout>
                    <AuthorProfilePage />
                  </MainLayout>
                </LanguageProvider>
              }
            />
            <Route path="*" element={<Navigate to="/ar" replace />} />
          </Routes>
        </BrowserRouter>
      </AudioPlayerProvider>
    </AuthProvider>
  );
}

export default App;
