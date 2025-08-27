import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { loginUser } from '../api/auth';
import { useAuth } from '../context/useAuth';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate(); // Redirect ke liye hook
    const { setAuthUser } = useAuth(); // Context se state update function lein

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await loginUser(formData.email, formData.password);

            // 1. User data ko localStorage mein save karein
            localStorage.setItem('pinger-user', JSON.stringify(data.data));

            // 2. Context state ko update karein
            setAuthUser(data.data);

            // 3. User ko Dashboard par redirect karein
            navigate('/');

        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    // Baaki JSX same rahega...
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Login to Pinger</h2>
                <form onSubmit={handleLogin}>
                    {/* Email Input */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                        <input
                            type="email" id="email"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com" value={formData.email} onChange={handleChange} required
                        />
                    </div>
                    {/* Password Input */}
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <input
                            type="password" id="password"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••" value={formData.password} onChange={handleChange} required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    {/* Submit Button */}
                    <button type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-400 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-400 hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;