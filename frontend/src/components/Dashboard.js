import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/user');
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout failed', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div className='container mt-5'>Chargement...</div>;

  return (
    <div className='container mt-5'>
      <div className='card shadow'>
        <div className='card-body'>
          <h2 className='card-title'>Tableau de Bord</h2>
          <hr />
          <p><strong>Bienvenue, {user.name} {user.prenom} !</strong></p>
          <p>Email: {user.email}</p>
          <p>Rôle: <span className='badge bg-info'>{user.role}</span></p>
          <button className='btn btn-danger mt-3' onClick={handleLogout}>Se déconnecter</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
