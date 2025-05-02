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
  InputAdornment,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const API_BASE_URL = 'https://rxy1kiwphj.execute-api.us-east-2.amazonaws.com/dev';

const generateRandomPin = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    sexo: 'M',
    pin: '',
    rol: 'cliente',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        cedula: user.cedula,
        nombre: user.nombre,
        sexo: user.sexo || 'M',
        pin: user.pin || '',
        rol: user.rol,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        cedula: '',
        nombre: '',
        sexo: 'M',
        pin: generateRandomPin(),
        rol: 'cliente',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      cedula: '',
      nombre: '',
      sexo: 'M',
      pin: '',
      rol: 'cliente',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGeneratePin = () => {
    setFormData(prev => ({
      ...prev,
      pin: generateRandomPin()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let userData;
      
      if (selectedUser) {
        userData = formData;
        await axios.patch(`${API_BASE_URL}/users/${selectedUser.cedula}`, userData);
      } else {
        userData = {
          ...formData,
          pin: formData.pin
        };
        await axios.post(`${API_BASE_URL}/users`, userData);
      }
      
      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      setError('Error al guardar el usuario');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (cedula) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await axios.delete(`${API_BASE_URL}/users/${cedula}`);
        fetchUsers();
      } catch (err) {
        setError('Error al eliminar el usuario');
        console.error('Error:', err);
      }
    }
  };

  const getSexoDisplay = (sexo) => {
    return sexo === 'M' ? 'Masculino' : 'Femenino';
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
            Gestión de Usuarios
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
          Nuevo Usuario
        </Button>
      </Box>

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
                  <TableCell sx={{ fontWeight: 'bold', color: '#2196F3' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2196F3' }}>Sexo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2196F3' }}>Rol</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2196F3' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user.cedula}
                    sx={{ 
                      '&:hover': {
                        background: 'rgba(33, 150, 243, 0.04)',
                      },
                    }}
                  >
                    <TableCell>{user.cedula}</TableCell>
                    <TableCell>{user.nombre}</TableCell>
                    <TableCell>{user.sexo}</TableCell>
                    <TableCell>{user.rol}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        onClick={() => handleOpenDialog(user)} 
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
                        onClick={() => handleDelete(user.cedula)} 
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
          {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Cédula"
                name="cedula"
                value={formData.cedula}
                onChange={handleInputChange}
                required
                disabled={!!selectedUser}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#2196F3',
                    },
                  },
                }}
              />
              <TextField
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#2196F3',
                    },
                  },
                }}
              />
              <TextField
                select
                label="Sexo"
                name="sexo"
                value={formData.sexo}
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
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Femenino</MenuItem>
              </TextField>
              <TextField
                select
                label="Rol"
                name="rol"
                value={formData.rol}
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
                <MenuItem value="cliente">Cliente</MenuItem>
                <MenuItem value="coach">Coach</MenuItem>
              </TextField>
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

export default UserManagement; 