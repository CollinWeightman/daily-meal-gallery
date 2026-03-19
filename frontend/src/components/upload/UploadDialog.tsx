import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSnackbar } from '@/contexts/SnackbarContext';
import client from '@/api/client';
import { RotateCcw, RotateCw, Upload, X } from 'lucide-react';

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

interface PhotoEntry {
  file: File;
  previewUrl: string;
  rotation: number;
  canvasPreview: string | null;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}

export function UploadDialog({ open, onOpenChange, onUploaded }: UploadDialogProps) {
  const { showSnackbar } = useSnackbar();

  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [mealType, setMealType] = useState(1);
  const [takenAt, setTakenAt] = useState('');
  const [takenAtLocked, setTakenAtLocked] = useState(false);
  const [remark, setRemark] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const reset = () => {
    photos.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
    setMealType(1);
    setTakenAt('');
    setTakenAtLocked(false);
    setRemark('');
    setUploadError('');
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const readExifDate = (f: File): Promise<string | null> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const buf = e.target?.result as ArrayBuffer;
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

  const renderCanvasPreview = (file: File, previewUrl: string, rotation: number): Promise<string> => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const rad = (rotation * Math.PI) / 180;
        const w = rotation % 180 === 0 ? img.width : img.height;
        const h = rotation % 180 === 0 ? img.height : img.width;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.translate(w / 2, h / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        resolve(canvas.toDataURL(file.type));
      };
      img.src = previewUrl;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // 第一張照片嘗試讀 EXIF
    if (photos.length === 0) {
      const exif = await readExifDate(files[0]);
      if (exif) {
        setTakenAt(exif);
        setTakenAtLocked(true);
      } else {
        setTakenAtLocked(false);
      }
    }

    const newEntries: PhotoEntry[] = await Promise.all(
      files.map(async file => {
        const previewUrl = URL.createObjectURL(file);
        const canvasPreview = await renderCanvasPreview(file, previewUrl, 0);
        return { file, previewUrl, rotation: 0, canvasPreview };
      })
    );

    setPhotos(prev => [...prev, ...newEntries]);
    // 清空 input 讓同一張照片可以重複選
    e.target.value = '';
  };

  const rotate = async (index: number, dir: 'cw' | 'ccw') => {
    setPhotos(prev => prev.map((p, i) => {
      if (i !== index) return p;
      const newRotation = (p.rotation + (dir === 'cw' ? 90 : -90) + 360) % 360;
      // 先更新 rotation，canvas preview 非同步更新
      return { ...p, rotation: newRotation };
    }));

    // 更新 canvas preview
    const entry = photos[index];
    const newRotation = (entry.rotation + (dir === 'cw' ? 90 : -90) + 360) % 360;
    const canvasPreview = await renderCanvasPreview(entry.file, entry.previewUrl, newRotation);
    setPhotos(prev => prev.map((p, i) => i === index ? { ...p, canvasPreview } : p));
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleMealTypeChange = (val: number) => {
    setMealType(val);
    if (!takenAtLocked) {
      const opt = MEAL_TYPE_OPTIONS.find(o => o.value === val);
      if (opt) {
        const now = new Date();
        if (opt.defaultHour !== null) now.setHours(opt.defaultHour, 0, 0, 0);
        setTakenAt(toDatetimeLocal(now));
      }
    }
  };

  const getRotatedBlob = useCallback((entry: PhotoEntry): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const rad = (entry.rotation * Math.PI) / 180;
        const w = entry.rotation % 180 === 0 ? img.width : img.height;
        const h = entry.rotation % 180 === 0 ? img.height : img.width;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.translate(w / 2, h / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        canvas.toBlob(blob => blob ? resolve(blob) : reject('toBlob failed'), 'image/jpeg', 0.92);
      };
      img.src = entry.previewUrl;
    });
  }, []);

  const handleUpload = async () => {
    if (!photos.length) return;
    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();

      for (const entry of photos) {
        const blob = await getRotatedBlob(entry);
        const filename = entry.file.name.replace(/\.[^.]+$/, '.jpg');
        formData.append('photos[]', blob, filename);
      }

      formData.append('meal_type', String(mealType));
      if (takenAt) formData.append('taken_at', takenAt);
      if (remark) formData.append('remark', remark);

      await client.post('/meals', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showSnackbar('Meal uploaded!');
      handleClose();
      onUploaded();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Upload failed';
      setUploadError(msg);
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

          {/* 照片列表 */}
          {photos.length > 0 && (
            <div className="flex flex-col gap-3">
              {photos.map((entry, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]">
                  {/* 縮圖 */}
                  <img
                    src={entry.canvasPreview ?? entry.previewUrl}
                    alt={`photo ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  />
                  {/* 旋轉工具 */}
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-xs text-[var(--text-muted)]">Rotate</span>
                    <button
                      onClick={() => rotate(index, 'ccw')}
                      className="p-1.5 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-colors"
                    >
                      <RotateCcw size={13} />
                    </button>
                    <button
                      onClick={() => rotate(index, 'cw')}
                      className="p-1.5 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-colors"
                    >
                      <RotateCw size={13} />
                    </button>
                  </div>
                  {/* 移除 */}
                  <button
                    onClick={() => removePhoto(index)}
                    className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 新增照片按鈕 */}
          <div
            className="border-2 border-dashed border-[var(--border)] rounded-lg cursor-pointer hover:border-[var(--accent)] transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-[var(--text-muted)]">
              <Upload size={22} strokeWidth={1.5} />
              <p className="text-sm">
                {photos.length === 0 ? 'Click to select photos' : 'Add more photos'}
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

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
              onChange={e => { setTakenAt(e.target.value); setTakenAtLocked(true); }}
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

          {/* 錯誤訊息 */}
          {uploadError && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">
              {uploadError}
            </p>
          )}

          {/* 上傳按鈕 */}
          <button
            onClick={handleUpload}
            disabled={!photos.length || uploading}
            className="w-full py-2.5 text-sm font-medium rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading…' : `Upload${photos.length > 1 ? ` (${photos.length} photos)` : ''}`}
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}