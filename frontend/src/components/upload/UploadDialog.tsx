import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSnackbar } from '@/contexts/SnackbarContext';
import client from '@/api/client';
import { RotateCcw, RotateCw, Upload } from 'lucide-react';

const MEAL_TYPE_OPTIONS = [
  { value: 1, label: 'Breakfast', defaultHour: 8 },
  { value: 2, label: 'Lunch', defaultHour: 12 },
  { value: 3, label: 'Dinner', defaultHour: 19 },
  { value: 4, label: 'Snack', defaultHour: null },
];

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}

export function UploadDialog({ open, onOpenChange, onUploaded }: UploadDialogProps) {
  const { showSnackbar } = useSnackbar();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [mealType, setMealType] = useState(1);
  const [takenAt, setTakenAt] = useState('');
  const [takenAtLocked, setTakenAtLocked] = useState(false);
  const [remark, setRemark] = useState('');
  const [uploading, setUploading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setRotation(0);
    setMealType(1);
    setTakenAt('');
    setTakenAtLocked(false);
    setRemark('');
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  // 讀取 EXIF（簡易版，只抓 DateTimeOriginal）
  const readExifDate = (f: File): Promise<string | null> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const buf = e.target?.result as ArrayBuffer;
          const view = new DataView(buf);
          // 找 EXIF DateTimeOriginal 字串
          const str = new TextDecoder('ascii', { fatal: false }).decode(buf);
          const match = str.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
          if (match) {
            const [, y, mo, d, h, mi] = match;
            resolve(`${y}-${mo}-${d}T${h}:${mi}`);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };
      reader.readAsArrayBuffer(f.slice(0, 128 * 1024));
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setRotation(0);
    setPreviewUrl(URL.createObjectURL(f));

    const exif = await readExifDate(f);
    if (exif) {
      setTakenAt(exif);
      setTakenAtLocked(true);
    } else {
      setTakenAtLocked(false);
    }
  };

  const rotate = (dir: 'cw' | 'ccw') => {
    setRotation(r => (r + (dir === 'cw' ? 90 : -90) + 360) % 360);
  };

  const handleMealTypeChange = (val: number) => {
    setMealType(val);
    if (!takenAtLocked) {
      const opt = MEAL_TYPE_OPTIONS.find(o => o.value === val);
      if (opt) {
        const now = new Date();
        if (opt.defaultHour !== null) {
          now.setHours(opt.defaultHour, 0, 0, 0);
        }
        setTakenAt(toDatetimeLocal(now));
      }
    }
  };

  const handleTakenAtChange = (val: string) => {
    setTakenAt(val);
    setTakenAtLocked(true);
  };

  // Canvas 旋轉後輸出 Blob
  const getRotatedBlob = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!file || !previewUrl) return reject('No file');
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const rad = (rotation * Math.PI) / 180;
        const w = rotation % 180 === 0 ? img.width : img.height;
        const h = rotation % 180 === 0 ? img.height : img.width;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.translate(w / 2, h / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        canvas.toBlob(blob => blob ? resolve(blob) : reject('toBlob failed'), file.type);
      };
      img.src = previewUrl;
    });
  }, [file, previewUrl, rotation]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const blob = rotation !== 0 ? await getRotatedBlob() : file;
      const formData = new FormData();
      formData.append('image', blob, file.name);
      formData.append('meal_type', String(mealType));
      if (takenAt) formData.append('taken_at', takenAt);
      if (remark) formData.append('remark', remark);

      await client.post('/meals', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showSnackbar('Meal uploaded!');
      handleClose();
      onUploaded();
    } catch {
      showSnackbar('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-lg w-[95vw] bg-[var(--bg-elevated)] border-[var(--border)]"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-[var(--text-primary)]">Upload Meal</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-2">

          {/* 照片上傳區 */}
          <div
            className="relative border-2 border-dashed border-[var(--border)] rounded-lg overflow-hidden cursor-pointer hover:border-[var(--accent)] transition-colors"
            style={{ minHeight: 200 }}
            onClick={() => inputRef.current?.click()}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="preview"
                className="w-full object-contain max-h-64"
                style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.2s' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 gap-2 text-[var(--text-muted)]">
                <Upload size={28} strokeWidth={1.5} />
                <p className="text-sm">Click to select a photo</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* 旋轉工具 — 有圖才顯示 */}
          {previewUrl && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Rotate</span>
              <button
                onClick={() => rotate('ccw')}
                className="p-2 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => rotate('cw')}
                className="p-2 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <RotateCw size={15} />
              </button>
            </div>
          )}

          {/* 餐別 */}
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-2">Meal Type</p>
            <div className="flex flex-wrap gap-1.5">
              {MEAL_TYPE_OPTIONS.map(t => (
                <button
                  key={t.value}
                  onClick={() => handleMealTypeChange(t.value)}
                  className={[
                    'px-3 py-1 text-sm rounded-full border transition-colors',
                    mealType === t.value
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-strong)]',
                  ].join(' ')}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 拍照時間 */}
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1.5">
              Date & Time
              {takenAtLocked && <span className="ml-1.5 text-[var(--accent)]">• from EXIF</span>}
            </p>
            <input
              type="datetime-local"
              value={takenAt}
              onChange={e => handleTakenAtChange(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* 備註 */}
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1.5">Remark <span className="opacity-50">(optional)</span></p>
            <textarea
              value={remark}
              onChange={e => setRemark(e.target.value)}
              rows={2}
              placeholder="What did you eat?"
              className="w-full text-sm px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>

          {/* 上傳按鈕 */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-2.5 text-sm font-medium rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>

        {/* 隱藏 canvas for 旋轉輸出 */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}