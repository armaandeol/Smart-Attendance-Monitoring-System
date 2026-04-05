import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Modal from '../ui/Modal';
import AnimatedButton from '../ui/AnimatedButton';
import { Camera, Check, AlertCircle } from 'lucide-react';
import { loadModels, detectSingleFace, areModelsLoaded } from '../../lib/faceApi';
import { supabase } from '../../lib/supabase';

export default function FaceRegistrationModal({ isOpen, onClose, student, onFaceRegistered }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | capturing | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [modelsReady, setModelsReady] = useState(areModelsLoaded());

  // Load models and start camera
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function init() {
      try {
        setStatus('loading');

        if (!areModelsLoaded()) {
          await loadModels();
        }
        setModelsReady(true);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus('ready');
      } catch (err) {
        console.error('Camera init error:', err);
        setStatus('error');
        setErrorMsg('Could not access camera. Please grant permission.');
      }
    }

    init();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || status !== 'ready') return;

    setStatus('capturing');

    try {
      const result = await detectSingleFace(videoRef.current);

      if (!result) {
        setStatus('error');
        setErrorMsg('No face detected. Please position your face clearly in front of the camera.');
        setTimeout(() => setStatus('ready'), 2000);
        return;
      }

      const descriptor = Array.from(result.descriptor);

      // Save to canvas for snapshot
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);
      }

      // Update student in database
      const { error } = await supabase
        .from('students')
        .update({ face_descriptor: descriptor })
        .eq('id', student.id);

      if (error) {
        setStatus('error');
        setErrorMsg('Failed to save face data: ' + error.message);
        return;
      }

      setStatus('success');
      onFaceRegistered({ ...student, face_descriptor: descriptor });

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Capture error:', err);
      setStatus('error');
      setErrorMsg('An error occurred during face capture.');
    }
  }, [status, student, onFaceRegistered, onClose]);

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setStatus('loading');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Register Face — ${student?.name || ''}`} size="lg">
      <div className="space-y-5">
        {/* Camera Feed */}
        <div className="relative rounded-2xl overflow-hidden bg-white/[0.03] aspect-video border border-white/[0.06]">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Overlay States */}
          {status === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c1220]/90">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-full border-white/10 border-t-blue-400 mb-3"
                style={{ borderWidth: '3px' }}
              />
              <p className="text-sm text-white/30 font-story">
                {modelsReady ? 'Starting camera...' : 'Loading face recognition models...'}
              </p>
            </div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/10 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                <Check size={32} className="text-white" />
              </motion.div>
              <p className="text-lg font-serif font-semibold text-emerald-400">
                Face Registered!
              </p>
            </motion.div>
          )}

          {/* Face Guide Overlay */}
          {status === 'ready' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-60 border-2 border-dashed border-blue-400/30 rounded-[50%]" />
            </div>
          )}
        </div>

        {/* Status Message */}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-story"
          >
            <AlertCircle size={16} />
            {errorMsg}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-white/30 font-story">
            {status === 'ready' && 'Position face clearly in the frame and click Capture'}
            {status === 'capturing' && 'Analyzing face...'}
          </p>
          <div className="flex gap-3">
            <AnimatedButton variant="secondary" onClick={handleClose}>
              Cancel
            </AnimatedButton>
            <AnimatedButton
              icon={Camera}
              onClick={handleCapture}
              disabled={status !== 'ready'}
              loading={status === 'capturing'}
            >
              Capture Face
            </AnimatedButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}
