import React, { useState, useEffect } from 'react';
import { API_URL } from './constants';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import BottomNav from './components/shared/BottomNav';
import StartupPage from './pages/StartupPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import NotificationsPage from './pages/NotificationsPage';
import MyAddressPage from './pages/MyAddressPage';
import MyReportsPage from './pages/MyReportsPage';
import HelpPage from './pages/HelpPage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';

const SESSION_KEY = 'cleantrack.user';

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

// Component to display data fetched from your Express/MySQL backend
export function Datalist() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/`)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      {data.map((item) => (
        <div key={item.Document_ID}>
          <h3>{item.type || 'Report'}</h3>
          <p>{item.address}</p>
          <span>Status: {item.status}</span>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [initialUser] = useState(readStoredUser);
  const [screen, setScreen] = useState(() =>
    initialUser ? (initialUser.role === 'admin' ? 'admin' : 'home') : 'startup'
  );
  const [user, setUser] = useState(initialUser);

  const navigate = (to) => setScreen(to);

  const onLogin = (userData) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Could not persist the signed-in user:', error);
    }
    setUser(userData);
    navigate(userData.role === 'admin' ? 'admin' : 'home');
  };

  const onLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    navigate('login');
  };

  const showNav = ['home', 'report', 'activities', 'profile'].includes(screen);

  return (
    <ErrorBoundary>
      <div className="shell">
        <div className={showNav ? 'page' : 'page-full'} style={{ flex: 1, overflowY: 'auto' }}>
          {screen === 'startup' && <StartupPage onNavigate={navigate} />}
          {screen === 'login' && <LoginPage onNavigate={navigate} onLogin={onLogin} />}
          {screen === 'register' && <RegisterPage onNavigate={navigate} onLogin={onLogin} />}
          {screen === 'home' && <HomePage onNavigate={navigate} user={user} />}
          {screen === 'report' && <ReportPage onNavigate={navigate} />}
          {screen === 'activities' && <ActivitiesPage />}
          {screen === 'profile' && <ProfilePage user={user} onLogout={onLogout} onNavigate={navigate} />}
          {screen === 'edit-profile' && <EditProfilePage user={user} onNavigate={navigate} onUpdateUser={(u) => setUser(u)} />}
          {screen === 'change-password' && <ChangePasswordPage onNavigate={navigate} />}
          {screen === 'notifications' && <NotificationsPage onNavigate={navigate} />}
          {screen === 'my-address' && <MyAddressPage onNavigate={navigate} />}
          {screen === 'my-reports' && <MyReportsPage onNavigate={navigate} />}
          {screen === 'help' && <HelpPage onNavigate={navigate} />}
          {screen === 'about' && <AboutPage onNavigate={navigate} />}
          {screen === 'admin' && <AdminPage user={user} onNavigate={navigate} onLogout={onLogout} />}
        </div>
        {showNav && <BottomNav currentScreen={screen} onNavigate={navigate} />}
      </div>
    </ErrorBoundary>
  );
}

export default App;