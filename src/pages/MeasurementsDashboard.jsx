import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
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
  Avatar,
  Chip,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import '../stylesheets/stylesheet_measurementsdashboard.css';

const API_BASE_URL = 'https://rxy1kiwphj.execute-api.us-east-2.amazonaws.com/dev';

const MeasurementsDashboard = () => {
  const [users, setUsers] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [formData, setFormData] = useState({
    fecha_medicion: new Date().toISOString().split('T')[0],
    datos_basicos: {
      peso: '',
      altura: '',
      edad: '',
      sexo: ''
    },
    composicion_corporal: {
      grasa: '',
      masaMuscular: '',
      aguaCorporal: ''
    },
    mediciones_antropometricas: {
      cintura: '',
      cadera: '',
      pecho: '',
      brazo: '',
      pierna: '',
      pantorrilla: ''
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMeasurements();
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

  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/measurements-by-client/${selectedUser.cedula}`);
      setMeasurements(response.data.measurements || []);
      setError('');
    } catch (err) {
      setError('Error al cargar las mediciones');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (measurement = null) => {
    if (measurement) {
      setSelectedMeasurement(measurement);
      setFormData({
        fecha_medicion: measurement.fecha_medicion,
        datos_basicos: measurement.datos_basicos,
        composicion_corporal: measurement.composicion_corporal,
        mediciones_antropometricas: measurement.mediciones_antropometricas
      });
    } else {
      setSelectedMeasurement(null);
      setFormData({
        fecha_medicion: new Date().toISOString().split('T')[0],
        datos_basicos: {
          peso: '',
          altura: '',
          edad: '',
          sexo: ''
        },
        composicion_corporal: {
          grasa: '',
          masaMuscular: '',
          aguaCorporal: ''
        },
        mediciones_antropometricas: {
          cintura: '',
          cadera: '',
          pecho: '',
          brazo: '',
          pierna: '',
          pantorrilla: ''
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMeasurement(null);
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const measurementData = {
        fecha_medicion: formData.fecha_medicion,
        peso: formData.datos_basicos.peso,
        altura: formData.datos_basicos.altura,
        edad: formData.datos_basicos.edad,
        sexo: formData.datos_basicos.sexo,
        cintura: formData.mediciones_antropometricas.cintura,
        cadera: formData.mediciones_antropometricas.cadera,
        pecho: formData.mediciones_antropometricas.pecho,
        brazo: formData.mediciones_antropometricas.brazo,
        pierna: formData.mediciones_antropometricas.pierna,
        pantorrilla: formData.mediciones_antropometricas.pantorrilla,
        composicion_corporal: {
          grasa: formData.composicion_corporal.grasa,
          masaMuscular: formData.composicion_corporal.masaMuscular,
          aguaCorporal: formData.composicion_corporal.aguaCorporal
        }
      };

      if (selectedMeasurement) {
        await axios.patch(`${API_BASE_URL}/measurements/${selectedMeasurement._id}`, measurementData);
      } else {
        await axios.post(`${API_BASE_URL}/measurements-by-client/${selectedUser.cedula}`, measurementData);
      }
      fetchMeasurements();
      handleCloseDialog();
    } catch (err) {
      console.error('Error completo:', err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.camposFaltantes) {
          setError(errorData.camposFaltantes.join(', '));
        } else if (errorData.error) {
          setError(errorData.error);
        } else {
          setError('Error al guardar la medición');
        }
      } else {
        setError('Error al guardar la medición');
      }
    }
  };

  const handleDelete = async (measurementId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta medición?')) {
      try {
        console.log('Deleting measurement with ID:', measurementId);
        await axios.delete(`${API_BASE_URL}/measurements/${measurementId}`);
        fetchMeasurements();
      } catch (err) {
        setError('Error al eliminar la medición');
        console.error('Error:', err);
      }
    }
  };

  const renderMeasurementsView = () => {
    if (!selectedUser) return null;

    return (
      <Box>
        <Box className="measurements-header">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => setSelectedUser(null)}
              className="measurements-back-button"
            >
              Volver
            </Button>
            <Typography variant="h4" className="measurements-title">
              Mediciones de {selectedUser.nombre}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" className="measurements-error">
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          className="measurements-button"
          sx={{ mb: 2 }}
        >
          Nueva Medición
        </Button>

        {loading ? (
          <Box className="measurements-loading">
            <CircularProgress sx={{ color: '#2196F3' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {measurements.map((measurement) => (
              <Grid item xs={12} key={measurement._id}>
                <Card className="measurements-card">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Medición del {new Date(measurement.fecha_medicion).toLocaleDateString()}
                      </Typography>
                      <Box className="measurements-action-buttons">
                        <IconButton onClick={() => handleOpenDialog(measurement)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(measurement._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                          Datos Básicos
                        </Typography>
                        <Box className="measurements-details">
                          <Typography>Peso: {measurement.datos_basicos.peso} kg</Typography>
                          <Typography>Altura: {measurement.datos_basicos.altura} cm</Typography>
                          <Typography>Edad: {measurement.datos_basicos.edad} años</Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                          Composición Corporal
                        </Typography>
                        <Box className="measurements-details">
                          <Typography>Grasa: {measurement.composicion_corporal.grasa}%</Typography>
                          <Typography>Masa Muscular: {measurement.composicion_corporal.masaMuscular}%</Typography>
                          <Typography>Agua Corporal: {measurement.composicion_corporal.aguaCorporal}%</Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                          Medidas Antropométricas
                        </Typography>
                        <Box className="measurements-details">
                          <Typography>Cintura: {measurement.mediciones_antropometricas.cintura} cm</Typography>
                          <Typography>Cadera: {measurement.mediciones_antropometricas.cadera} cm</Typography>
                          <Typography>Pecho: {measurement.mediciones_antropometricas.pecho} cm</Typography>
                          <Typography>Brazo: {measurement.mediciones_antropometricas.brazo} cm</Typography>
                          <Typography>Pierna: {measurement.mediciones_antropometricas.pierna} cm</Typography>
                          <Typography>Pantorrilla: {measurement.mediciones_antropometricas.pantorrilla} cm</Typography>
                        </Box>
                      </Grid>
                    </Grid>
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
        <Box className="measurements-header">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/dashboard')}
              className="measurements-back-button"
            >
              Volver al Dashboard
            </Button>
            <Typography variant="h4" className="measurements-title">
              Gestión de Mediciones
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" className="measurements-error">
            {error}
          </Alert>
        )}

        {loading ? (
          <Box className="measurements-loading">
            <CircularProgress sx={{ color: '#2196F3' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {users.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.cedula}>
                <Card className="measurements-user-card">
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
                        startIcon={<AssessmentIcon />}
                        onClick={() => setSelectedUser(user)}
                        className="measurements-button"
                      >
                        Gestionar Mediciones
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
    <Container maxWidth="lg" className="measurements-container">
      {selectedUser ? renderMeasurementsView() : renderUsersView()}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        className="measurements-dialog"
      >
        <DialogTitle className="measurements-dialog-title">
          {selectedMeasurement ? 'Editar Medición' : 'Nueva Medición'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                type="date"
                label="Fecha de Medición"
                value={formData.fecha_medicion}
                onChange={(e) => setFormData(prev => ({...prev, fecha_medicion: e.target.value}))}
                fullWidth
              />

              <Typography variant="h6">Datos Básicos</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    type="number"
                    label="Peso (kg)"
                    value={formData.datos_basicos.peso}
                    onChange={(e) => handleInputChange('datos_basicos', 'peso', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    type="number"
                    label="Altura (cm)"
                    value={formData.datos_basicos.altura}
                    onChange={(e) => handleInputChange('datos_basicos', 'altura', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    type="number"
                    label="Edad"
                    value={formData.datos_basicos.edad}
                    onChange={(e) => handleInputChange('datos_basicos', 'edad', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    label="Sexo"
                    value={formData.datos_basicos.sexo}
                    onChange={(e) => handleInputChange('datos_basicos', 'sexo', e.target.value)}
                    fullWidth
                  >
                    <MenuItem value="masculino">Masculino</MenuItem>
                    <MenuItem value="femenino">Femenino</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Typography variant="h6">Composición Corporal</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="number"
                    label="% Grasa"
                    value={formData.composicion_corporal.grasa}
                    onChange={(e) => handleInputChange('composicion_corporal', 'grasa', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="number"
                    label="% Masa Muscular"
                    value={formData.composicion_corporal.masaMuscular}
                    onChange={(e) => handleInputChange('composicion_corporal', 'masaMuscular', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="number"
                    label="% Agua Corporal"
                    value={formData.composicion_corporal.aguaCorporal}
                    onChange={(e) => handleInputChange('composicion_corporal', 'aguaCorporal', e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Typography variant="h6">Medidas Antropométricas</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="number"
                    label="Cintura (cm)"
                    value={formData.mediciones_antropometricas.cintura}
                    onChange={(e) => handleInputChange('mediciones_antropometricas', 'cintura', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="number"
                    label="Cadera (cm)"
                    value={formData.mediciones_antropometricas.cadera}
                    onChange={(e) => handleInputChange('mediciones_antropometricas', 'cadera', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="number"
                    label="Pecho (cm)"
                    value={formData.mediciones_antropometricas.pecho}
                    onChange={(e) => handleInputChange('mediciones_antropometricas', 'pecho', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="number"
                    label="Brazo (cm)"
                    value={formData.mediciones_antropometricas.brazo}
                    onChange={(e) => handleInputChange('mediciones_antropometricas', 'brazo', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="number"
                    label="Pierna (cm)"
                    value={formData.mediciones_antropometricas.pierna}
                    onChange={(e) => handleInputChange('mediciones_antropometricas', 'pierna', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="number"
                    label="Pantorrilla (cm)"
                    value={formData.mediciones_antropometricas.pantorrilla}
                    onChange={(e) => handleInputChange('mediciones_antropometricas', 'pantorrilla', e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
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

export default MeasurementsDashboard; 