import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { adminAPI } from '@/services/api';
import { 
  Users, UserCheck, ShieldCheck, Upload, Plus, 
  Trash2, Download, FileSpreadsheet, Loader2, X, AlertCircle, CheckCircle2 
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add Teacher Modal
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [savingTeacher, setSavingTeacher] = useState(false);

  // Excel Import Modal
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers(selectedRole !== 'all' ? selectedRole : '');
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  // Create Teacher
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!teacherName || !teacherEmail || !teacherPassword) {
      return setError('Please fill all teacher details.');
    }

    try {
      setSavingTeacher(true);
      const res = await adminAPI.createTeacher({
        name: teacherName,
        email: teacherEmail,
        password: teacherPassword,
      });

      if (res.success) {
        setSuccessMsg(`Teacher account for "${teacherName}" created successfully!`);
        setIsTeacherModalOpen(false);
        setTeacherName('');
        setTeacherEmail('');
        setTeacherPassword('');
        fetchUsers();
      }
    } catch (err) {
      setError(err.message || 'Failed to create teacher.');
    } finally {
      setSavingTeacher(false);
    }
  };

  // Import Students via Excel
  const handleImportExcel = async (e) => {
    e.preventDefault();
    setError('');
    setImportResult(null);

    if (!excelFile) {
      return setError('Please select an Excel (.xlsx/.xls) or CSV file.');
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', excelFile);

      const res = await adminAPI.importStudentsExcel(formData);
      if (res.success) {
        setImportResult(res);
        setSuccessMsg(`Imported ${res.importedCount} student(s) successfully!`);
        fetchUsers();
      }
    } catch (err) {
      setError(err.message || 'Failed to import students from file.');
    } finally {
      setImporting(false);
    }
  };

  // Download Sample CSV Template
  const downloadSampleTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Email,Password\n" + 
      "Aman Gupta,aman.gupta@student.com,Student@123\n" + 
      "Pooja Verma,pooja.verma@student.com,Student@123\n" + 
      "Rohit Patil,rohit.patil@student.com,Student@123\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "smartlearn_students_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete User
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name} (${user.role})?`)) return;
    try {
      await adminAPI.deleteUser(user.id);
      setUsers(users.filter(u => u.id !== user.id));
      setSuccessMsg(`User ${user.name} removed successfully.`);
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">User & Access Management</h1>
          <p className="text-slate-600">Provide teacher access and batch-onboard students using Excel / CSV sheets.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => { setError(''); setSuccessMsg(''); setImportResult(null); setExcelFile(null); setIsExcelModalOpen(true); }}
            className="flex items-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <FileSpreadsheet size={16} />
            <span>Import Students (Excel)</span>
          </Button>

          <Button 
            onClick={() => { setError(''); setSuccessMsg(''); setIsTeacherModalOpen(true); }}
            className="flex items-center gap-2 text-xs"
          >
            <Plus size={16} />
            <span>Add Teacher</span>
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-danger rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          {['all', 'student', 'teacher', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                selectedRole === role 
                  ? 'bg-primary text-white shadow-xs' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {role === 'all' ? 'All Users' : `${role}s`}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing {users.length} registered user(s)
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-white border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-xs">Loading users from MySQL...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No users registered under this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-secondary flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'teacher' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role === 'admin' ? <ShieldCheck size={14} /> : u.role === 'teacher' ? <UserCheck size={14} /> : <Users size={14} />}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'teacher' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Delete user"
                          className="p-1 text-slate-400 hover:text-danger rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Teacher Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setIsTeacherModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <UserCheck size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-secondary">Grant Teacher Access</h2>
                <p className="text-xs text-slate-500">Only Admin can create teacher accounts.</p>
              </div>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <Input
                label="Teacher Full Name"
                placeholder="e.g. Dr. Rajesh Sharma"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                required
              />

              <Input
                label="Teacher Email Address"
                type="email"
                placeholder="teacher@institution.edu"
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
                required
              />

              <Input
                label="Initial Password"
                type="password"
                placeholder="Min 6 characters"
                value={teacherPassword}
                onChange={(e) => setTeacherPassword(e.target.value)}
                required
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsTeacherModalOpen(false)}
                  disabled={savingTeacher}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={savingTeacher}>
                  {savingTeacher ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Creating...
                    </span>
                  ) : (
                    'Create Teacher Account'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import Students Modal */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 relative max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setIsExcelModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <FileSpreadsheet size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-secondary">Batch Import Students via Excel</h2>
                <p className="text-xs text-slate-500">Upload a spreadsheet containing student names, emails & passwords.</p>
              </div>
            </div>

            {/* Template Download Hint */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs mb-4">
              <div>
                <span className="font-semibold text-primary">Need the Excel column format?</span>
                <p className="text-slate-600 text-[11px]">Columns required: <strong>Name, Email, Password</strong> (Password is optional, defaults to Student@123).</p>
              </div>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="px-2.5 py-1 bg-white border border-blue-200 text-primary font-bold rounded hover:bg-blue-100 flex items-center gap-1 shrink-0"
              >
                <Download size={13} />
                <span>Download Sample</span>
              </button>
            </div>

            {importResult ? (
              <div className="space-y-4 overflow-y-auto flex-1">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>Successfully Created {importResult.importedCount} Student Accounts!</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Students can now log in using these credentials and change their passwords in their Profile.
                  </p>
                </div>

                {importResult.imported?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-secondary text-xs uppercase tracking-wider mb-2">Imported Student Logins:</h3>
                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b">
                          <tr>
                            <th className="p-2">Name</th>
                            <th className="p-2">Login Email</th>
                            <th className="p-2">Initial Password</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {importResult.imported.map((st) => (
                            <tr key={st.id}>
                              <td className="p-2 font-medium">{st.name}</td>
                              <td className="p-2 text-slate-600">{st.email}</td>
                              <td className="p-2 font-mono text-primary font-bold">{st.initialPassword}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {importResult.skipped?.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    <strong>Skipped {importResult.skippedCount} row(s):</strong>
                    <ul className="list-disc list-inside mt-1 text-[11px] text-amber-700">
                      {importResult.skipped.map((sk, idx) => (
                        <li key={idx}>{sk.email || 'Row'}: {sk.reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-3 border-t flex justify-end">
                  <Button onClick={() => setIsExcelModalOpen(false)}>Done</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleImportExcel} className="space-y-4">
                <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50 hover:bg-slate-50">
                  <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-sm font-semibold text-primary hover:underline">Choose .xlsx or .csv file</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={(e) => setExcelFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    {excelFile ? <strong className="text-secondary">{excelFile.name}</strong> : 'Supports Microsoft Excel (.xlsx/.xls) and CSV'}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsExcelModalOpen(false)}
                    disabled={importing}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={importing || !excelFile}>
                    {importing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        Importing Students...
                      </span>
                    ) : (
                      'Upload & Create Accounts'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
