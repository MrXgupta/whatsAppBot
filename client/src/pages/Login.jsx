// Login.jsx
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {loginUser} from '../slices/userSlice.js';
import {useDispatch} from "react-redux";
import {Eye, EyeOff} from 'lucide-react';
import logo from "../../public/logo.svg";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [betaCode, setBetaCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password || !betaCode) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        try {
            const {data} = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`, {email, password, betaCode});
            console.log('Login success:', data);
            dispatch(loginUser(data));
            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md transition-all">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Beta Login</h2>
                <div className="flex justify-center">
                    <img className="w-[100px] hover:scale-110 transition-all" src={logo} alt=""/>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                        <div
                            className="absolute right-3 top-9 text-gray-500 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Beta Access Code</label>
                        <input
                            type="text"
                            value={betaCode}
                            onChange={(e) => setBetaCode(e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-600 mt-5">
                    Don't have an account?
                    <button
                        onClick={() => navigate('/signup')}
                        className="ml-1 text-blue-600 hover:underline"
                    >
                        Sign up
                    </button>
                </p>

                <p className="text-xs text-gray-500 text-center mt-3">
                    This is a private beta release. Contact me on Reddit (<span
                    className="font-medium">u/Gloomy-Pianist3218</span>) with your email to receive an access code.
                </p>
            </div>
        </div>
    );
};

export default Login;