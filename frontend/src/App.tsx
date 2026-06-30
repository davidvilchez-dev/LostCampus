import { BrowserRouter, Routes, Route } from 'react-router';
import { ToastContainer } from 'react-toastify';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import DashboardLayout from './components/DashboardLayout';
import CreateReportPage from './pages/CreateReportPage';
import MyReportsPage from './pages/MyReportsPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recuperar" element={<ForgotPasswordPage />} />
        <Route path="/restablecer" element={<ResetPasswordPage />} />
        
        {/* Rutas Protegidas del Dashboard */}
        <Route element={<DashboardLayout />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/reportar" element={<CreateReportPage />} />
          <Route path="/mis-reportes" element={<MyReportsPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Routes>
      <ToastContainer position="top-right" theme="dark" autoClose={2000} />
    </BrowserRouter>
  );
}

export default App;
