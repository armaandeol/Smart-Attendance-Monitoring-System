import { motion } from 'framer-motion';
import { Users, BookOpen, CalendarCheck, TrendingUp } from 'lucide-react';

const cardData = [
  {
    label: 'Total Classes',
    icon: BookOpen,
    gradient: 'from-blue-500 to-blue-600',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    key: 'classes',
  },
  {
    label: 'Total Students',
    icon: Users,
    gradient: 'from-emerald-500 to-emerald-600',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    key: 'students',
  },
  {
    label: 'Sessions Today',
    icon: CalendarCheck,
    gradient: 'from-cyan-500 to-cyan-600',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    key: 'sessions',
  },
  {
    label: 'Avg Attendance',
    icon: TrendingUp,
    gradient: 'from-violet-500 to-violet-600',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    key: 'avgAttendance',
  },
];

export default function StatsCards({ stats = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cardData.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -3, boxShadow: '0 16px 48px rgba(0, 0, 0, 0.25)' }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center ${card.glow}`}>
              <card.icon size={20} className="text-white" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-white/90">
            {stats[card.key] ?? '—'}
          </p>
          <p className="text-xs text-white/30 mt-1 font-story font-medium">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
