import { motion, AnimatePresence } from 'framer-motion';
import { User, ScanFace, Trash2 } from 'lucide-react';

export default function StudentRoster({ students = [], onRemove, onRegisterFace }) {
  return (
    <div className="space-y-3">
      <AnimatePresence>
        {students.map((student, i) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: i * 0.03 }}
            className="glass rounded-xl p-4 flex items-center justify-between group"
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
                  <User size={18} className="text-white/30" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-white/90 font-story">{student.name}</p>
                <p className="text-xs text-white/30 font-story">Roll: {student.roll_number}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!student.face_descriptor && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onRegisterFace(student)}
                  className="px-3 py-1.5 text-xs font-story font-medium rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  Register Face
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onRemove(student.id)}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/25 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={14} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {students.length === 0 && (
        <div className="text-center py-12 text-white/25">
          <User size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-story">No students enrolled yet</p>
        </div>
      )}
    </div>
  );
}
