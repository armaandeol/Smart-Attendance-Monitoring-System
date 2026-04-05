import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, ChevronRight } from 'lucide-react';

const accentColors = [
  { border: 'border-l-blue-400/50', icon: 'text-blue-400' },
  { border: 'border-l-emerald-400/50', icon: 'text-emerald-400' },
  { border: 'border-l-cyan-400/50', icon: 'text-cyan-400' },
  { border: 'border-l-violet-400/50', icon: 'text-violet-400' },
  { border: 'border-l-rose-400/50', icon: 'text-rose-400' },
  { border: 'border-l-amber-400/50', icon: 'text-amber-400' },
];

export default function ClassCard({ classItem, index = 0, studentCount = 0 }) {
  const navigate = useNavigate();
  const color = accentColors[index % accentColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0, 0, 0, 0.25)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/class/${classItem.id}`)}
      className={`
        glass rounded-2xl p-5 cursor-pointer
        border-l-4 ${color.border}
        group
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-serif font-semibold text-white/90 text-lg group-hover:text-blue-400 transition-colors">
            {classItem.name}
          </h3>
          {classItem.description && (
            <p className="text-xs text-white/30 mt-1 line-clamp-1 font-story">
              {classItem.description}
            </p>
          )}
        </div>
        <motion.div
          className="p-2 rounded-xl bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors"
          whileHover={{ x: 3 }}
        >
          <ChevronRight size={16} className="text-white/25 group-hover:text-blue-400" />
        </motion.div>
      </div>

      <div className="flex items-center gap-4 text-xs text-white/30 font-story">
        {classItem.schedule_time && (
          <span className="flex items-center gap-1.5">
            <Clock size={13} />
            {classItem.schedule_time}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Users size={13} />
          {studentCount} students
        </span>
      </div>
    </motion.div>
  );
}
