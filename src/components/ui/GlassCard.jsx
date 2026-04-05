import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  accent,
  onClick,
  ...props
}) {
  const accentClasses = {
    blue: 'border-l-4 !border-l-blue-500/50',
    green: 'border-l-4 !border-l-emerald-500/50',
    red: 'border-l-4 !border-l-rose-500/50',
    cyan: 'border-l-4 !border-l-cyan-500/50',
    yellow: 'border-l-4 !border-l-amber-500/50',
    purple: 'border-l-4 !border-l-violet-500/50',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 16px 48px rgba(0, 0, 0, 0.25)' } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`
        glass rounded-2xl p-6
        ${accent ? accentClasses[accent] || '' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
