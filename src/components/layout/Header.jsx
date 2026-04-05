import { UserButton, useUser } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const pageTitles = {
  '/dashboard': 'Dashboard',
};

export default function Header() {
  const { user } = useUser();
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.startsWith('/class/')) {
      return 'Class Details';
    }
    return pageTitles[location.pathname] || 'Smart Attendance';
  };

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.06]"
    >
      <div>
        <h1 className="text-xl font-serif font-bold text-white/90">
          {getTitle()}
        </h1>
        <p className="text-xs text-white/25 mt-0.5 font-story">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="text-right mr-2 hidden sm:block">
            <p className="text-sm font-semibold text-white/80 font-story">
              {user.fullName || user.firstName}
            </p>
            <p className="text-xs text-white/30 font-story">Teacher</p>
          </div>
        )}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'w-9 h-9 ring-2 ring-white/10',
            },
          }}
        />
      </div>
    </motion.header>
  );
}
