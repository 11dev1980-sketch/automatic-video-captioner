import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import type { Caption_Style } from '../types/captionStyle';

interface BurnOptions {
  filename?: string;
  includeAudio?: boolean;
  onProgress?: (percent: number, message: string) => void;
  signal?: AbortSignal;
}

interface BurnResult {
  blob: Blob;
  url: string;
  filename: string;
  mimeType: string;
}

const isBrowser =
  typeof window !== 'undefined' &&
  typeof document !== 'undefined' &&
  typeof HTMLVideoElement !== 'undefined' &&
  typeof HTMLCanvasElement !== 'undefined';

export function canBurnVideoInBrowser(): boolean {
  return Boolean(
    isBrowser &&
      typeof MediaRecorder !== 'undefined' &&
      HTMLCanvasElement.prototype.captureStream,
  );
}

export async function burnCaptionsInBrowser(
  videoUrl: string,
  captions: Caption_Object[],
  style: Caption_Style,
  options: BurnOptions = {},
): Promise<BurnResult> {
  if (!canBurnVideoInBrowser()) {
    throw new Error('Video export met ingebakken bijschriften wordt niet ondersteund door deze browser.');
  }

  if (!videoUrl) {
    throw new Error('Geen video geselecteerd.');
  }

  if (!captions.length) {
    throw new Error('Geen bijschriften beschikbaar.');
  }

  const {
    filename = `video_met_bijschriften_${Date.now()}`,
    includeAudio = true,
    onProgress,
    signal,
  } = options;
  const sourceUrl = toPlayableUrl(videoUrl);
  const mimeType = pickMimeType();

  onProgress?.(5, 'Video laden...');

  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.muted = !includeAudio;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = sourceUrl;

  const cleanupVideo = () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  };

  await waitForEvent(video, 'loadedmetadata', signal);

  const width = Math.max(2, video.videoWidth || 1280);
  const height = Math.max(2, video.videoHeight || Math.round(width * 9 / 16));
  const durationMs = Math.max(1, (video.duration || 0) * 1000);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    cleanupVideo();
    throw new Error('Canvas rendering is niet beschikbaar.');
  }

  const canvasStream = canvas.captureStream(30);
  const mixedStream = new MediaStream(canvasStream.getVideoTracks());
  const sourceStream = getVideoCaptureStream(video);
  if (includeAudio) {
    sourceStream?.getAudioTracks().forEach((track) => mixedStream.addTrack(track));
  }

  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(mixedStream, { mimeType });
  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) chunks.push(event.data);
  };

  let animationFrame = 0;
  const renderFrame = () => {
    ctx.drawImage(video, 0, 0, width, height);
    drawCaption(ctx, width, height, captions, style, video.currentTime * 1000);

    const percent = Math.min(95, 10 + (video.currentTime * 1000 / durationMs) * 85);
    onProgress?.(Math.round(percent), 'Bijschriften in video branden...');
    animationFrame = window.requestAnimationFrame(renderFrame);
  };

  try {
    const stopPromise = new Promise<void>((resolve, reject) => {
      recorder.onstop = () => resolve();
      recorder.onerror = () => reject(new Error('Video opname mislukt.'));
    });

    recorder.start(1000);
    animationFrame = window.requestAnimationFrame(renderFrame);
    await video.play();
    await waitForEvent(video, 'ended', signal);

    onProgress?.(96, 'Video afronden...');
    if (recorder.state !== 'inactive') recorder.stop();
    await stopPromise;
  } finally {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    mixedStream.getTracks().forEach((track) => track.stop());
    sourceStream?.getTracks().forEach((track) => track.stop());
    cleanupVideo();
  }

  const blob = new Blob(chunks, { type: mimeType });
  if (blob.size === 0) {
    throw new Error('De browser heeft geen videodata geproduceerd.');
  }

  const url = URL.createObjectURL(blob);
  onProgress?.(100, 'Klaar!');

  return {
    blob,
    url,
    filename: `${filename}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`,
    mimeType,
  };
}

export function downloadBurnedVideo(result: BurnResult): void {
  // Detect iOS Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  if (isIOS || isSafari) {
    // iOS Safari doesn't support programmatic downloads via anchor.click()
    // Use window.open as a fallback to open the video in a new tab
    // The user can then use Safari's share menu to save the video
    const newWindow = window.open(result.url, '_blank');
    if (!newWindow) {
      // If popup is blocked, try direct navigation
      window.location.href = result.url;
    }
  } else {
    // Standard approach for other browsers
    const anchor = document.createElement('a');
    anchor.href = result.url;
    anchor.download = result.filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}

/**
 * Convert a WebM Blob to MP4 using ffmpeg.wasm client‑side.
 * Returns a new Blob and a URL for download.
 */
