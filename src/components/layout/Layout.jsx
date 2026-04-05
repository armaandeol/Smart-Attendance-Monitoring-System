import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import Sidebar from './Sidebar';
import Header from './Header';
import { ToastProvider } from '../ui/Toast';
import { supabase } from '../../lib/supabase';

export default function Layout() {
  const { user } = useUser();

  // Sync Clerk user to teachers table on first login
  useEffect(() => {
    async function syncTeacher() {
      if (!user) return;

      const { data: existing } = await supabase
        .from('teachers')
        .select('id')
        .eq('clerk_id', user.id)
        .single();

      if (!existing) {
        await supabase.from('teachers').insert({
          clerk_id: user.id,
          full_name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.primaryEmailAddress?.emailAddress || '',
          avatar_url: user.imageUrl || '',
        });
      }
    }

    syncTeacher();
  }, [user]);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#060a14]">
        {/* Subtle ambient glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/[0.03] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/[0.03] rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-violet-500/[0.02] rounded-full blur-[100px]" />
        </div>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <Header />
          <main className="flex-1 p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
