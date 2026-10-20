import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Academy from './pages/Academy';
import CourseStudy from './pages/CourseStudy';
import Certificates from './pages/Certificates';
import Settings from './pages/Settings';
import PaymentSuccess from './pages/PaymentSuccess';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/academia" element={<Academy />} />
          <Route path="/academia/course/:courseId" element={<CourseStudy />} />
          <Route path="/academia/certificados" element={<Certificates />} />
          <Route path="/academia/configuracion" element={<Settings />} />
          <Route path="/academia/payment/success" element={<PaymentSuccess />} />
          <Route path="/terminos-y-condiciones" element={<TermsAndConditions />} />
          <Route path="/politicas-de-privacidad" element={<PrivacyPolicy />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
