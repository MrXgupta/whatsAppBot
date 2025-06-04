import { useState } from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";

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
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { name, email, number, password, confirmPassword } = form;

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
            const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/signup`, form);
            console.log('Signup success:', data);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6 text-center">Sign Up</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium">Full Name</label>
                        <input name="name" value={form.name} onChange={handleChange} required className="w-full mt-1 p-2 border border-gray-300 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full mt-1 p-2 border border-gray-300 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Phone Number</label>
                        <input name="number" value={form.number} onChange={handleChange} required className="w-full mt-1 p-2 border border-gray-300 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full mt-1 p-2 border border-gray-300 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Confirm Password</label>
                        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required className="w-full mt-1 p-2 border border-gray-300 rounded" />
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">{loading ? 'Signing up...' : 'Sign Up'}</button>
                </form>
                <p className="text-sm text-center mt-4">Already have an account? <button className="text-blue-600 underline" onClick={()=>navigate('/login')}>Login</button></p>
            </div>
        </div>
    );
};

export default Signup;