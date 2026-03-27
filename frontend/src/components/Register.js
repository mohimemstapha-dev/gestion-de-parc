import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const MAX_FIELD_LENGTH = 20;

function Register() {
    const [name, setName] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== passwordConfirmation) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }
        try {
            await api.post('/register', {
                name,
                prenom,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
        }
    };

    return (
        <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-light">
            <div className="card shadow-lg border-0" style={{ width: '450px', borderRadius: '15px' }}>
                <div className="card-body p-5">
                    <h3 className="text-center fw-bold mb-4">Inscription</h3>
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    <form onSubmit={handleRegister}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Nom</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={MAX_FIELD_LENGTH}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Prénom</label>
                            <input
                                type="text"
                                className="form-control"
                                value={prenom}
                                onChange={(e) => setPrenom(e.target.value)}
                                maxLength={MAX_FIELD_LENGTH}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                maxLength={MAX_FIELD_LENGTH}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Mot de passe</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                maxLength={MAX_FIELD_LENGTH}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-semibold">Confirmer le mot de passe</label>
                            <input
                                type="password"
                                className="form-control"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                maxLength={MAX_FIELD_LENGTH}
                                required
                            />
                        </div>
                        <div className="d-grid mb-3">
                            <button type="submit" className="btn btn-success btn-lg">S'inscrire</button>
                        </div>
                        <div className="text-center">
                            Déjà un compte ? <Link to="/login">Se connecter</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
