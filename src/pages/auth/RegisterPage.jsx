import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'student',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    try {
      setLoading(true);
      const { profile } = await register(formData.email, formData.password, {
        name: formData.fullName,
        role: formData.role,
        phone: formData.phone || null
      });

      if (profile?.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-secondary mb-2">Create an Account</h2>
      <p className="text-sm text-center text-slate-500 mb-6">Register your account in MySQL</p>

      {error && <div className="bg-red-50 text-danger p-3 rounded-lg text-sm mb-4 border border-red-200">{error}</div>}
      
      <form onSubmit={handleRegister} className="space-y-4">
        <Input 
          label="Full Name" 
          type="text" 
          id="fullName"
          placeholder="e.g. John Doe"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <Input 
          label="Email Address" 
          type="email" 
          id="email"
          placeholder="student@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
            Account Role
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white"
          >
            <option value="student">Student (Take Quizzes & View Notes)</option>
            <option value="teacher">Teacher (Upload Quizzes & Notes)</option>
          </select>
        </div>

        <Input 
          label="Password" 
          type="password" 
          id="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Input 
          label="Confirm Password" 
          type="password" 
          id="confirmPassword"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        
        <div className="pt-2">
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Creating account...</span> : 'Register'}
          </Button>
        </div>
      </form>
      
      <div className="mt-6 text-center text-sm text-slate-600">
        Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Login here</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
