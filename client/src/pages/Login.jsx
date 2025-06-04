import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loginUser } from '../slices/userSlice.js'
import {useDispatch} from "react-redux";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`, { email, password });
            console.log('Login success:', data);
            navigate('/');
            // localStorage.setItem('user', JSON.stringify(data));
            dispatch(loginUser(data));
        } catch (err) {
            setError(err.response?.data?.error );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mt-1 p-2 border border-gray-300 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full mt-1 p-2 border border-gray-300 rounded" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"> {loading ? 'Logging in...' : 'Login'}</button>
                </form>
                <p className="text-sm text-center mt-4">Don't have an account? <button className="text-blue-600 underline" onClick={()=>navigate("/signup")}>Sign up</button></p>
            </div>
        </div>
    );
};

export default Login;