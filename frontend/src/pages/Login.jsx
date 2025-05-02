import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import '../stylesheets/stylesheet_Login.css';

// Configuración de axios para el login
const loginApi = axios.create({
  baseURL: 'https://rxy1kiwphj.execute-api.us-east-2.amazonaws.com/dev',
  headers: {
    'Content-Type': 'application/json',
  },
});

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await loginApi.post('/login', data);
      console.log('Login response:', response.data);
      
      if (response.data.message === 'Login exitoso' && response.data.user) {
        const user = response.data.user;
        localStorage.setItem('userRole', user.rol);
        localStorage.setItem('userCedula', user.cedula);
        localStorage.setItem('userName', user.nombre);
        
        console.log('User role:', user.rol);
        
        if (user.rol.toLowerCase() === 'cliente') {
          navigate('/client');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Error en el login');
      }
    } catch (err) {
      console.error('Error en login:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al conectar con el servidor');
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box className="login-container">
        <Paper elevation={3} className="login-paper">
          <Box className="login-icon-container">
            <FitnessCenterIcon className="login-icon" />
          </Box>
          <Typography component="h1" variant="h5" className="login-title">
            FitTrack
          </Typography>
          <Typography variant="body2" color="text.secondary" className="login-subtitle">
            Sistema de seguimiento y gestión de progreso físico
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="cedula"
              label="Cédula"
              autoComplete="cedula"
              autoFocus
              {...register('cedula', { required: 'La cédula es requerida' })}
              error={!!errors.cedula}
              helperText={errors.cedula?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="PIN"
              type="password"
              id="pin"
              autoComplete="current-password"
              {...register('pin', { required: 'El PIN es requerido' })}
              error={!!errors.pin}
              helperText={errors.pin?.message}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="login-form"
            >
              Iniciar Sesión
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 