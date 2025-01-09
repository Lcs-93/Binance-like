import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup({ onSignupSuccess }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const generateUniqueId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${timestamp}-${random}`;
  };

  const handleSignup = () => {
    setErrorMessage(''); 

    if (!username || !email || !password) {
      setErrorMessage('Veuillez remplir tous les champs.');
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage('L\'email n\'est pas valide.');
      return;
    }

    if (!passwordRegex.test(password)) {
      setErrorMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.');
      return;
    }

    const newUser = { 
      id: generateUniqueId(),
      username, 
      email, 
      password,
      cash: 0,
      cryptos: {}
    };
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(user => user.email === email)) {
      setErrorMessage('Un compte existe déjà avec cet email.');
      return;
    }
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    localStorage.setItem('activeUser', JSON.stringify(newUser));
    
    onSignupSuccess();
    navigate('/home'); 
  };

  return (
    <div className="flex justify-center items-center h-screen #181a20">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl text-white text-center mb-6">Inscription</h1>
        <div className="mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Pseudo"
            className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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

        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}

        <button
          onClick={handleSignup}
          className="w-full py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          S'inscrire
        </button>
        <div className="text-center mt-4">
          <p className="text-gray-400">
            Vous avez déjà un compte ?{' '}
            <button
              onClick={() => navigate('/')}
              className="text-blue-500 hover:underline"
            >
              Connectez-vous ici
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
