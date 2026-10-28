import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      setLoading(true);
      await resetPassword(email);
      setMessage('Password reset link sent! Check your inbox.');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to send reset link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-secondary mb-4">Reset Password</h2>
      <p className="text-center text-slate-600 mb-6 text-sm">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      {error && <div className="bg-red-50 text-danger p-3 rounded-lg text-sm mb-4">{error}</div>}
      {message && <div className="bg-green-50 text-success p-3 rounded-lg text-sm mb-4">{message}</div>}

      <form className="space-y-4" onSubmit={handleReset}>
        <Input 
          label="Email Address" 
          type="email" 
          id="email"
          placeholder="student@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" fullWidth disabled={loading}>
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Sending...</span> : 'Send Reset Link'}
        </Button>
      </form>
      <div className="mt-6 text-center text-sm">
        <Link to="/login" className="text-primary hover:underline font-medium">Back to Login</Link>
      </div>
    </div>
  );
}
