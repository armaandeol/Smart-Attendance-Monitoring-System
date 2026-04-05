import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import AnimatedButton from '../ui/AnimatedButton';
import { Search, UserPlus, Link2, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AddStudentModal({ isOpen, onClose, classId, teacherId, onStudentAdded, enrolledStudentIds = [] }) {
  const [tab, setTab] = useState('search'); // 'search' | 'new'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // New student form
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Search for existing students by roll number
  useEffect(() => {
    if (tab !== 'search' || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from('students')
        .select('*')
        .or(`roll_number.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
        .limit(10);

      // Filter out already enrolled students
      const filtered = (data || []).filter(s => !enrolledStudentIds.includes(s.id));
      setSearchResults(filtered);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, tab, enrolledStudentIds]);

  const handleLinkStudent = async (student) => {
    setLoading(true);
    const { error } = await supabase
      .from('class_students')
      .insert({ class_id: classId, student_id: student.id });

    if (error) {
      alert('Failed to link student: ' + error.message);
    } else {
      onStudentAdded(student);
    }
    setLoading(false);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!name.trim() || !rollNumber.trim()) return;

    setLoading(true);

    // Check if roll number exists
    const { data: existing } = await supabase
      .from('students')
      .select('id')
      .eq('roll_number', rollNumber.trim())
      .single();

    if (existing) {
      alert('A student with this roll number already exists. Use "Search & Link" instead.');
      setLoading(false);
      return;
    }

    // Create new student
    const { data: newStudent, error } = await supabase
      .from('students')
      .insert({
        name: name.trim(),
        roll_number: rollNumber.trim(),
        email: email.trim() || null,
        registered_by: teacherId,
      })
      .select()
      .single();

    if (error) {
      alert('Failed to create student: ' + error.message);
      setLoading(false);
      return;
    }

    // Enroll in class
    await supabase
      .from('class_students')
      .insert({ class_id: classId, student_id: newStudent.id });

    onStudentAdded(newStudent);
    setName('');
    setRollNumber('');
    setEmail('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Student" size="md">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl mb-6">
        <button
          onClick={() => setTab('search')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-story font-medium transition-all ${
            tab === 'search'
              ? 'bg-white/[0.08] text-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
              : 'text-white/35 hover:text-white/60'
          }`}
        >
          <Search size={15} />
          Search & Link
        </button>
        <button
          onClick={() => setTab('new')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-story font-medium transition-all ${
            tab === 'new'
              ? 'bg-white/[0.08] text-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
              : 'text-white/35 hover:text-white/60'
          }`}
        >
          <UserPlus size={15} />
          Register New
        </button>
      </div>

      {/* Search Tab */}
      {tab === 'search' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by roll number or name..."
              className="input-dark !pl-9"
              autoFocus
            />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searching && (
              <p className="text-sm text-white/30 text-center py-4 font-story">Searching...</p>
            )}
            {!searching && searchResults.length === 0 && searchQuery && (
              <div className="text-center py-6">
                <p className="text-sm text-white/30 mb-3 font-story">No students found</p>
                <AnimatedButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setTab('new');
                    setRollNumber(searchQuery);
                  }}
                >
                  Register as New Student
                </AnimatedButton>
              </div>
            )}
            {searchResults.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    <User size={16} className="text-white/30" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90 font-story">{student.name}</p>
                    <p className="text-xs text-white/30 font-story">Roll: {student.roll_number}</p>
                  </div>
                </div>
                <AnimatedButton
                  variant="secondary"
                  size="sm"
                  icon={Link2}
                  loading={loading}
                  onClick={() => handleLinkStudent(student)}
                >
                  Link
                </AnimatedButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Student Tab */}
      {tab === 'new' && (
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2 font-story">
              Student Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter student name"
              className="input-dark"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2 font-story">
              Roll Number *
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="Enter roll number"
              className="input-dark"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2 font-story">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@email.com"
              className="input-dark"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <AnimatedButton variant="secondary" type="button" onClick={onClose}>
              Cancel
            </AnimatedButton>
            <AnimatedButton type="submit" loading={loading} icon={UserPlus}>
              Register & Enroll
            </AnimatedButton>
          </div>
        </form>
      )}
    </Modal>
  );
}
