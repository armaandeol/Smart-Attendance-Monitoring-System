import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Users,
  GraduationCap,
  BookOpen,
  Trash2,
  Edit3,
  Search,
  Eye,
  EyeOff,
  ArrowLeft,
  ScanFace,
  Link2,
  Save,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AnimatedButton from '../components/ui/AnimatedButton';
import GlassCard from '../components/ui/GlassCard';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ADMIN_PASSWORD = 'Armaansingh@2004';

export default function AdminDashPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const [activeTab, setActiveTab] = useState('teachers');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit modals
  const [editStudent, setEditStudent] = useState(null);
  const [editClass, setEditClass] = useState(null);
  const [linkModal, setLinkModal] = useState(null);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    loadAllData();
  }, [authenticated]);

  async function loadAllData() {
    setLoading(true);

    const [teacherRes, studentRes, classRes] = await Promise.all([
      supabase.from('teachers').select('*').order('created_at', { ascending: false }),
      supabase.from('students').select('*').order('created_at', { ascending: false }),
      supabase.from('classes').select('*, teachers(full_name)').order('created_at', { ascending: false }),
    ]);

    setTeachers(teacherRes.data || []);
    setStudents(studentRes.data || []);
    setClasses(classRes.data || []);
    setLoading(false);
  }

  // --- Password Gate ---
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4">
        {/* Ambient glow */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/[0.06] rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/[0.04] rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-2xl rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.5)] border border-white/[0.06] p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <Shield size={28} className="text-white" />
            </div>
            <h1 className="font-serif font-bold text-2xl text-white/90">Admin Access</h1>
            <p className="text-sm text-white/30 mt-1 font-story">Enter the admin password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
                placeholder="Enter admin password"
                className={`input-dark !pl-10 !pr-12 ${passwordError ? '!border-rose-500/40 ring-1 ring-rose-500/20' : ''}`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {passwordError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-400 font-story font-medium"
              >
                Incorrect password. Please try again.
              </motion.p>
            )}

            <AnimatedButton type="submit" className="w-full" size="lg" icon={Shield}>
              Access Admin Panel
            </AnimatedButton>
          </form>

          <button
            onClick={() => navigate('/')}
            className="mt-6 flex items-center gap-2 text-xs text-white/25 hover:text-white/60 transition-colors mx-auto font-story"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  // --- Admin Panel ---
  const filteredTeachers = teachers.filter(t =>
    t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  );
  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Delete this student? This will remove them from all classes.')) return;
    await supabase.from('students').delete().eq('id', id);
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Delete this class? All sessions and enrollments will be lost.')) return;
    await supabase.from('classes').delete().eq('id', id);
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Delete this teacher? Their classes will also be deleted.')) return;
    await supabase.from('teachers').delete().eq('id', id);
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('students')
      .update({
        name: editStudent.name,
        roll_number: editStudent.roll_number,
        email: editStudent.email,
      })
      .eq('id', editStudent.id);

    if (!error) {
      setStudents(prev => prev.map(s => s.id === editStudent.id ? { ...s, ...editStudent } : s));
      setEditStudent(null);
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('classes')
      .update({
        name: editClass.name,
        schedule_time: editClass.schedule_time,
        description: editClass.description,
      })
      .eq('id', editClass.id);

    if (!error) {
      setClasses(prev => prev.map(c => c.id === editClass.id ? { ...c, ...editClass } : c));
      setEditClass(null);
    }
  };

  const tabs = [
    { key: 'teachers', label: 'Teachers', icon: GraduationCap, count: teachers.length },
    { key: 'students', label: 'Students', icon: Users, count: students.length },
    { key: 'classes', label: 'Classes', icon: BookOpen, count: classes.length },
  ];

  return (
    <div className="min-h-screen bg-[#060a14]">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-blue-500/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-violet-500/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-white/90">Admin Dashboard</h1>
              <p className="text-xs text-white/30 font-story">Manage teachers, students, and classes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AnimatedButton variant="ghost" size="sm" icon={RefreshCw} onClick={loadAllData}>
              Refresh
            </AnimatedButton>
            <AnimatedButton variant="secondary" size="sm" onClick={() => navigate('/')}>
              Exit Admin
            </AnimatedButton>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        {loading ? (
          <LoadingSpinner size="lg" text="Loading data..." />
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {tabs.map((tab) => (
                <motion.div
                  key={tab.key}
                  whileHover={{ y: -2 }}
                  onClick={() => setActiveTab(tab.key)}
                  className={`glass rounded-2xl p-5 cursor-pointer transition-all ${
                    activeTab === tab.key ? 'ring-2 ring-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : ''
                  }`}
                >
                  <tab.icon size={22} className={activeTab === tab.key ? 'text-blue-400' : 'text-white/30'} />
                  <p className="text-2xl font-serif font-bold text-white/90 mt-2">{tab.count}</p>
                  <p className="text-xs text-white/30 font-story">{tab.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="input-dark !pl-9"
              />
            </div>

            {/* Teachers Tab */}
            {activeTab === 'teachers' && (
              <div className="space-y-3">
                {filteredTeachers.map((teacher) => (
                  <motion.div
                    key={teacher.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {teacher.avatar_url ? (
                        <img src={teacher.avatar_url} className="w-10 h-10 rounded-xl object-cover" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                          <GraduationCap size={18} className="text-white/30" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-white/90 font-story">{teacher.full_name}</p>
                        <p className="text-xs text-white/30 font-story">{teacher.email}</p>
                      </div>
                    </div>
                    <AnimatedButton variant="ghost" size="sm" icon={Trash2} onClick={() => handleDeleteTeacher(teacher.id)}>
                      Remove
                    </AnimatedButton>
                  </motion.div>
                ))}
                {filteredTeachers.length === 0 && (
                  <p className="text-center py-12 text-white/25 text-sm font-story">No teachers found</p>
                )}
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        student.face_descriptor
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_0_16px_rgba(16,185,129,0.2)]'
                          : 'bg-white/[0.06]'
                      }`}>
                        {student.face_descriptor ? (
                          <ScanFace size={18} className="text-white" />
                        ) : (
                          <Users size={18} className="text-white/30" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/90 font-story">{student.name}</p>
                        <p className="text-xs text-white/30 font-story">Roll: {student.roll_number} {student.email && `• ${student.email}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        icon={Edit3}
                        onClick={() => setEditStudent({ ...student })}
                      >
                        Edit
                      </AnimatedButton>
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        Delete
                      </AnimatedButton>
                    </div>
                  </motion.div>
                ))}
                {filteredStudents.length === 0 && (
                  <p className="text-center py-12 text-white/25 text-sm font-story">No students found</p>
                )}
              </div>
            )}

            {/* Classes Tab */}
            {activeTab === 'classes' && (
              <div className="space-y-3">
                {filteredClasses.map((cls) => (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white/90 font-story">{cls.name}</p>
                      <p className="text-xs text-white/30 font-story">
                        Teacher: {cls.teachers?.full_name || 'Unknown'}
                        {cls.schedule_time && ` • ${cls.schedule_time}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        icon={Link2}
                        onClick={() => setLinkModal({ classId: cls.id, className: cls.name })}
                      >
                        Link Student
                      </AnimatedButton>
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        icon={Edit3}
                        onClick={() => setEditClass({ ...cls })}
                      >
                        Edit
                      </AnimatedButton>
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteClass(cls.id)}
                      >
                        Delete
                      </AnimatedButton>
                    </div>
                  </motion.div>
                ))}
                {filteredClasses.length === 0 && (
                  <p className="text-center py-12 text-white/25 text-sm font-story">No classes found</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      <Modal isOpen={!!editStudent} onClose={() => setEditStudent(null)} title="Edit Student">
        {editStudent && (
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2 font-story">Name</label>
              <input
                type="text"
                value={editStudent.name}
                onChange={(e) => setEditStudent(prev => ({ ...prev, name: e.target.value }))}
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2 font-story">Roll Number</label>
              <input
                type="text"
                value={editStudent.roll_number}
                onChange={(e) => setEditStudent(prev => ({ ...prev, roll_number: e.target.value }))}
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2 font-story">Email</label>
              <input
                type="email"
                value={editStudent.email || ''}
                onChange={(e) => setEditStudent(prev => ({ ...prev, email: e.target.value }))}
                className="input-dark"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <AnimatedButton variant="secondary" type="button" onClick={() => setEditStudent(null)}>Cancel</AnimatedButton>
              <AnimatedButton type="submit" icon={Save}>Save Changes</AnimatedButton>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Class Modal */}
      <Modal isOpen={!!editClass} onClose={() => setEditClass(null)} title="Edit Class">
        {editClass && (
          <form onSubmit={handleUpdateClass} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2 font-story">Class Name</label>
              <input
                type="text"
                value={editClass.name}
                onChange={(e) => setEditClass(prev => ({ ...prev, name: e.target.value }))}
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2 font-story">Schedule Time</label>
              <input
                type="text"
                value={editClass.schedule_time || ''}
                onChange={(e) => setEditClass(prev => ({ ...prev, schedule_time: e.target.value }))}
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2 font-story">Description</label>
              <textarea
                value={editClass.description || ''}
                onChange={(e) => setEditClass(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="input-dark resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <AnimatedButton variant="secondary" type="button" onClick={() => setEditClass(null)}>Cancel</AnimatedButton>
              <AnimatedButton type="submit" icon={Save}>Save Changes</AnimatedButton>
            </div>
          </form>
        )}
      </Modal>

      {/* Link Student to Class Modal */}
      <LinkStudentModal
        isOpen={!!linkModal}
        onClose={() => setLinkModal(null)}
        classId={linkModal?.classId}
        className={linkModal?.className}
        allStudents={students}
      />
    </div>
  );
}

// --- Link Student Sub-component ---
function LinkStudentModal({ isOpen, onClose, classId, className, allStudents }) {
  const [search, setSearch] = useState('');
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !classId) return;
    loadEnrolled();
  }, [isOpen, classId]);

  async function loadEnrolled() {
    const { data } = await supabase
      .from('class_students')
      .select('student_id')
      .eq('class_id', classId);
    setEnrolled((data || []).map(d => d.student_id));
  }

  const filtered = allStudents.filter(s =>
    (s.name.toLowerCase().includes(search.toLowerCase()) ||
     s.roll_number.toLowerCase().includes(search.toLowerCase())) &&
    !enrolled.includes(s.id)
  );

  const handleLink = async (studentId) => {
    setLoading(true);
    await supabase.from('class_students').insert({ class_id: classId, student_id: studentId });
    setEnrolled(prev => [...prev, studentId]);
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Link Student to ${className || 'Class'}`}>
      <div className="space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name or roll number..."
            className="input-dark !pl-9"
            autoFocus
          />
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filtered.map(student => (
            <div key={student.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04]">
              <div>
                <p className="text-sm font-semibold text-white/90 font-story">{student.name}</p>
                <p className="text-xs text-white/30 font-story">Roll: {student.roll_number}</p>
              </div>
              <AnimatedButton variant="secondary" size="sm" icon={Link2} loading={loading} onClick={() => handleLink(student.id)}>
                Link
              </AnimatedButton>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center py-8 text-sm text-white/25 font-story">
              {search ? 'No matching students found' : 'All students are already enrolled'}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
