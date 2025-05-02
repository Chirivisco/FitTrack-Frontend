import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { CssBaseline } from '@mui/material';
import Login from './pages/Login.jsx';
import CoachDashboard from './pages/CoachDashboard';
import UserManagement from './pages/UserManagement.jsx';
import AppointmentManagement from './pages/AppointmentManagement';
import WorkoutsDashboard from './pages/WorkoutsDashboard';
import MeasurementsDashboard from './pages/MeasurementsDashboard';
import ClientDashboard from './pages/ClientDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<CoachDashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/appointments" element={<AppointmentManagement />} />
          <Route path="/workouts" element={<WorkoutsDashboard />} />
          <Route path="/measurements" element={<MeasurementsDashboard />} />
          <Route path="/client" element={<ClientDashboard />} />
          {/* Redirigir cualquier ruta no encontrada al login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
