import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  UserPlus,
  Users,
  Calendar,
  Clock,
  Trash2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import StudentRoster from '../components/class/StudentRoster';
import AddStudentModal from '../components/class/AddStudentModal';
import FaceRegistrationModal from '../components/class/FaceRegistrationModal';
import SessionHistory from '../components/class/SessionHistory';

export default function ClassDetailPage() {
  const { classId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const toast = useToast();

  const [classData, setClassData] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [faceRegStudent, setFaceRegStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'sessions'

  useEffect(() => {
    if (!user) return;
    loadClassData();
  }, [user, classId]);

  async function loadClassData() {
    setLoading(true);

    // Get teacher
    const { data: teacherData } = await supabase
      .from('teachers')
      .select('*')
      .eq('clerk_id', user.id)
      .single();

    setTeacher(teacherData);

    // Get class
    const { data: cls } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    setClassData(cls);

    // Get enrolled students
    const { data: enrollments } = await supabase
      .from('class_students')
      .select('*, students(*)')
      .eq('class_id', classId);

    const enrolledStudents = (enrollments || []).map(e => e.students).filter(Boolean);
    setStudents(enrolledStudents);

    // Get sessions with attendance
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('*, attendance(*)')
      .eq('class_id', classId)
      .order('started_at', { ascending: false });

    setSessions(sessionsData || []);
    setLoading(false);
  }

  const handleStartSession = async () => {
    if (students.length === 0) {
      toast.warning('Enroll at least one student before starting a session.');
      return;
    }

    const studentsWithFaces = students.filter(s => s.face_descriptor);
    if (studentsWithFaces.length === 0) {
      toast.warning('No students have registered faces. Register at least one face first.');
      return;
    }

    // Create session
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({ class_id: classId, status: 'active' })
      .select()
      .single();

    if (error) {
      toast.error('Failed to start session: ' + error.message);
      return;
    }

    // Navigate to live session
    navigate(`/class/${classId}/session`, {
      state: { sessionId: session.id, students, className: classData.name },
    });
  };

  const handleRemoveStudent = async (studentId) => {
    const { error } = await supabase
      .from('class_students')
      .delete()
      .eq('class_id', classId)
      .eq('student_id', studentId);

    if (error) {
      toast.error('Failed to remove student');
      return;
    }

    setStudents(prev => prev.filter(s => s.id !== studentId));
    toast.success('Student removed from class');
  };

  const handleStudentAdded = (student) => {
    setStudents(prev => [...prev, student]);
    toast.success(`${student.name} enrolled in class!`);
  };

  const handleFaceRegistered = (updatedStudent) => {
    setStudents(prev =>
      prev.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    );
    toast.success(`Face registered for ${updatedStudent.name}!`);
    setFaceRegStudent(null);
  };

  const handleDeleteClass = async () => {
    if (!window.confirm('Are you sure you want to delete this class? This cannot be undone.')) return;

    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (error) {
      toast.error('Failed to delete class');
      return;
    }
    toast.success('Class deleted');
    navigate('/dashboard');
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading class..." />;
  }

  if (!classData) {
    return (
      <div className="text-center py-20">
        <p className="text-white/30 font-story">Class not found</p>
        <AnimatedButton variant="secondary" className="mt-4" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </AnimatedButton>
      </div>
    );
  }

  const studentsWithFaces = students.filter(s => s.face_descriptor).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-sm text-white/30 hover:text-white/70 transition-colors font-story"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </motion.button>

      {/* Class Header */}
      <GlassCard hover={false} className="!p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-white/90">
              {classData.name}
            </h1>
            {classData.description && (
              <p className="text-sm text-white/40 mt-1 font-story">{classData.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-white/30 font-story">
              {classData.schedule_time && (
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  {classData.schedule_time}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users size={13} />
                {students.length} students ({studentsWithFaces} with face data)
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {sessions.length} sessions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AnimatedButton
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleDeleteClass}
            >
              Delete
            </AnimatedButton>
            <AnimatedButton
              variant="success"
              size="lg"
              icon={Play}
              onClick={handleStartSession}
            >
              Start Class
            </AnimatedButton>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.03] backdrop-blur rounded-xl w-fit border border-white/[0.06]">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-story font-medium transition-all ${
            activeTab === 'students'
              ? 'bg-white/[0.08] text-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
              : 'text-white/35 hover:text-white/60'
          }`}
        >
          <Users size={15} />
          Students ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-story font-medium transition-all ${
            activeTab === 'sessions'
              ? 'bg-white/[0.08] text-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
              : 'text-white/35 hover:text-white/60'
          }`}
        >
          <Calendar size={15} />
          Sessions ({sessions.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'students' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-white/30 font-story">
              {studentsWithFaces} of {students.length} students have registered faces
            </p>
            <AnimatedButton
              size="sm"
              icon={UserPlus}
              onClick={() => setShowAddStudent(true)}
            >
              Add Student
            </AnimatedButton>
          </div>
          <StudentRoster
            students={students}
            onRemove={handleRemoveStudent}
            onRegisterFace={(student) => setFaceRegStudent(student)}
          />
        </div>
      )}

      {activeTab === 'sessions' && (
        <SessionHistory
          sessions={sessions}
          classStudents={students}
          className={classData.name}
        />
      )}

      {/* Modals */}
      <AddStudentModal
        isOpen={showAddStudent}
        onClose={() => setShowAddStudent(false)}
        classId={classId}
        teacherId={teacher?.id}
        onStudentAdded={handleStudentAdded}
        enrolledStudentIds={students.map(s => s.id)}
      />

      {faceRegStudent && (
        <FaceRegistrationModal
          isOpen={!!faceRegStudent}
          onClose={() => setFaceRegStudent(null)}
          student={faceRegStudent}
          onFaceRegistered={handleFaceRegistered}
        />
      )}
    </div>
  );
}
