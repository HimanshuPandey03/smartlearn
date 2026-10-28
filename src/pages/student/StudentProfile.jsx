import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api';
import { User, Mail, Phone, ShieldCheck, KeyRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const StudentProfile = () => {
  const { userProfile } = useAuth();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!userProfile) return null;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      return setErrorMsg('New password and confirmation do not match.');
    }

    if (newPassword.length < 6) {
      return setErrorMsg('New password must be at least 6 characters long.');
    }

    try {
      setLoading(true);
      const res = await authAPI.changePassword(currentPassword, newPassword);
      if (res.success) {
        setSuccessMsg(res.message || 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">My Profile & Settings</h1>
        <p className="text-slate-600">View your account details and update your login password.</p>
      </div>

      {/* Profile Card */}
      <Card className="p-6 md:p-8 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b border-slate-100">
          <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold uppercase shadow-sm">
            {userProfile.name?.charAt(0) || 'U'}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-secondary">{userProfile.name}</h2>
            <p className="text-slate-500 capitalize font-medium">{userProfile.role}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-700">
              <User className="text-primary w-5 h-5" />
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Full Name</p>
                <p className="font-medium">{userProfile.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-slate-700">
              <Mail className="text-primary w-5 h-5" />
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Email Address</p>
                <p className="font-medium">{userProfile.email}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-700">
              <ShieldCheck className="text-primary w-5 h-5" />
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Account Role</p>
                <p className="font-medium capitalize">{userProfile.role}</p>
              </div>
            </div>

            
          </div>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card className="p-6 md:p-8 bg-white border border-slate-200">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
            <KeyRound size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-secondary">Change Password</h2>
            <p className="text-xs text-slate-500">Update the initial password provided by the institution to your own secret password.</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-sm">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 text-danger rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <Input
            label="Current / Initial Password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Min. 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Updating Password...
                </span>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StudentProfile;
