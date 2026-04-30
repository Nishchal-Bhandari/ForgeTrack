import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleGuard } from './components/RoleGuard';
import { AppShell } from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import MentorDashboard from './pages/mentor/MentorDashboard';
import MarkAttendance from './pages/mentor/MarkAttendance';
import StudentHistory from './pages/mentor/StudentHistory';
import { ManageStudents } from './pages/mentor/ManageStudents';
import CsvUpload from './pages/mentor/CsvUpload';
import MaterialsLibrary from './pages/mentor/MaterialsLibrary';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import UpcomingSession from './pages/student/UpcomingSession';
import ChangePassword from './pages/ChangePassword';
import Forbidden from './pages/Forbidden';
import './App.css';

function RouteFade({ children }) {
  const location = useLocation();

  return <div key={location.pathname} className="animate-fade-in">{children}</div>;
}

function RedirectByRole() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.role === 'mentor' ? '/mentor/dashboard' : '/student/dashboard'} replace />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-void text-fg-secondary">Loading ForgeTrack...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="/dashboard" element={<RedirectByRole />} />
      <Route path="/attendance" element={<RedirectByRole />} />
      <Route path="/history" element={<RedirectByRole />} />
      <Route path="/materials" element={<RedirectByRole />} />
      <Route path="/upload" element={<RedirectByRole />} />
      <Route path="/me/attendance" element={<RedirectByRole />} />
      <Route path="/me/upcoming" element={<RedirectByRole />} />
      <Route path="/me/materials" element={<RedirectByRole />} />

      <Route
        element={
          <RoleGuard>
            <AppShell />
          </RoleGuard>
        }
      >
        <Route path="/change-password" element={<RouteFade><ChangePassword /></RouteFade>} />

        <Route path="/mentor/dashboard" element={<RoleGuard role="mentor"><RouteFade><MentorDashboard /></RouteFade></RoleGuard>} />
        <Route path="/mentor/attendance" element={<RoleGuard role="mentor"><RouteFade><MarkAttendance /></RouteFade></RoleGuard>} />
        <Route path="/mentor/students" element={<RoleGuard role="mentor"><RouteFade><ManageStudents /></RouteFade></RoleGuard>} />
        <Route path="/mentor/students-history" element={<RoleGuard role="mentor"><RouteFade><StudentHistory /></RouteFade></RoleGuard>} />
        <Route path="/mentor/upload" element={<RoleGuard role="mentor"><RouteFade><CsvUpload /></RouteFade></RoleGuard>} />
        <Route path="/mentor/materials" element={<RoleGuard role="mentor"><RouteFade><MaterialsLibrary role="mentor" /></RouteFade></RoleGuard>} />

        <Route path="/student/dashboard" element={<RoleGuard role="student"><RouteFade><StudentDashboard /></RouteFade></RoleGuard>} />
        <Route path="/student/attendance" element={<RoleGuard role="student"><RouteFade><StudentAttendance /></RouteFade></RoleGuard>} />
        <Route path="/student/upcoming" element={<RoleGuard role="student"><RouteFade><UpcomingSession /></RouteFade></RoleGuard>} />
        <Route path="/student/materials" element={<RoleGuard role="student"><RouteFade><MaterialsLibrary role="student" /></RouteFade></RoleGuard>} />

        <Route path="/" element={<RedirectByRole />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
