import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../stylesheets/stylesheet_ClientDashboard.css';

const API_BASE_URL = 'https://rxy1kiwphj.execute-api.us-east-2.amazonaws.com/dev';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cedula = localStorage.getItem('userCedula');

  useEffect(() => {
    if (!cedula) {
      navigate('/login');
    }
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userCedula');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workoutsRes, measurementsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/workouts-by-client/${cedula}`),
        axios.get(`${API_BASE_URL}/measurements-by-client/${cedula}`)
      ]);

      console.log('Workouts response:', workoutsRes.data); // Debug log
      setWorkouts(workoutsRes.data || []);
      setMeasurements(measurementsRes.data.measurements || []);
      setError('');
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    return measurements.map(measurement => ({
      fecha: new Date(measurement.fecha_medicion).toLocaleDateString(),
      peso: parseFloat(measurement.datos_basicos.peso),
      imc: parseFloat(measurement.datos_basicos.imc),
      grasa: parseFloat(measurement.composicion_corporal.grasa),
      masaMuscular: parseFloat(measurement.composicion_corporal.masaMuscular),
      aguaCorporal: parseFloat(measurement.composicion_corporal.aguaCorporal)
    }));
  };

  const renderWorkoutsWeek = () => {
    const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const lastWorkout = workouts.length > 0 ? workouts[workouts.length - 1] : null;
    console.log('Last workout:', lastWorkout); // Debug log
    return (
      <div className="client-workouts-week">
        {days.map(day => (
          <div key={day} className="client-workout-day">
            <div className="client-workout-day-title">{day}</div>
            {lastWorkout && Array.isArray(lastWorkout[day]) && lastWorkout[day].length > 0 ? (
              lastWorkout[day].map((exercise, index) => (
                <div key={index} className="client-workout-exercise">
                  <div className="client-workout-exercise-name">{exercise.nombre}</div>
                  <div className="client-workout-exercise-details">
                    {exercise.series} x {exercise.repeticiones} - {exercise.peso}kg
                  </div>
                </div>
              ))
            ) : (
              <div className="client-workout-exercise-details" style={{ color: '#aaa' }}>
                No hay ejercicios asignados
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderMeasurements = () => {
    return (
      <div className="client-measurements-list">
        {measurements.map((measurement, index) => (
          <div key={index} className="client-measurement-item">
            <div className="client-measurement-date">
              {new Date(measurement.fecha_medicion).toLocaleDateString()}
            </div>
            <div className="client-measurement-data">
              <div className="client-measurement-value">
                <div className="client-measurement-label">Peso</div>
                <div className="client-measurement-number">{measurement.datos_basicos.peso} kg</div>
              </div>
              <div className="client-measurement-value">
                <div className="client-measurement-label">IMC</div>
                <div className="client-measurement-number">{measurement.datos_basicos.imc}</div>
              </div>
              <div className="client-measurement-value">
                <div className="client-measurement-label">% Grasa</div>
                <div className="client-measurement-number">{measurement.composicion_corporal.grasa}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Box className="client-dashboard-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container className="client-dashboard-container">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box className="client-dashboard-header">
        <Typography variant="h4" className="client-dashboard-title">
          Mi Progreso
        </Typography>
        <button className="client-logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </Box>

      <Box className="client-dashboard-grid">
        <Card className="client-dashboard-card">
          <CardContent>
            <Typography variant="h6" className="client-dashboard-card-title">
              Progreso Físico
            </Typography>
            <div className="client-progress-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="peso" stroke="#8884d8" name="Peso (kg)" />
                  <Line type="monotone" dataKey="imc" stroke="#82ca9d" name="IMC" />
                  <Line type="monotone" dataKey="grasa" stroke="#ffc658" name="% Grasa" />
                  <Line type="monotone" dataKey="masaMuscular" stroke="#ff7300" name="% Masa Muscular" />
                  <Line type="monotone" dataKey="aguaCorporal" stroke="#0088fe" name="% Agua Corporal" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="client-dashboard-card">
          <CardContent>
            <Typography variant="h6" className="client-dashboard-card-title">
              Mis Mediciones
            </Typography>
            {renderMeasurements()}
          </CardContent>
        </Card>
      </Box>

      <Card className="client-dashboard-card">
        <CardContent>
          <Typography variant="h6" className="client-dashboard-card-title">
            Mis Rutinas Semanales
          </Typography>
          {renderWorkoutsWeek()}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ClientDashboard; 