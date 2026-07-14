import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/ui/Navbar";
import LandingPage from "./pages/LandingPage";
import { PillarListPage, PillarDetailPage } from "./pages/PillarPages";
import AiTutorPage from "./pages/AiTutorPage";
import SearchPage from "./pages/SearchPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminContentList from "./pages/admin/AdminContentList";
import AdminContentForm from "./pages/admin/AdminContentForm";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import ProtectedRoute from "./components/admin/ProtectedRoute";

const pillarConfig = {
  quran: {
    title: "Quran",
    description: "Explore the words of Allah — surah by surah",
    color: "bg-gradient-to-br from-emerald-700 to-emerald-900",
  },
  hadith: {
    title: "Hadith",
    description: "Sayings and actions of the Prophet Muhammad ﷺ",
    color: "bg-gradient-to-br from-blue-700 to-blue-900",
  },
  tafsir: {
    title: "Tafsir",
    description: "Deep commentary and interpretation of the Quran",
    color: "bg-gradient-to-br from-purple-700 to-purple-900",
  },
  sirah: {
    title: "Sirah",
    description: "Biography of the Prophet and early Islamic history",
    color: "bg-gradient-to-br from-amber-700 to-amber-900",
  },
};

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={<PublicLayout><LandingPage /></PublicLayout>}
          />
          <Route
            path="/search"
            element={<PublicLayout><SearchPage /></PublicLayout>}
          />
          <Route
            path="/ai-tutor"
            element={<PublicLayout><AiTutorPage /></PublicLayout>}
          />

          {(["quran", "hadith", "tafsir", "sirah"] as const).map((pillar) => (
            <Route key={pillar} path={`/${pillar}`}>
              <Route
                index
                element={
                  <PublicLayout>
                    <PillarListPage
                      pillar={pillar}
                      title={pillarConfig[pillar].title}
                      description={pillarConfig[pillar].description}
                      color={pillarConfig[pillar].color}
                    />
                  </PublicLayout>
                }
              />
              <Route
                path=":slug"
                element={<PublicLayout><PillarDetailPage pillar={pillar} /></PublicLayout>}
              />
            </Route>
          ))}

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/contents" element={<AdminContentList />} />
              <Route path="/admin/contents/new" element={<AdminContentForm />} />
              <Route path="/admin/contents/:id/edit" element={<AdminContentForm />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
