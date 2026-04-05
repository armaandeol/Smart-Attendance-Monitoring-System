import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import {
  ScanFace,
  Users,
  BarChart3,
  Shield,
  Camera,
  Clock,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  Sparkles,
  Zap,
  Eye,
  FileDown,
  Fingerprint,
  GraduationCap,
  Timer,
  X,
  BookOpen,
  Brain,
} from 'lucide-react';
import AnimatedButton from '../components/ui/AnimatedButton';

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] },
  }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: (d = 0) => ({
    opacity: 1,
    transition: { duration: 1, delay: d },
  }),
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (d = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay: d, ease: [0.22, 1, 0.36, 1] },
  }),
};
const slideFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: (d = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] },
  }),
};
const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: (d = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── chapter content ─── */
const painPoints = [
  { icon: BookOpen, text: 'Manual roll calls eating 10+ minutes per class' },
  { icon: X, text: 'Paper registers lost, damaged, or tampered with' },
  { icon: Timer, text: 'Hours wasted compiling weekly attendance reports' },
  { icon: Users, text: 'Proxy attendance going completely undetected' },
];

const journeySteps = [
  {
    num: '01',
    title: 'Create Your Classroom',
    desc: 'Set up your class with a name and schedule in seconds. Your digital classroom is ready instantly.',
    icon: GraduationCap,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-400/30',
    glow: 'rgba(59, 130, 246, 0.08)',
  },
  {
    num: '02',
    title: 'Register Every Face',
    desc: 'Students look at the camera once. The AI learns their unique features — no external server involved.',
    icon: Camera,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-400/30',
    glow: 'rgba(16, 185, 129, 0.08)',
  },
  {
    num: '03',
    title: 'Start a Live Session',
    desc: 'Open your device camera and watch as faces are recognized in real-time. Attendance marks itself.',
    icon: Eye,
    gradient: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-400/30',
    glow: 'rgba(139, 92, 246, 0.08)',
  },
  {
    num: '04',
    title: 'Export Beautiful Reports',
    desc: 'Download detailed PDF or CSV reports with a single click. Share with administration effortlessly.',
    icon: FileDown,
    gradient: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-400/30',
    glow: 'rgba(245, 158, 11, 0.08)',
  },
];

const transformations = [
  { before: '10+ min roll call', after: '<1 second recognition', icon: Clock },
  { before: 'Paper-based records', after: '100% digital & searchable', icon: BarChart3 },
  { before: 'Manual report compiling', after: 'One-click PDF export', icon: FileDown },
  { before: 'No verification possible', after: 'AI-powered face matching', icon: Shield },
];

/* ─── reusable chapter label ─── */
function ChapterLabel({ children, color = 'text-primary-500' }) {
  return (
    <motion.span
      variants={fadeUp}
      custom={0}
      className={`inline-block font-story text-xs font-semibold uppercase tracking-[0.25em] ${color} mb-6`}
    >
      {children}
    </motion.span>
  );
}

/* ─── glowing orb backdrop component ─── */
function GlowOrbs({ colors = [] }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {colors.map((c, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-3xl ${c}`}
          style={{
            width: `${220 + i * 100}px`,
            height: `${220 + i * 100}px`,
            top: `${10 + i * 20}%`,
            left: i % 2 === 0 ? `${5 + i * 15}%` : 'auto',
            right: i % 2 !== 0 ? `${5 + i * 12}%` : 'auto',
            animation: `float ${6 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/*                  LANDING PAGE                   */
/* ═══════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.96]);

  return (
    <div className="min-h-screen bg-[#05080f] text-white overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <ScanFace size={19} className="text-white" />
              </div>
              <span className="font-serif font-bold text-lg text-white/90 tracking-tight">SmartAttend</span>
            </div>
            <div className="flex items-center gap-3">
              <SignedOut>
                <AnimatedButton variant="ghost" size="sm" onClick={() => navigate('/sign-in')} className="!text-white/60 hover:!text-white hover:!bg-white/10">
                  Sign In
                </AnimatedButton>
                <AnimatedButton variant="primary" size="sm" onClick={() => navigate('/sign-up')} iconRight={ArrowRight}>
                  Get Started
                </AnimatedButton>
              </SignedOut>
              <SignedIn>
                <AnimatedButton variant="primary" size="sm" onClick={() => navigate('/dashboard')} iconRight={ArrowRight}>
                  Dashboard
                </AnimatedButton>
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════ */}
      {/* CHAPTER 1 — THE OPENING (Hero)              */}
      {/* ════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-24">
        <GlowOrbs colors={['bg-blue-600/15', 'bg-cyan-500/10', 'bg-violet-600/10', 'bg-rose-500/8']} />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 text-center max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-blue-400/20 bg-blue-500/10 backdrop-blur-sm text-blue-300 text-sm font-story font-medium mb-8">
              <Sparkles size={14} className="text-blue-400" />
              Reimagining Attendance for the Modern Classroom
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.15}
            className="font-serif font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-8"
          >
            <span className="text-white/90">The Last</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              Roll Call
            </span>
            <br />
            <span className="text-white/90 italic font-medium text-[0.65em]">You'll Ever Take</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.3}
            className="font-story text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            One camera. Zero hardware. Your browser becomes an AI-powered 
            attendance system that recognises every face in under a second.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.45} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <SignedOut>
              <AnimatedButton size="xl" onClick={() => navigate('/sign-up')} iconRight={ArrowRight}>
                Begin Your Story
              </AnimatedButton>
              <AnimatedButton variant="secondary" size="xl" onClick={() => navigate('/sign-in')} className="!bg-white/5 !text-white/80 !border-white/10 hover:!bg-white/10">
                Sign In
              </AnimatedButton>
            </SignedOut>
            <SignedIn>
              <AnimatedButton size="xl" onClick={() => navigate('/dashboard')} iconRight={ArrowRight}>
                Go to Dashboard
              </AnimatedButton>
            </SignedIn>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={0.8}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs font-story text-white/25 uppercase tracking-widest">Scroll to discover</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowDown size={18} className="text-white/20" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* CHAPTER 2 — THE PROBLEM                     */}
      {/* ════════════════════════════════════════════ */}
      <StorySection className="bg-[#080c16]">
        <GlowOrbs colors={['bg-rose-600/8', 'bg-amber-500/6']} />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — editorial copy */}
            <motion.div
              variants={slideFromLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              <ChapterLabel color="text-rose-400">Chapter I — The Problem</ChapterLabel>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white/90 leading-tight mb-6">
                Attendance is <span className="italic text-rose-300">broken</span>.
              </h2>
              <p className="font-story text-lg text-white/45 leading-relaxed mb-8">
                Every day, thousands of teachers around the world lose precious teaching time to an
                outdated ritual — the manual roll call. Paper registers pile up, proxy attendance
                goes undetected, and compiling reports becomes an endless chore.
              </p>
              <p className="font-story text-base text-white/35 leading-relaxed">
                What if the classroom itself could know who walked in?
              </p>
            </motion.div>

            {/* Right — pain point cards */}
            <div className="space-y-4">
              {painPoints.map((p, i) => (
                <motion.div
                  key={i}
                  variants={slideFromRight}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  custom={i * 0.12}
                  className="flex items-center gap-4 p-5 rounded-2xl border border-rose-500/10 bg-rose-500/[0.04] backdrop-blur-xl group hover:border-rose-400/20 hover:bg-rose-500/[0.07] transition-all duration-500"
                >
                  <div className="w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500/15 transition-colors">
                    <p.icon size={20} className="text-rose-400/70" />
                  </div>
                  <span className="font-story text-white/60 text-[15px] leading-snug">{p.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </StorySection>

      {/* ════════════════════════════════════════════ */}
      {/* CHAPTER 3 — THE SOLUTION                    */}
      {/* ════════════════════════════════════════════ */}
      <StorySection className="bg-[#060a14]">
        <GlowOrbs colors={['bg-blue-600/10', 'bg-cyan-500/8', 'bg-violet-500/6']} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <ChapterLabel color="text-cyan-400">Chapter II — The Vision</ChapterLabel>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white/90 leading-tight mb-8">
              What if your camera could take{' '}
              <span className="italic bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                attendance for you
              </span>
              ?
            </h2>
            <p className="font-story text-lg text-white/45 max-w-3xl mx-auto leading-relaxed mb-16">
              SmartAttend uses the device you already have — your laptop, tablet, or phone camera — 
              and turns it into an AI recognition system. Everything runs in your browser. 
              No servers. No uploads. No privacy concerns.
            </p>
          </motion.div>

          {/* Stats row — glass cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { value: '<1s', label: 'Face Recognition', icon: Zap, color: 'from-blue-500/20 to-cyan-500/20', borderColor: 'border-blue-400/15' },
              { value: '100%', label: 'Browser-Based', icon: Shield, color: 'from-emerald-500/20 to-teal-500/20', borderColor: 'border-emerald-400/15' },
              { value: '0', label: 'External APIs', icon: Fingerprint, color: 'from-violet-500/20 to-purple-500/20', borderColor: 'border-violet-400/15' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.15}
                className={`relative rounded-3xl p-8 border ${stat.borderColor} bg-gradient-to-br ${stat.color} backdrop-blur-xl group hover:scale-[1.03] transition-transform duration-500`}
              >
                <div className="absolute inset-0 rounded-3xl bg-white/[0.02]" />
                <stat.icon size={28} className="text-white/30 mx-auto mb-4 group-hover:text-white/50 transition-colors" />
                <p className="font-serif text-4xl md:text-5xl font-bold text-white/90 mb-2">{stat.value}</p>
                <p className="font-story text-sm text-white/40 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </StorySection>

      {/* ════════════════════════════════════════════ */}
      {/* CHAPTER 4 — THE JOURNEY (How It Works)      */}
      {/* ════════════════════════════════════════════ */}
      <StorySection className="bg-[#070b15]">
        <GlowOrbs colors={['bg-blue-600/8', 'bg-emerald-500/6', 'bg-violet-500/6']} />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-20"
          >
            <ChapterLabel>Chapter III — The Journey</ChapterLabel>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white/90 leading-tight mb-6">
              Four steps to <span className="italic text-blue-300">effortless</span> attendance
            </h2>
            <p className="font-story text-lg text-white/40 max-w-2xl mx-auto">
              From setup to your first report — it takes less than five minutes.
            </p>
          </motion.div>

          {/* Steps — alternating layout */}
          <div className="space-y-8 md:space-y-12">
            {journeySteps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={i % 2 === 0 ? slideFromLeft : slideFromRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={0.1}
                className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Number + Icon card */}
                <div className={`flex-shrink-0 w-full md:w-72 h-48 rounded-3xl border ${step.border} bg-gradient-to-br ${step.gradient} backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden group`}>
                  <div className="absolute inset-0 bg-white/[0.02]" />
                  <span className="font-mono text-6xl font-bold text-white/[0.07] absolute -top-2 -right-1">{step.num}</span>
                  <step.icon size={40} className="text-white/40 mb-3 group-hover:text-white/60 transition-colors duration-500 relative z-10" />
                  <span className="font-mono text-sm text-white/30 uppercase tracking-widest relative z-10">Step {step.num}</span>
                </div>

                {/* Copy */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-white/85 mb-3">{step.title}</h3>
                  <p className="font-story text-base text-white/40 leading-relaxed max-w-lg">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </StorySection>

      {/* ════════════════════════════════════════════ */}
      {/* CHAPTER 5 — THE TRANSFORMATION              */}
      {/* ════════════════════════════════════════════ */}
      <StorySection className="bg-[#080c16]">
        <GlowOrbs colors={['bg-emerald-500/8', 'bg-cyan-500/6']} />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <ChapterLabel color="text-emerald-400">Chapter IV — The Transformation</ChapterLabel>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white/90 leading-tight mb-6">
              Before <span className="text-white/30">&</span> After
            </h2>
            <p className="font-story text-lg text-white/40 max-w-2xl mx-auto">
              See how SmartAttend transforms every aspect of attendance management.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {transformations.map((t, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.1}
                className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-6 group hover:border-emerald-500/15 hover:bg-emerald-500/[0.03] transition-all duration-500"
              >
                <t.icon size={22} className="text-white/20 mb-5 group-hover:text-emerald-400/60 transition-colors" />
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-story text-sm text-rose-400/60 line-through">{t.before}</span>
                  <ArrowRight size={14} className="text-white/20" />
                </div>
                <p className="font-story text-lg font-medium text-emerald-300/80">{t.after}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </StorySection>

      {/* ════════════════════════════════════════════ */}
      {/* CHAPTER 6 — FEATURES MOSAIC                 */}
      {/* ════════════════════════════════════════════ */}
      <StorySection className="bg-[#060a14]">
        <GlowOrbs colors={['bg-blue-600/8', 'bg-violet-500/6', 'bg-cyan-500/6']} />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <ChapterLabel color="text-violet-400">Chapter V — The Details</ChapterLabel>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white/90 leading-tight mb-6">
              Built for <span className="italic text-violet-300">real</span> classrooms
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Camera, title: 'Face Registration', desc: 'Register student faces directly from the browser camera with one-click capture.', gradient: 'from-blue-500/15 to-cyan-500/15', border: 'border-blue-400/10' },
              { icon: ScanFace, title: 'Real-time Recognition', desc: 'Instantly recognize and mark attendance using advanced face recognition AI.', gradient: 'from-cyan-500/15 to-teal-500/15', border: 'border-cyan-400/10' },
              { icon: Users, title: 'Class Management', desc: 'Create classes, enroll students, and manage your teaching schedule effortlessly.', gradient: 'from-emerald-500/15 to-green-500/15', border: 'border-emerald-400/10' },
              { icon: BarChart3, title: 'Attendance Reports', desc: 'Export detailed attendance records as PDF or CSV with one click.', gradient: 'from-purple-500/15 to-violet-500/15', border: 'border-purple-400/10' },
              { icon: Shield, title: 'Secure & Private', desc: 'All face processing happens in your browser. No data sent to external servers.', gradient: 'from-rose-500/15 to-pink-500/15', border: 'border-rose-400/10' },
              { icon: Brain, title: 'Smart AI Engine', desc: 'State-of-the-art face matching with high-accuracy results in under a second.', gradient: 'from-amber-500/15 to-orange-500/15', border: 'border-amber-400/10' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.08}
                className={`rounded-3xl p-6 border ${f.border} bg-gradient-to-br ${f.gradient} backdrop-blur-xl group hover:scale-[1.02] hover:border-white/10 transition-all duration-500`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-5 group-hover:bg-white/[0.1] transition-all duration-500">
                  <f.icon size={22} className="text-white/40 group-hover:text-white/70 transition-colors" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-white/80 mb-2">{f.title}</h3>
                <p className="font-story text-sm text-white/35 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </StorySection>

      {/* ════════════════════════════════════════════ */}
      {/* FINALE — THE CALL TO ACTION                 */}
      {/* ════════════════════════════════════════════ */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        <GlowOrbs colors={['bg-blue-600/15', 'bg-cyan-500/12', 'bg-violet-600/10']} />
        {/* Radial gradient center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.08)_0%,_transparent_70%)]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center px-6"
        >
          <ChapterLabel color="text-blue-400">The Beginning</ChapterLabel>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white/90 leading-tight mb-6">
            Your classroom's story starts{' '}
            <span className="italic bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">here</span>.
          </h2>
          <p className="font-story text-lg text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed">
            Join educators who've reclaimed their teaching time with intelligent,
            privacy-first attendance that simply works.
          </p>

          <SignedOut>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <AnimatedButton size="xl" onClick={() => navigate('/sign-up')} iconRight={ArrowRight}>
                Create Free Account
              </AnimatedButton>
              <AnimatedButton variant="secondary" size="xl" onClick={() => navigate('/sign-in')} className="!bg-white/5 !text-white/80 !border-white/10 hover:!bg-white/10">
                Sign In
              </AnimatedButton>
            </div>
          </SignedOut>
          <SignedIn>
            <AnimatedButton size="xl" onClick={() => navigate('/dashboard')} iconRight={ArrowRight}>
              Go to Dashboard
            </AnimatedButton>
          </SignedIn>

          {/* Trust markers */}
          <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.3} className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/20">
            {[
              { icon: CheckCircle, text: 'Free to start' },
              { icon: Shield, text: 'Privacy-first' },
              { icon: Zap, text: 'Works offline' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm font-story">
                <item.icon size={16} />
                {item.text}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative border-t border-white/[0.05] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ScanFace size={17} className="text-blue-400/60" />
            <span className="font-serif text-sm text-white/30">SmartAttend</span>
          </div>
          <p className="font-story text-xs text-white/20">
            © {new Date().getFullYear()} Smart Attendance System. Built with ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Story Section wrapper (consistent padding + inView) ─── */
function StorySection({ children, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className={`relative py-28 md:py-36 overflow-hidden ${className}`}>
      {children}
    </section>
  );
}
