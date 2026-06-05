import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from "../../api/axiosConfig";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    mot_de_passe: '',
    allergenes: '',
    kcal_max: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await API.post('/auth/register', {
        ...formData,
        kcal_max: formData.kcal_max ? parseInt(formData.kcal_max) : null,
      });
      setSuccess('Compte créé ! Redirection...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    }
  };

  return (
    <div>
      <h2>Créer un compte</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nom"
          placeholder="Nom complet"
          value={formData.nom}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="mot_de_passe"
          placeholder="Mot de passe"
          value={formData.mot_de_passe}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="allergenes"
          placeholder="Allergènes (optionnel)"
          value={formData.allergenes}
          onChange={handleChange}
        />
        <input
          type="number"
          name="kcal_max"
          placeholder="Calories max/jour (optionnel)"
          value={formData.kcal_max}
          onChange={handleChange}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <button type="submit">S'inscrire</button>
      </form>
      <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
    </div>
  );
};

export default Register;