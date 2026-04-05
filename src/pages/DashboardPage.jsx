import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Plus, Search, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import StatsCards from '../components/dashboard/StatsCards';
import ClassCard from '../components/dashboard/ClassCard';
import CreateClassModal from '../components/dashboard/CreateClassModal';
import AnimatedButton from '../components/ui/AnimatedButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';

export default function DashboardPage() {
  const { user } = useUser();
  const toast = useToast();
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load teacher and data
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      setLoading(true);

      // Get teacher record
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('*')
        .eq('clerk_id', user.id)
        .single();

      if (!teacherData) {
        setLoading(false);
        return;
      }

      setTeacher(teacherData);

      // Load classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacherData.id)
        .order('created_at', { ascending: false });

      setClasses(classesData || []);

      // Get student counts per class
      if (classesData && classesData.length > 0) {
        const counts = {};
        for (const cls of classesData) {
          const { count } = await supabase
            .from('class_students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);
          counts[cls.id] = count || 0;
        }
        setStudentCounts(counts);
      }

      // Get total unique students
      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('registered_by', teacherData.id);

      // Get today's sessions
      const today = new Date().toISOString().split('T')[0];
      const { count: todaySessions } = await supabase
        .from('sessions')
        .select('*, classes!inner(*)', { count: 'exact', head: true })
        .eq('classes.teacher_id', teacherData.id)
        .gte('started_at', today);

      setStats({
        classes: classesData?.length || 0,
        students: totalStudents || 0,
        sessions: todaySessions || 0,
        avgAttendance: '—',
      });

      setLoading(false);
    }

    loadData();
  }, [user]);

  const handleCreateClass = async (classData) => {
    if (!teacher) return;

    const { data, error } = await supabase
      .from('classes')
      .insert({
        ...classData,
        teacher_id: teacher.id,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create class: ' + error.message);
      return;
    }

    setClasses(prev => [data, ...prev]);
    setStudentCounts(prev => ({ ...prev, [data.id]: 0 }));
    setStats(prev => ({ ...prev, classes: (prev.classes || 0) + 1 }));
    toast.success('Class created successfully!');
  };

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Classes Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white/90">Your Classes</h2>
          <p className="text-sm text-white/30 mt-0.5 font-story">Manage and start class sessions</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search classes..."
              className="input-dark !pl-9 w-full sm:w-64"
            />
          </div>
          <AnimatedButton
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            New Class
          </AnimatedButton>
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls, i) => (
            <ClassCard
              key={cls.id}
              classItem={cls}
              index={i}
              studentCount={studentCounts[cls.id] || 0}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-blue-400" />
          </div>
          <h3 className="font-serif font-semibold text-white/90 text-lg mb-1">
            {search ? 'No classes found' : 'No classes yet'}
          </h3>
          <p className="text-sm text-white/30 mb-6 font-story">
            {search ? 'Try a different search term' : 'Create your first class to get started'}
          </p>
          {!search && (
            <AnimatedButton icon={Plus} onClick={() => setShowCreateModal(true)}>
              Create Class
            </AnimatedButton>
          )}
        </motion.div>
      )}

      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateClass}
      />
    </div>
  );
}