export async function convertWebMToMP4(inputBlob: Blob): Promise<{ blob: Blob; url: string }> {
  const ffmpeg = createFFmpeg({ log: true });
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
  // Write the input WebM file to the in‑memory FS
  const arrayBuffer = await inputBlob.arrayBuffer();
  ffmpeg.FS('writeFile', 'input.webm', new Uint8Array(arrayBuffer));
  // Transcode to MP4 (h264 + aac)
  await ffmpeg.run('-i', 'input.webm', '-c:v', 'libx264', '-c:a', 'aac', '-strict', '-2', 'output.mp4');
  // Read the output file
  const data = ffmpeg.FS('readFile', 'output.mp4');
  const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });
  const url = URL.createObjectURL(mp4Blob);
  // Clean up the virtual file system
  ffmpeg.FS('unlink', 'input.webm');
  ffmpeg.FS('unlink', 'output.mp4');
  return { blob: mp4Blob, url };
}

function toPlayableUrl(url: string): string {
  if (/^(blob:|data:|file:)/.test(url)) return url;
  if (typeof window === 'undefined') return url;
  if (url.startsWith(window.location.origin) || url.startsWith('/')) return url;

  return `${window.location.origin}/api/video?action=proxy&videoUrl=${encodeURIComponent(url)}`;
}

function pickMimeType(): string {
  const candidates = [
    'video/mp4;codecs=h264,aac',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || 'video/mp4';
}

function getVideoCaptureStream(video: HTMLVideoElement): MediaStream | null {
  const capture = (video as any).captureStream || (video as any).mozCaptureStream;
  return typeof capture === 'function' ? capture.call(video) : null;
}

function waitForEvent(
  target: HTMLMediaElement,
  eventName: string,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      rejectAbort();
      return;
    }

    const cleanup = () => {
      target.removeEventListener(eventName, onEvent);
      target.removeEventListener('error', onError);
      signal?.removeEventListener('abort', onAbort);
    };

    const onEvent = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('Video laden of verwerken mislukt.'));
    };
    const onAbort = () => {
      cleanup();
      rejectAbort();
    };

    target.addEventListener(eventName, onEvent, { once: true });
    target.addEventListener('error', onError, { once: true });
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function rejectAbort(): never {
  throw new DOMException('Export geannuleerd.', 'AbortError');
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  captions: Caption_Object[],
  style: Caption_Style,
  timeMs: number,
) {
  const caption = captions.find((item) => timeMs >= item.startTime && timeMs <= item.endTime);
  if (!caption) return;

  const text = style.allCaps ? caption.text.toUpperCase() : caption.text;
  const scale = width / 390;
  const fontSize = Math.max(12, style.fontSize * scale);
  const fontWeight = style.bold ? '700' : '400';
  const fontStyle = style.italic ? 'italic' : 'normal';
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${style.fontFamily || 'Arial'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = wrapText(ctx, text, width * 0.86);
  const lineHeight = fontSize * 1.25;
  const blockHeight = lines.length * lineHeight;
  const offset = (style.verticalOffset || 50) * scale;
  const centerY =
    style.position === 'top'
      ? offset + blockHeight / 2
      : style.position === 'center'
        ? height * 0.5
        : height - offset - blockHeight / 2;

  if (style.backgroundColor !== 'transparent' && style.backgroundOpacity > 0) {
    const paddingX = 14 * scale;
    const paddingY = 8 * scale;
    const maxLineWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
    ctx.fillStyle = hexToRgba(style.backgroundColor, style.backgroundOpacity);
    roundRect(
      ctx,
      width / 2 - maxLineWidth / 2 - paddingX,
      centerY - blockHeight / 2 - paddingY,
      maxLineWidth + paddingX * 2,
      blockHeight + paddingY * 2,
      4 * scale,
    );
    ctx.fill();
  }

  lines.forEach((line, index) => {
    const y = centerY - blockHeight / 2 + lineHeight / 2 + index * lineHeight;

    if (style.shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 4 * scale;
      ctx.shadowOffsetX = 1.5 * scale;
      ctx.shadowOffsetY = 1.5 * scale;
    }

    if (style.outline) {
      ctx.lineWidth = Math.max(1, style.outlineWidth * scale);
      ctx.strokeStyle = style.outlineColor;
      ctx.strokeText(line, width / 2, y);
    }

    ctx.fillStyle = style.textColor;
    ctx.fillText(line, width / 2, y);
    ctx.shadowColor = 'transparent';

    if (style.underline) {
      const measured = ctx.measureText(line).width;
      ctx.fillRect(width / 2 - measured / 2, y + fontSize * 0.55, measured, Math.max(1, fontSize * 0.06));
    }
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth || !line) {
      line = testLine;
    } else {
      lines.push(line);
      line = word;
    }
  });

  if (line) lines.push(line);
  return lines;
}

function hexToRgba(hex: string, alpha: number): string {
  if (!hex || !hex.startsWith('#')) return hex || 'transparent';
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}
