import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setLoading(true);
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.email === email && storedUser.password === password) {
      setTimeout(() => {
        navigate('/home'); // Redirige vers la page home
      }, 500);
    } else {
      setTimeout(() => {
        alert('Identifiants incorrects');
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen #181a20">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl text-white text-center mb-6">Connexion</h1>
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className={`w-full py-3 ${loading ? 'bg-gray-400' : 'bg-blue-600'} text-white font-bold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          {loading ? 'Chargement...' : 'Se connecter'}
        </button>
        <div className="text-center mt-4">
          <p className="text-gray-400">
            Vous n'avez pas de compte ?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-500 hover:underline"
            >
              Inscrivez-vous ici
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

