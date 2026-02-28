import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Auth pages
import Login from "./components/Login";
import SignUp from "./components/SignUp";

// Layout
import AppLayout from "./components/layout/AppLayout";
import PrivateRoute from "./components/PrivateRoute";

// Main pages
import Dashboard from "./components/Dashboard";
import ModulesPage from "./components/ModulesPage";
import ModuleDetailPage from "./components/ModuleDetailPage";
import LessonListPage from "./components/LessonListPage";
import LessonDetailPage from "./components/LessonDetailPage";
import BookmarksPage from "./components/BookmarksPage";
import SearchPage from "./components/SearchPage";
import RoadmapPage from "./components/RoadmapPage";

// Admin pages
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminModules from "./components/admin/AdminModules";
import AdminLessons from "./components/admin/AdminLessons";
import AdminQuestions from "./components/admin/AdminQuestions";
import BulkImportPage from "./components/admin/BulkImportPage";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "12px", background: "#1e293b", color: "#f8fafc" },
        }}
      />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected routes inside AppLayout */}
          <Route
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="modules" element={<ModulesPage />} />
            <Route path="modules/:moduleId" element={<ModuleDetailPage />} />
            <Route path="lessons" element={<LessonListPage />} />
            <Route path="lessons/:lessonId" element={<LessonDetailPage />} />
            <Route path="bookmarks" element={<BookmarksPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />

            {/* Admin routes */}
            <Route
              path="admin"
              element={
                <PrivateRoute requireAdmin>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="admin/modules"
              element={
                <PrivateRoute requireAdmin>
                  <AdminModules />
                </PrivateRoute>
              }
            />
            <Route
              path="admin/lessons"
              element={
                <PrivateRoute requireAdmin>
                  <AdminLessons />
                </PrivateRoute>
              }
            />
            <Route
              path="admin/questions"
              element={
                <PrivateRoute requireAdmin>
                  <AdminQuestions />
                </PrivateRoute>
              }
            />
            <Route
              path="admin/import"
              element={
                <PrivateRoute requireAdmin>
                  <BulkImportPage />
                </PrivateRoute>
              }
            />
            <Route
              path="admin/analytics"
              element={
                <PrivateRoute requireAdmin>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </>
  );
}
