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
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import esLocale from 'date-fns/locale/es';

const API_BASE_URL = 'https://rxy1kiwphj.execute-api.us-east-2.amazonaws.com/dev';

const AppointmentManagement = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    cedula: '',
    fecha: new Date(),
    hora: '00:00'
  });
  const [users, setUsers] = useState([]);
  const [searchCedula, setSearchCedula] = useState('');

  useEffect(() => {
    if (searchCedula) {
      fetchAppointmentsByClient(searchCedula);
    } else {
      fetchAppointments();
    }
    fetchUsers();
  }, [searchCedula]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/Appointments`);
      setAppointments(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar las citas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentsByClient = async (cedula) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/appointments-by-client/${cedula}`);
      setAppointments(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar las citas del cliente');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data.filter(user => user.rol === 'cliente'));
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      const [year, month, day] = appointment.fecha.split('-');
      const [hours, minutes] = appointment.hora.split(':');
      const appointmentDate = new Date(year, month - 1, day, hours, minutes);
      
      setFormData({
        cedula: appointment.cedula,
        fecha: appointmentDate,
        hora: appointment.hora
      });
    } else {
      setSelectedAppointment(null);
      setFormData({
        cedula: '',
        fecha: new Date(),
        hora: '00:00'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
    setFormData({
      cedula: '',
      fecha: new Date(),
      hora: '00:00'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        fecha: date
      }));
    }
  };

  const validateDateTime = (date, time) => {
    const now = new Date();
    const appointmentDateTime = new Date(date);
    const [hours, minutes] = time.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return appointmentDateTime > now;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateDateTime(formData.fecha, formData.hora)) {
      setError('La fecha y hora deben ser futuras');
      return;
    }

    try {
      const year = formData.fecha.getFullYear();
      const month = String(formData.fecha.getMonth() + 1).padStart(2, '0');
      const day = String(formData.fecha.getDate()).padStart(2, '0');
      const hours = String(formData.fecha.getHours()).padStart(2, '0');
      const minutes = String(formData.fecha.getMinutes()).padStart(2, '0');

      const appointmentData = {
        cedula: formData.cedula,
        fecha: `${year}-${month}-${day}`,
        hora: `${hours}:${minutes}`
      };

      if (selectedAppointment) {
        await axios.patch(`${API_BASE_URL}/Appointments/${selectedAppointment._id}`, appointmentData);
      } else {
        await axios.post(`${API_BASE_URL}/Appointments`, appointmentData);
      }
      
      fetchAppointments();
      handleCloseDialog();
    } catch (err) {
      setError('Error al guardar la cita');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      try {
        await axios.delete(`${API_BASE_URL}/Appointments/${id}`);
        fetchAppointments();
      } catch (err) {
        setError('Error al eliminar la cita');
        console.error('Error:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(Date.UTC(year, month - 1, day));
    
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC'
    };
    return date.toLocaleDateString('es-ES', options);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        p: 3,
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#2196F3',
              '&:hover': {
                background: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            Volver al Dashboard
          </Button>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              color: 'white',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Gestión de Citas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ 
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#2196F3',
            '&:hover': {
              background: 'rgba(255, 255, 255, 1)',
            },
          }}
        >
          Nueva Cita
        </Button>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            label="Buscar por cédula de cliente"
            variant="outlined"
            value={searchCedula}
            onChange={(e) => setSearchCedula(e.target.value)}
            placeholder="Ingrese la cédula del cliente"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#2196F3',
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => setSearchCedula('')}
            disabled={!searchCedula}
            sx={{ 
              minWidth: '200px',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white !important',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
              },
              '&.Mui-disabled': {
                color: 'white !important',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                opacity: 0.7,
              },
            }}
          >
            Mostrar todas las citas
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          {error}
        </Alert>
      )}

      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress sx={{ color: '#2196F3' }} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2196F3' }}>Cédula</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2196F3' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2196F3' }}>Hora</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2196F3' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow 
                    key={appointment._id}
                    sx={{ 
                      '&:hover': {
                        background: 'rgba(33, 150, 243, 0.04)',
                      },
                    }}
                  >
                    <TableCell>{appointment.cedula}</TableCell>
                    <TableCell>{formatDate(appointment.fecha)}</TableCell>
                    <TableCell>{appointment.hora}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        onClick={() => handleOpenDialog(appointment)} 
                        sx={{ 
                          color: '#2196F3',
                          '&:hover': {
                            background: 'rgba(33, 150, 243, 0.1)',
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(appointment._id)} 
                        sx={{ 
                          color: '#f44336',
                          '&:hover': {
                            background: 'rgba(244, 67, 54, 0.1)',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          fontWeight: 'bold',
        }}>
          {selectedAppointment ? 'Editar Cita' : 'Nueva Cita'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                select
                label="Cliente"
                name="cedula"
                value={formData.cedula}
                onChange={handleInputChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#2196F3',
                    },
                  },
                }}
              >
                {users.map((user) => (
                  <MenuItem key={user.cedula} value={user.cedula}>
                    {user.nombre} - {user.cedula}
                  </MenuItem>
                ))}
              </TextField>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
                <DateTimePicker
                  label="Fecha y Hora"
                  value={formData.fecha}
                  onChange={handleDateChange}
                  minDateTime={new Date()}
                  format="dd/MM/yyyy HH:mm"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#2196F3',
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseDialog}
              sx={{ 
                color: '#666',
                '&:hover': {
                  background: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
                },
              }}
            >
              Guardar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default AppointmentManagement; 