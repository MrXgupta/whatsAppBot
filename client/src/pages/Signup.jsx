// Signup.jsx
import {useState} from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import {Eye, EyeOff} from 'lucide-react';

const Signup = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        number: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        const {name, email, number, password, confirmPassword} = form;

        if (!name || !email || !number || !password || !confirmPassword) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const {data} = await axios.post(`${import.meta.env.VITE_BASE_URL}/signup`, form);
            console.log('Signup success:', data);
            setSuccessMessage(`Signup successful! Your beta code is: ${data.betaCode}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md transition-all">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Create Beta Account</h2>

                {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
                {successMessage && (
                    <div
                        className="text-green-600 text-sm text-center mb-4 bg-green-50 p-2 rounded-lg border border-green-300">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="input-style w-full"
                            required
                        />
                    </div>

                    <div>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="input-style w-full"
                            required
                        />
                    </div>

                    <div>
                        <input
                            name="number"
                            value={form.number}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            className="input-style w-full"
                            required
                        />
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="input-style w-full pr-10"
                            required
                        />
                        <div
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            className="input-style w-full pr-10"
                            required
                        />
                        <div
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition"
                    >
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-600 mt-5">
                    Already have a code?
                    <button
                        onClick={() => navigate('/login')}
                        className="ml-1 text-blue-600 hover:underline"
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>

    );
};

export default Signup;
