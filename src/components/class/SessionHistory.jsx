import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Download, FileText } from 'lucide-react';
import AnimatedButton from '../ui/AnimatedButton';
import { exportSessionCSV, exportSessionPDF } from '../../lib/exportUtils';

export default function SessionHistory({ sessions = [], classStudents = [], className = '' }) {
  const handleExportCSV = async (session) => {
    await exportSessionCSV(session, classStudents, className);
  };

  const handleExportPDF = async (session) => {
    await exportSessionPDF(session, classStudents, className);
  };

  return (
    <div className="space-y-3">
      {sessions.map((session, i) => {
        const startDate = new Date(session.started_at);
        const endDate = session.ended_at ? new Date(session.ended_at) : null;
        const attendanceCount = session.attendance?.length || 0;

        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  session.status === 'active'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_0_16px_rgba(16,185,129,0.2)]'
                    : 'bg-white/[0.06]'
                }`}>
                  <Calendar size={18} className={session.status === 'active' ? 'text-white' : 'text-white/30'} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90 font-story flex items-center gap-2">
                    {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {session.status === 'active' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                        Active
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-white/30 mt-0.5 font-story">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      {endDate && ` — ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {attendanceCount} present
                    </span>
                  </div>
                </div>
              </div>

              {session.status === 'ended' && (
                <div className="flex items-center gap-2">
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    icon={FileText}
                    onClick={() => handleExportCSV(session)}
                  >
                    CSV
                  </AnimatedButton>
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    icon={Download}
                    onClick={() => handleExportPDF(session)}
                  >
                    PDF
                  </AnimatedButton>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {sessions.length === 0 && (
        <div className="text-center py-12 text-white/25">
          <Calendar size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-story">No sessions yet</p>
        </div>
      )}
    </div>
  );
}
