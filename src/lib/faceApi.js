import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;
  
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  
  modelsLoaded = true;
  console.log('Face-api.js models loaded successfully');
}

export function areModelsLoaded() {
  return modelsLoaded;
}

/**
 * Detect a single face and return its 128-dim descriptor
 * @param {HTMLVideoElement | HTMLCanvasElement | HTMLImageElement} input
 * @returns {Promise<Float32Array | null>}
 */
export async function detectSingleFace(input) {
  const result = await faceapi
    .detectSingleFace(input)
    .withFaceLandmarks()
    .withFaceDescriptor();
  
  return result || null;
}

/**
 * Detect all faces and return their descriptors
 * @param {HTMLVideoElement | HTMLCanvasElement | HTMLImageElement} input
 * @returns {Promise<Array>}
 */
export async function detectAllFaces(input) {
  const results = await faceapi
    .detectAllFaces(input)
    .withFaceLandmarks()
    .withFaceDescriptors();
  
  return results;
}

/**
 * Create a FaceMatcher from an array of labeled descriptors
 * @param {Array<{name: string, id: string, descriptor: number[]}>} students
 * @param {number} threshold - distance threshold (lower = stricter)
 * @returns {faceapi.FaceMatcher}
 */
export function createFaceMatcher(students, threshold = 0.6) {
  const labeledDescriptors = students
    .filter(s => s.descriptor && s.descriptor.length === 128)
    .map(s => {
      const descriptor = new Float32Array(s.descriptor);
      return new faceapi.LabeledFaceDescriptors(
        JSON.stringify({ name: s.name, id: s.id }),
        [descriptor]
      );
    });
  
  if (labeledDescriptors.length === 0) {
    return null;
  }
  
  return new faceapi.FaceMatcher(labeledDescriptors, threshold);
}

/**
 * Draw detection results on a canvas overlay
 */
export function drawDetections(canvas, detections, matchResults) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  detections.forEach((detection, i) => {
    const box = detection.detection.box;
    const match = matchResults?.[i];
    
    let label = 'Unknown';
    let color = '#ef4444'; // red for unknown
    let confidence = 0;
    
    if (match && match.label !== 'unknown') {
      try {
        const parsed = JSON.parse(match.label);
        label = parsed.name;
      } catch {
        label = match.label;
      }
      color = '#10b981'; // green for recognized
      confidence = Math.round((1 - match.distance) * 100);
    }
    
    // Draw box
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    
    // Draw label background
    const text = match && match.label !== 'unknown' 
      ? `${label} (${confidence}%)`
      : 'Unknown';
    ctx.font = 'bold 14px Inter, sans-serif';
    const textWidth = ctx.measureText(text).width;
    
    ctx.fillStyle = color;
    ctx.fillRect(box.x, box.y - 28, textWidth + 16, 28);
    
    // Draw label text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, box.x + 8, box.y - 8);
  });
}

export { faceapi };
