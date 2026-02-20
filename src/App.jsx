import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import StudentDashboard from './pages/StudentDashboard';
import StudentHome from './pages/students/StudentHome';
import StudentCourses from './pages/students/StudentCourses';
import StudentVideos from './pages/students/StudentVideos';
import StudentNotes from './pages/students/StudentNotes';
import StudentPayments from './pages/students/StudentPayments';
import StudentSupport from './pages/students/StudentSupport';
import PaymentPage from './pages/students/PaymentPage';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './components/admin/Dashboard';
import SliderManager from './components/admin/SliderManager';
import CourseManager from './components/admin/CourseManager';
import PaymentManager from './components/admin/PaymentManager';
import SupportManager from './components/admin/SupportManager';
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<StudentHome />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="videos" element={<StudentVideos />} />
            <Route path="notes" element={<StudentNotes />} />
            <Route path="payments-history" element={<StudentPayments />} />
            <Route path="support" element={<StudentSupport />} />
            <Route path="payments" element={<PaymentPage />} />
          </Route>

          {/* Admin layout with nested pages */}
          <Route
            path="/adminDashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index                element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<Dashboard />} />
            <Route path="sliders"       element={<SliderManager />} />
            <Route path="course"        element={<CourseManager />} />
            <Route path="payments"      element={<PaymentManager />} />
            <Route path="support"       element={<SupportManager />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;