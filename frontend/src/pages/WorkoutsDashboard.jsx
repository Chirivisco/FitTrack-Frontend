import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  FitnessCenter as FitnessCenterIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import '../stylesheets/stylesheet_WorkoutsDashboard.css';

const API_BASE_URL = 'https://rxy1kiwphj.execute-api.us-east-2.amazonaws.com/dev';

const diasSemana = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

const WorkoutsDashboard = () => {
  const [users, setUsers] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [formData, setFormData] = useState({
    dias: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchWorkouts();
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users`);
      const clients = response.data.filter(user => user.rol === 'cliente');
      setUsers(clients);
      setError('');
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/workouts-by-client/${selectedUser.cedula}`);
      setWorkouts(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar las rutinas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (workout = null) => {
    if (workout) {
      setSelectedWorkout(workout);
      const dias = Object.entries(workout)
        .filter(([key]) => diasSemana.some(dia => dia.value === key))
        .map(([dia, ejercicios]) => ({
          dia,
          ejercicios: ejercicios.map(ej => ({
            nombre: typeof ej === 'string' ? ej : ej.nombre,
            series: typeof ej === 'string' ? 3 : ej.series,
            repeticiones: typeof ej === 'string' ? 12 : ej.repeticiones,
            peso: typeof ej === 'string' ? 0 : ej.peso
          }))
        }));
      setFormData({ dias });
    } else {
      setSelectedWorkout(null);
      setFormData({ dias: [] });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedWorkout(null);
    setFormData({ dias: [] });
  };

  const handleAddDia = () => {
    setFormData(prev => ({
      ...prev,
      dias: [...prev.dias, { dia: '', ejercicios: [] }]
    }));
  };

  const handleRemoveDia = (index) => {
    setFormData(prev => ({
      ...prev,
      dias: prev.dias.filter((_, i) => i !== index)
    }));
  };

  const handleDiaChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      dias: prev.dias.map((item, i) => 
        i === index ? { ...item, dia: value } : item
      )
    }));
  };

  const handleAddEjercicio = (diaIndex) => {
    setFormData(prev => ({
      ...prev,
      dias: prev.dias.map((item, i) => 
        i === diaIndex ? {
          ...item,
          ejercicios: [...item.ejercicios, { nombre: '', series: 3, repeticiones: 12, peso: 0 }]
        } : item
      )
    }));
  };

  const handleRemoveEjercicio = (diaIndex, ejercicioIndex) => {
    setFormData(prev => ({
      ...prev,
      dias: prev.dias.map((item, i) => 
        i === diaIndex ? {
          ...item,
          ejercicios: item.ejercicios.filter((_, j) => j !== ejercicioIndex)
        } : item
      )
    }));
  };

  const handleEjercicioChange = (diaIndex, ejercicioIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      dias: prev.dias.map((item, i) => 
        i === diaIndex ? {
          ...item,
          ejercicios: item.ejercicios.map((ej, j) => 
            j === ejercicioIndex ? { ...ej, [field]: value } : ej
          )
        } : item
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const workoutData = formData.dias.reduce((acc, { dia, ejercicios }) => ({
        ...acc,
        [dia]: ejercicios
      }), {});

      if (selectedWorkout) {
        await axios.patch(`${API_BASE_URL}/workouts/${selectedWorkout._id}`, workoutData);
      } else {
        await axios.post(`${API_BASE_URL}/workouts-by-client/${selectedUser.cedula}`, workoutData);
      }
      fetchWorkouts();
      handleCloseDialog();
    } catch (err) {
      setError('Error al guardar la rutina');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (workoutId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta rutina?')) {
      try {
        await axios.delete(`${API_BASE_URL}/workouts/${workoutId}`);
        fetchWorkouts();
      } catch (err) {
        setError('Error al eliminar la rutina');
        console.error('Error:', err);
      }
    }
  };

  const renderWorkoutsView = () => {
    if (!selectedUser) return null;

    return (
      <Box>
        <Box className="workouts-header">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => setSelectedUser(null)}
              className="workouts-back-button"
            >
              Volver
            </Button>
            <Typography variant="h4" className="workouts-title">
              Rutinas de {selectedUser.nombre}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" className="workouts-error">
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          className="workouts-button"
          sx={{ mb: 2 }}
        >
          Nueva Rutina
        </Button>

        {loading ? (
          <Box className="workouts-loading">
            <CircularProgress sx={{ color: '#2196F3' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {workouts.map((workout) => (
              <Grid item xs={12} key={workout._id}>
                <Card className="workouts-card">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Rutina creada el {new Date(workout.fecha_creacion).toLocaleDateString()}
                      </Typography>
                      <Box className="workouts-action-buttons">
                        <IconButton onClick={() => handleOpenDialog(workout)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(workout._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    {Object.entries(workout).map(([dia, ejercicios]) => {
                      if (Array.isArray(ejercicios) && ejercicios.length > 0 && dia !== '_id' && dia !== 'cedula_cliente' && dia !== 'fecha_creacion' && dia !== 'fecha_actualizacion') {
                        return (
                          <Box key={dia} className="workouts-day-card">
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                              {dia.charAt(0).toUpperCase() + dia.slice(1)}
                            </Typography>
                            {ejercicios.map((ejercicio, index) => (
                              <Box key={index} className="workouts-exercise-item">
                                <Typography>{typeof ejercicio === 'string' ? ejercicio : ejercicio.nombre}</Typography>
                                {typeof ejercicio === 'object' && (
                                  <Box className="workouts-exercise-details">
                                    <Typography>{ejercicio.series} series</Typography>
                                    <Typography>{ejercicio.repeticiones} repeticiones</Typography>
                                    <Typography>{ejercicio.peso} kg</Typography>
                                  </Box>
                                )}
                              </Box>
                            ))}
                          </Box>
                        );
                      }
                      return null;
                    })}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const renderUsersView = () => {
    return (
      <Box>
        <Box className="workouts-header">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/dashboard')}
              className="workouts-back-button"
            >
              Volver al Dashboard
            </Button>
            <Typography variant="h4" className="workouts-title">
              Gestión de Rutinas
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" className="workouts-error">
            {error}
          </Alert>
        )}

        {loading ? (
          <Box className="workouts-loading">
            <CircularProgress sx={{ color: '#2196F3' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {users.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.cedula}>
                <Card className="workouts-user-card">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 56, 
                          height: 56,
                          bgcolor: '#2196F3',
                          fontSize: '1.5rem'
                        }}
                      >
                        {user.nombre.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {user.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Cédula: {user.cedula}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label="Cliente" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Button
                        variant="contained"
                        startIcon={<FitnessCenterIcon />}
                        onClick={() => setSelectedUser(user)}
                        className="workouts-button"
                      >
                        Gestionar Rutinas
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" className="workouts-container">
      {selectedUser ? renderWorkoutsView() : renderUsersView()}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        className="workouts-dialog"
      >
        <DialogTitle className="workouts-dialog-title">
          {selectedWorkout ? 'Editar Rutina' : 'Nueva Rutina'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {formData.dias.map((diaData, diaIndex) => (
                <Box key={diaIndex} className="workouts-form-day">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Día de la semana</InputLabel>
                      <Select
                        value={diaData.dia}
                        onChange={(e) => handleDiaChange(diaIndex, e.target.value)}
                        label="Día de la semana"
                      >
                        {diasSemana.map((dia) => (
                          <MenuItem key={dia.value} value={dia.value}>
                            {dia.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <IconButton onClick={() => handleRemoveDia(diaIndex)} color="error">
                      <RemoveCircleIcon />
                    </IconButton>
                  </Box>
                  
                  {diaData.ejercicios.map((ejercicio, ejercicioIndex) => (
                    <Box key={ejercicioIndex} className="workouts-form-exercise">
                      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <TextField
                          fullWidth
                          label="Nombre del ejercicio"
                          value={ejercicio.nombre}
                          onChange={(e) => handleEjercicioChange(diaIndex, ejercicioIndex, 'nombre', e.target.value)}
                        />
                        <IconButton onClick={() => handleRemoveEjercicio(diaIndex, ejercicioIndex)} color="error">
                          <RemoveCircleIcon />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          type="number"
                          label="Series"
                          value={ejercicio.series}
                          onChange={(e) => handleEjercicioChange(diaIndex, ejercicioIndex, 'series', parseInt(e.target.value))}
                        />
                        <TextField
                          type="number"
                          label="Repeticiones"
                          value={ejercicio.repeticiones}
                          onChange={(e) => handleEjercicioChange(diaIndex, ejercicioIndex, 'repeticiones', parseInt(e.target.value))}
                        />
                        <TextField
                          type="number"
                          label="Peso (kg)"
                          value={ejercicio.peso}
                          onChange={(e) => handleEjercicioChange(diaIndex, ejercicioIndex, 'peso', parseInt(e.target.value))}
                        />
                      </Box>
                    </Box>
                  ))}
                  
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddEjercicio(diaIndex)}
                    sx={{ mt: 1 }}
                  >
                    Agregar Ejercicio
                  </Button>
                  
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddDia}
                sx={{ mt: 2 }}
              >
                Agregar Día
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default WorkoutsDashboard; 