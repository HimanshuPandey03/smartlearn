import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldCheck, GraduationCap, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      const { profile } = await login(email, password);
      
      const role = profile?.role;
      const from = location.state?.from?.pathname;
      
      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'teacher') {
        navigate('/teacher', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-secondary mb-2">Welcome Back</h2>
      <p className="text-sm text-center text-slate-500 mb-6">Enter your email and password to log in</p>
      
      {error && <div className="bg-red-50 text-danger p-3 rounded-lg text-sm mb-4 border border-red-200">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input 
          label="Email Address" 
          type="email" 
          id="email"
          placeholder="your_email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div>
          <Input 
            label="Password" 
            type="password" 
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="pt-2">
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Logging in...</span> : 'Login'}
          </Button>
        </div>
      </form>
      
      <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
        Don't have an account? Please contact your institution administrator.
      </div>
    </div>
  );
};

export default LoginPage;
