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
import VerifyAccountPage from './pages/VerifyAccountPage';
import ReportDetailPage from './pages/ReportDetailPage';
import EditReportPage from './pages/EditReportPage';
import MatchesPage from './pages/MatchesPage';
import ClaimsPage from './pages/ClaimsPage';
import MessagesPage from './pages/MessagesPage';
import AdminRoute from './components/AdminRoute';
import AdminPanelPage from './pages/AdminPanelPage';
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
        <Route path="/verificar" element={<VerifyAccountPage />} />
        
        {/* Rutas Protegidas del Dashboard */}
        <Route element={<DashboardLayout />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/reporte/:id" element={<ReportDetailPage />} />
          <Route path="/reporte/:id/editar" element={<EditReportPage />} />
          <Route path="/reportar" element={<CreateReportPage />} />
          <Route path="/mis-reportes" element={<MyReportsPage />} />
          <Route path="/coincidencias" element={<MatchesPage />} />
          <Route path="/solicitudes" element={<ClaimsPage />} />
          <Route path="/mensajes" element={<MessagesPage />} />
          <Route path="/perfil" element={<ProfilePage />} />

          {/* Rutas de Administrador */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanelPage />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer
        position="bottom-center"
        theme="dark"
        autoClose={1600}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover={false}
        draggable
        draggablePercent={30}
        limit={3}
        newestOnTop={false}
        closeButton={false}
        className="lc-toast-container"
        toastClassName="lc-toast"
      />
    </BrowserRouter>
  );
}

export default App;
