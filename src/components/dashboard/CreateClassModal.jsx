import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../ui/Modal';
import AnimatedButton from '../ui/AnimatedButton';
import { BookOpen, Clock, ChevronDown } from 'lucide-react';

// Generate time slots from 6:00 AM to 10:00 PM in 30-min intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 6; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const label = `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
      const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      slots.push({ label, value });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

function TimeDropdown({ value, onChange, label, excludeBefore }) {
  const [open, setOpen] = useState(false);

  const selectedSlot = TIME_SLOTS.find(s => s.value === value);

  // Filter: if excludeBefore is set, only show times after it
  const filteredSlots = excludeBefore
    ? TIME_SLOTS.filter(s => s.value > excludeBefore)
    : TIME_SLOTS;

  return (
    <div className="relative flex-1">
      <label className="block text-xs font-semibold text-white/40 mb-1.5 font-story uppercase tracking-wider">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-left transition-all hover:bg-white/[0.06] focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
      >
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-white/25" />
          <span className={`text-sm font-story ${selectedSlot ? 'text-white/90' : 'text-white/25'}`}>
            {selectedSlot ? selectedSlot.label : 'Select time'}
          </span>
        </div>
        <ChevronDown size={14} className={`text-white/25 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 right-0 mt-1.5 max-h-52 overflow-y-auto rounded-xl bg-[#0e1628]/98 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.5)] py-1"
          >
            {filteredSlots.map((slot) => (
              <button
                key={slot.value}
                type="button"
                onClick={() => {
                  onChange(slot.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm font-story transition-colors ${
                  slot.value === value
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'text-white/70 hover:bg-white/[0.06] hover:text-white/90'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-away overlay */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}

export default function CreateClassModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-clear endTime if startTime changes and endTime is before startTime
  const handleStartTimeChange = (val) => {
    setStartTime(val);
    if (endTime && endTime <= val) {
      setEndTime('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Build schedule_time string from the two dropdowns
    let scheduleTime = '';
    if (startTime) {
      const startSlot = TIME_SLOTS.find(s => s.value === startTime);
      const endSlot = TIME_SLOTS.find(s => s.value === endTime);
      scheduleTime = startSlot
        ? endSlot
          ? `${startSlot.label} — ${endSlot.label}`
          : startSlot.label
        : '';
    }

    setLoading(true);
    await onSubmit({
      name: name.trim(),
      schedule_time: scheduleTime,
      description: description.trim(),
    });
    setLoading(false);
    setName('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    onClose();
  };

  // Format preview
  const startLabel = TIME_SLOTS.find(s => s.value === startTime)?.label;
  const endLabel = TIME_SLOTS.find(s => s.value === endTime)?.label;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Class">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-2 font-story">
            Class Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mathematics 101"
            className="input-dark"
            required
          />
        </div>

        {/* Time Range Selector */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-3 font-story">
            Schedule Time
          </label>
          <div className="flex items-end gap-3">
            <TimeDropdown
              label="From"
              value={startTime}
              onChange={handleStartTimeChange}
            />
            <div className="pb-3 text-white/20 font-story text-sm">to</div>
            <TimeDropdown
              label="To"
              value={endTime}
              onChange={setEndTime}
              excludeBefore={startTime}
            />
          </div>

          {/* Preview chip */}
          {startLabel && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-story font-medium"
            >
              <Clock size={12} />
              {startLabel}{endLabel ? ` — ${endLabel}` : ''}
            </motion.div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-white/70 mb-2 font-story">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a brief description..."
            rows={3}
            className="input-dark resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <AnimatedButton variant="secondary" type="button" onClick={onClose}>
            Cancel
          </AnimatedButton>
          <AnimatedButton
            type="submit"
            loading={loading}
            icon={BookOpen}
          >
            Create Class
          </AnimatedButton>
        </div>
      </form>
    </Modal>
  );
}
