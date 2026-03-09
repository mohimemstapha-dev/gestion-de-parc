import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className='container-fluid vh-100 d-flex justify-content-center align-items-center bg-light'>
      <div className='card shadow-lg border-0' style={{ width: '420px', borderRadius: '15px' }}>
        <div className='card-body p-5'>
          <h3 className='text-center fw-bold mb-4'>Login</h3>
          {error && <div className='alert alert-danger py-2'>{error}</div>}
          <form onSubmit={handleLogin}>
            <div className='mb-3'>
              <label className='form-label fw-semibold'>Email</label>
              <input type='email' className='form-control form-control-lg' placeholder='Enter your email' value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className='mb-4'>
              <label className='form-label fw-semibold'>Password</label>
              <input type='password' className='form-control form-control-lg' placeholder='Enter your password' value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className='d-grid mb-3'>
              <button type='submit' className='btn btn-primary btn-lg'>Se connecter</button>
            </div>
            <div className='text-center'>
              Pas encore de compte ? <Link to='/register'>S'inscrire</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
