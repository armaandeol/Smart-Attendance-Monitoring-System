import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Camera,
  CameraOff,
  StopCircle,
  Users,
  CheckCircle,
  XCircle,
  ScanFace,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  loadModels,
  detectAllFaces,
  createFaceMatcher,
  drawDetections,
  areModelsLoaded,
} from '../lib/faceApi';
import AnimatedButton from '../components/ui/AnimatedButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function LiveSessionPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { sessionId, students: initialStudents, className } = location.state || {};

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceMatcherRef = useRef(null);
  const animFrameRef = useRef(null);
  const isProcessingRef = useRef(false);

  const [status, setStatus] = useState('loading'); // loading | ready | detecting | ended | error
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [cameraActive, setCameraActive] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [students, setStudents] = useState(initialStudents || []);
  const [fps, setFps] = useState(0);
  const [detectedCount, setDetectedCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const startTimeRef = useRef(Date.now());
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() });

  // Initialize models and camera
  useEffect(() => {
    if (!sessionId) {
      navigate(`/class/${classId}`);
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        setStatusMessage('Loading face recognition models...');
        console.log('[LiveSession] Loading models...');

        if (!areModelsLoaded()) {
          await loadModels();
        }
        console.log('[LiveSession] Models loaded successfully');

        if (cancelled) return;

        setStatusMessage('Preparing face matcher...');
        const studentsWithFaces = students.filter(s => s.face_descriptor);
        console.log(`[LiveSession] ${studentsWithFaces.length} students with face data`);

        if (studentsWithFaces.length > 0) {
          const matcher = createFaceMatcher(
            studentsWithFaces.map(s => ({
              name: s.name,
              id: s.id,
              descriptor: s.face_descriptor,
            })),
            0.6
          );
          faceMatcherRef.current = matcher;
          console.log('[LiveSession] Face matcher created');
        } else {
          console.log('[LiveSession] No students with face data — detection only mode');
          faceMatcherRef.current = null;
        }

        if (cancelled) return;

        setStatusMessage('Starting camera...');
        console.log('[LiveSession] Requesting camera access...');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        console.log('[LiveSession] Camera stream obtained');

        const video = videoRef.current;
        if (!video) {
          console.error('[LiveSession] Video element not found');
          setErrorMsg('Video element not found. Please refresh the page.');
          setStatus('error');
          return;
        }

        video.srcObject = stream;

        await new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            console.log(`[LiveSession] Video ready: ${video.videoWidth}x${video.videoHeight}`);
            resolve();
          };
          video.onerror = (e) => {
            console.error('[LiveSession] Video error:', e);
            reject(new Error('Video failed to load'));
          };
          setTimeout(() => reject(new Error('Video load timeout')), 5000);
        });

        await video.play();
        console.log('[LiveSession] Video playing');

        if (cancelled) return;

        setCameraActive(true);
        setStatus('ready');

        console.log('[LiveSession] Starting detection loop...');
        runDetectionLoop();

      } catch (err) {
        console.error('[LiveSession] Init error:', err);

        let message = 'An unknown error occurred.';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          message = 'Camera permission denied. Please allow camera access and try again.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          message = 'No camera found. Please connect a camera and try again.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          message = 'Camera is in use by another application. Please close other apps using the camera.';
        } else if (err.message?.includes('timeout')) {
          message = 'Camera took too long to start. Please try again.';
        } else {
          message = `Error: ${err.message}`;
        }

        setErrorMsg(message);
        setStatus('error');
      }
    }

    init();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [sessionId]);

  // Elapsed time counter
  useEffect(() => {
    if (status === 'ended') return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  function runDetectionLoop() {
    const detect = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.paused || video.ended || isProcessingRef.current) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      isProcessingRef.current = true;

      try {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const detections = await detectAllFaces(video);
        setDetectedCount(detections.length);

        if (detections.length > 0 && faceMatcherRef.current) {
          const matchResults = detections.map(d =>
            faceMatcherRef.current.findBestMatch(d.descriptor)
          );

          drawDetections(canvas, detections, matchResults);

          for (const match of matchResults) {
            if (match.label !== 'unknown') {
              try {
                const parsed = JSON.parse(match.label);
                const studentId = parsed.id;
                const studentName = parsed.name;

                setAttendanceMap(prev => {
                  if (prev[studentId]) return prev;

                  markAttendance(studentId, 1 - match.distance);

                  return {
                    ...prev,
                    [studentId]: {
                      name: studentName,
                      time: new Date().toLocaleTimeString(),
                      confidence: Math.round((1 - match.distance) * 100),
                    },
                  };
                });
              } catch (e) {
                // parse error, skip
              }
            }
          }
        } else if (detections.length > 0) {
          drawDetections(canvas, detections, null);
        } else {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        fpsCounterRef.current.frames++;
        const now = Date.now();
        if (now - fpsCounterRef.current.lastTime >= 1000) {
          setFps(fpsCounterRef.current.frames);
          fpsCounterRef.current = { frames: 0, lastTime: now };
        }
      } catch (err) {
        console.error('[LiveSession] Detection error:', err);
      }

      isProcessingRef.current = false;
      animFrameRef.current = requestAnimationFrame(detect);
    };

    animFrameRef.current = requestAnimationFrame(detect);
  }

  const markAttendance = async (studentId, confidence) => {
    try {
      await supabase.from('attendance').insert({
        session_id: sessionId,
        student_id: studentId,
        confidence: confidence,
      });
    } catch (err) {
      console.error('[LiveSession] Failed to mark attendance:', err);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleEndSession = async () => {
    stopCamera();
    setStatus('ended');

    await supabase
      .from('sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', sessionId);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const presentCount = Object.keys(attendanceMap).length;
  const totalStudents = students.length;
  const absentCount = totalStudents - presentCount;

  if (!sessionId) return null;

  return (
    <div className="min-h-screen bg-[#060a14]">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.06] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (status !== 'ended' && status !== 'error') {
                  if (!window.confirm('End this session and go back?')) return;
                  handleEndSession();
                }
                navigate(`/class/${classId}`);
              }}
              className="p-2 rounded-xl hover:bg-white/[0.06] text-white/30 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-serif font-bold text-white/90 text-lg flex items-center gap-2">
                {className || 'Live Session'}
                {status !== 'ended' && status !== 'error' && status !== 'loading' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-rose-500/10 text-rose-400 font-story font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    LIVE
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-3 text-xs text-white/30 font-story">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {formatTime(elapsedTime)}
                </span>
                {status === 'ready' && (
                  <>
                    <span>{fps} FPS</span>
                    <span>{detectedCount} faces detected</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Stats */}
            {status === 'ready' && (
              <div className="hidden sm:flex items-center gap-4 mr-4">
                <div className="text-center">
                  <p className="text-lg font-serif font-bold text-emerald-400">{presentCount}</p>
                  <p className="text-[10px] text-white/25 font-story">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-serif font-bold text-rose-400">{absentCount}</p>
                  <p className="text-[10px] text-white/25 font-story">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-serif font-bold text-blue-400">{totalStudents}</p>
                  <p className="text-[10px] text-white/25 font-story">Total</p>
                </div>
              </div>
            )}

            {status === 'ready' ? (
              <AnimatedButton
                variant="danger"
                icon={StopCircle}
                onClick={handleEndSession}
              >
                End Class
              </AnimatedButton>
            ) : status === 'ended' ? (
              <AnimatedButton
                variant="primary"
                onClick={() => navigate(`/class/${classId}`)}
              >
                Back to Class
              </AnimatedButton>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        {/* Error State */}
        {status === 'error' && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-rose-400" />
              </div>
              <h3 className="font-serif font-semibold text-white/90 text-lg mb-2">
                Camera Error
              </h3>
              <p className="text-sm text-white/30 mb-6 font-story">{errorMsg}</p>
              <div className="flex gap-3 justify-center">
                <AnimatedButton variant="secondary" onClick={() => navigate(`/class/${classId}`)}>
                  Go Back
                </AnimatedButton>
                <AnimatedButton variant="primary" icon={Camera} onClick={handleRetry}>
                  Try Again
                </AnimatedButton>
              </div>
            </motion.div>
          </div>
        )}

        {/* Camera + Attendance */}
        {status !== 'error' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Camera Feed */}
            <div className="lg:col-span-2">
              <div className={`relative rounded-2xl overflow-hidden border border-white/[0.06] ${
                status === 'ready' || status === 'detecting' ? 'camera-active' : ''
              }`}>
                <video
                  ref={videoRef}
                  className="w-full aspect-video object-cover bg-[#0c1220]"
                  style={{ transform: 'scaleX(-1)' }}
                  muted
                  playsInline
                  autoPlay
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                  style={{ transform: 'scaleX(-1)' }}
                />

                {/* Loading overlay */}
                {status === 'loading' && (
                  <div className="absolute inset-0 bg-[#0c1220]/90 backdrop-blur-sm flex items-center justify-center">
                    <LoadingSpinner size="lg" text={statusMessage} />
                  </div>
                )}

                {status === 'ended' && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center text-white">
                      <CameraOff size={48} className="mx-auto mb-3 opacity-40" />
                      <p className="font-serif font-semibold text-lg">Session Ended</p>
                      <p className="text-sm opacity-40 mt-1 font-story">
                        {presentCount} of {totalStudents} students marked present
                      </p>
                    </div>
                  </div>
                )}

                {/* FPS Badge */}
                {(status === 'ready' || status === 'detecting') && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white/70 text-xs font-mono">
                    {fps} FPS • {detectedCount} face{detectedCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Panel */}
            <div className="space-y-4">
              {/* Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5"
              >
                <h3 className="font-serif font-semibold text-white/90 mb-4 flex items-center gap-2">
                  <Users size={18} />
                  Attendance
                </h3>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-white/30 mb-1.5 font-story">
                    <span>{presentCount} present</span>
                    <span>{totalStudents} total</span>
                  </div>
                  <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: totalStudents > 0 ? `${(presentCount / totalStudents) * 100}%` : '0%' }}
                      transition={{ type: 'spring', stiffness: 100 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 rounded-xl bg-emerald-500/10">
                    <p className="text-lg font-bold text-emerald-400 font-serif">{presentCount}</p>
                    <p className="text-[10px] text-emerald-400/50 font-story">Present</p>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-500/10">
                    <p className="text-lg font-bold text-rose-400 font-serif">{absentCount}</p>
                    <p className="text-[10px] text-rose-400/50 font-story">Absent</p>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/10">
                    <p className="text-lg font-bold text-blue-400 font-serif">
                      {totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}%
                    </p>
                    <p className="text-[10px] text-blue-400/50 font-story">Rate</p>
                  </div>
                </div>
              </motion.div>

              {/* Student List */}
              <div className="glass rounded-2xl p-4 max-h-[calc(100vh-340px)] overflow-y-auto">
                <h4 className="text-xs font-semibold text-white/25 uppercase tracking-wider mb-3 px-1 font-story">
                  Student Roster
                </h4>
                <div className="space-y-1.5">
                  <AnimatePresence>
                    {students.map((student) => {
                      const attended = attendanceMap[student.id];
                      return (
                        <motion.div
                          key={student.id}
                          layout
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                            attended
                              ? 'bg-emerald-500/10'
                              : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            attended
                              ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                              : 'bg-white/[0.06] text-white/25'
                          }`}>
                            {attended ? (
                              <CheckCircle size={15} />
                            ) : (
                              <XCircle size={15} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-story font-medium truncate ${
                              attended ? 'text-emerald-400' : 'text-white/80'
                            }`}>
                              {student.name}
                            </p>
                            <p className="text-[10px] text-white/25 font-story">
                              {attended ? `${attended.time} • ${attended.confidence}%` : student.roll_number}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
