import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Paper,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  FitnessCenter as FitnessCenterIcon,
  Assessment as AssessmentIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import '../stylesheets/stylesheet_CoachDashboard.css';

const CoachDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [userName, setUserName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://rxy1kiwphj.execute-api.us-east-2.amazonaws.com/dev/users');
        setUserCount(response.data.length);
        setUserName(localStorage.getItem('userName') || 'Coach');
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchData();
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const menuItems = [
    {
      title: 'Gestión de Usuarios',
      icon: <PeopleIcon className="menu-item-icon" />,
      path: '/users',
      description: 'Administra los usuarios del sistema',
      count: userCount,
      gradient: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    },
    {
      title: 'Rutinas',
      icon: <FitnessCenterIcon className="menu-item-icon" />,
      path: '/workouts',
      description: 'Gestiona las rutinas de ejercicios',
      gradient: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)',
    },
    {
      title: 'Mediciones',
      icon: <AssessmentIcon className="menu-item-icon" />,
      path: '/measurements',
      description: 'Registra y consulta mediciones',
      gradient: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
    },
    {
      title: 'Citas',
      icon: <EventIcon className="menu-item-icon" />,
      path: '/appointments',
      description: 'Gestiona las citas con los clientes',
      gradient: 'linear-gradient(45deg, #9C27B0 30%, #E040FB 90%)',
    },
  ];

  return (
    <Box className="dashboard-container">
      <AppBar position="static" elevation={0} className="dashboard-appbar">
        <Toolbar>
          <Typography variant="h6" component="div" className="dashboard-title">
            FitTrack
          </Typography>
          <IconButton size="large" edge="end" color="inherit" className="notification-button">
            <NotificationsIcon />
          </IconButton>
          <IconButton
            onClick={handleMenuOpen}
            size="large"
            edge="end"
            color="inherit"
          >
            <Avatar className="avatar-button">
              <PersonIcon />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 0,
              className: "menu-paper"
            }}
          >
            <div className="menu-arrow" />
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {userName}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon className="menu-icon" />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="main-content">
        <Paper elevation={0} className="welcome-container">
          <Typography variant="h4" component="h1" gutterBottom className="welcome-title">
            Bienvenido, {userName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Panel de control para gestionar usuarios, rutinas y mediciones
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {menuItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.title}>
              <Card className="dashboard-card" onClick={() => navigate(item.path)}>
                <CardContent className="card-content">
                  <Box className="card-icon-container" style={{ background: item.gradient }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom className="card-title">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  {item.count !== undefined && (
                    <Typography variant="subtitle1" color="primary" sx={{ mt: 1 }}>
                      {item.count} usuarios registrados
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default CoachDashboard; 