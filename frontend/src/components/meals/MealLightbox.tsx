import { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import client from '@/api/client';
import type { Meal } from '@/types/meal';
import { Pencil, Trash2, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const MEAL_TYPE_OPTIONS = [
    { value: 1, label: 'Breakfast' },
    { value: 2, label: 'Lunch' },
    { value: 3, label: 'Dinner' },
    { value: 4, label: 'Snack' },
];

interface MealLightboxProps {
    meal: Meal | null;
    onClose: () => void;
    onDeleted: () => void;
    onUpdated: () => void;
}

export function MealLightbox({ meal, onClose, onDeleted, onUpdated }: MealLightboxProps) {
    const { isAuthenticated } = useAuth();
    const { showSnackbar } = useSnackbar();

    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);

    const [editMealType, setEditMealType] = useState(meal?.meal_type ?? 1);
    const [editRemark, setEditRemark] = useState(meal?.remark ?? '');
    const [editTakenAt, setEditTakenAt] = useState(
        meal?.taken_at ? meal.taken_at.slice(0, 16) : ''
    );

    useEffect(() => {
        setEditing(false);
        setConfirmDelete(false);
        setFullscreen(false);
        setCurrentIndex(0);
        setEditMealType(meal?.meal_type ?? 1);
        setEditRemark(meal?.remark ?? '');
        setEditTakenAt(meal?.taken_at ? meal.taken_at.slice(0, 16) : '');
    }, [meal?.id]);

    // 鍵盤左右切換
    useEffect(() => {
        if (!meal) return;
        const handleKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isEditableTarget =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;

            if (isEditableTarget) return;

            if (e.key === 'ArrowLeft') prevPhoto();
            if (e.key === 'ArrowRight') nextPhoto();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [meal, currentIndex]);

    const touchStartX = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? nextPhoto() : prevPhoto();
        }
        touchStartX.current = null;
    };

    if (!meal) return null;

    const photos = meal.photos ?? [];
    const hasMultiple = photos.length > 1;
    const currentPhoto = photos[currentIndex];

    const prevPhoto = () => setCurrentIndex(i => (i - 1 + photos.length) % photos.length);
    const nextPhoto = () => setCurrentIndex(i => (i + 1) % photos.length);

    const openEdit = () => {
        setEditMealType(meal.meal_type);
        setEditRemark(meal.remark ?? '');
        setEditTakenAt(meal.taken_at ? meal.taken_at.slice(0, 16) : '');
        setEditing(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await client.patch(`/meals/${meal.id}`, {
                meal_type: editMealType,
                remark: editRemark || null,
                taken_at: editTakenAt || null,
            });
            showSnackbar('Saved successfully');
            setEditing(false);
            onUpdated();
            onClose();
        } catch {
            showSnackbar('Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await client.delete(`/meals/${meal.id}`);
            showSnackbar('Meal deleted');
            setConfirmDelete(false);
            onDeleted();
            onClose();
        } catch {
            showSnackbar('Failed to delete', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const formattedDate = meal.taken_at
        ? new Date(meal.taken_at).toLocaleString('en', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
        : null;

    return (
        <>
        <Dialog open={!!meal} onOpenChange={open => { if (!open) onClose(); }}>
            <DialogContent
                aria-describedby={undefined}
                className="p-0 overflow-hidden bg-[var(--bg-elevated)] border-[var(--border)] gap-0 [&>button]:z-20 w-[95vw] max-w-none sm:max-w-none md:w-[85vw] md:max-w-5xl"
            >
                <DialogTitle className="sr-only">{meal.meal_type_label}</DialogTitle>

                <div className="flex flex-col md:flex-row overflow-y-auto max-h-[90vh]">

                    {/* 圖片區 */}
                    <div
                        className="relative w-full md:w-[65%] bg-black flex items-center justify-center"
                        style={{ minHeight: '30vw', maxHeight: '80vh' }}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {currentPhoto && (
                            <img
                                src={currentPhoto.url}
                                alt={meal.meal_type_label}
                                className="w-full h-full object-contain cursor-zoom-in"
                                style={{ maxHeight: '80vh' }}
                                onClick={() => setFullscreen(true)}
                            />
                        )}

                        {hasMultiple && (
                            <>
                                <button
                                    onClick={prevPhoto}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                                >
                                    <ChevronLeft size={22} />
                                </button>
                                <button
                                    onClick={nextPhoto}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                                >
                                    <ChevronRight size={22} />
                                </button>

                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {photos.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentIndex(i)}
                                            className={[
                                                'w-1.5 h-1.5 rounded-full transition-colors',
                                                i === currentIndex ? 'bg-white' : 'bg-white/40',
                                            ].join(' ')}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* 資訊區（未變動） */}
                    <div
                        className="w-full md:w-[35%] p-5 flex flex-col gap-4 border-t border-[var(--border)] md:border-t-0 md:border-l overflow-y-auto"
                        style={{ maxHeight: '80vh' }}
                    >
                        {editing ? (
                            <>
                                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Edit Meal</p>

                                <div>
                                    <p className="text-xs text-[var(--text-muted)] mb-2">Meal Type</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {MEAL_TYPE_OPTIONS.map(t => (
                                            <button
                                                key={t.value}
                                                onClick={() => setEditMealType(t.value)}
                                                className={[
                                                    'px-3 py-1 text-xs rounded-full border transition-colors',
                                                    editMealType === t.value
                                                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                                                        : 'text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-strong)]',
                                                ].join(' ')}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-[var(--text-muted)] mb-1.5">Date & Time</p>
                                    <input
                                        type="datetime-local"
                                        value={editTakenAt}
                                        onChange={e => setEditTakenAt(e.target.value)}
                                        className="w-full text-sm px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                                    />
                                </div>

                                <div>
                                    <p className="text-xs text-[var(--text-muted)] mb-1.5">Remark</p>
                                    <textarea
                                        value={editRemark}
                                        onChange={e => setEditRemark(e.target.value)}
                                        rows={3}
                                        placeholder="Optional note..."
                                        className="w-full text-sm px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] resize-none"
                                    />
                                </div>

                                <div className="flex gap-2 mt-auto pt-2">
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="flex-1 px-4 py-2 text-sm rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-colors disabled:opacity-60"
                                    >
                                        <Check size={14} />
                                        {saving ? 'Saving…' : 'Save'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--bg-secondary)] text-[var(--accent)] border border-[var(--border)] self-start">
                                    {meal.meal_type_label}
                                </span>

                                {hasMultiple && (
                                    <p className="text-xs text-[var(--text-muted)]">
                                        Photo {currentIndex + 1} of {photos.length}
                                    </p>
                                )}

                                {formattedDate && (
                                    <p className="text-sm text-[var(--text-secondary)]">{formattedDate}</p>
                                )}

                                {meal.remark && (
                                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">{meal.remark}</p>
                                )}

                                {isAuthenticated && (
                                    <div className="flex gap-2 mt-auto pt-4 border-t border-[var(--border)]">
                                        <button
                                            onClick={openEdit}
                                            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                                        >
                                            <Pencil size={14} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(true)}
                                            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-md border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        {/* 全螢幕縮放檢視 */}
        <Dialog open={fullscreen} onOpenChange={setFullscreen}>
            <DialogContent
                aria-describedby={undefined}
                onPointerDownOutside={(e) => e.preventDefault()}
                className="p-0 overflow-hidden bg-black border-none rounded-none w-screen h-screen max-w-none sm:max-w-none [&>button]:z-30 [&>button]:text-white [&>button]:p-3 [&>button]:rounded-full [&>button]:bg-black/40 [&>button_svg]:size-5"
            >
                <DialogTitle className="sr-only">{meal.meal_type_label}</DialogTitle>

                <div
                    className="relative w-full h-full flex items-center justify-center"
                    style={{ touchAction: 'none' }}
                >
                    {currentPhoto && (
                        <TransformWrapper
                            key={currentPhoto.id}
                            initialScale={1}
                            minScale={1}
                            maxScale={4}
                            centerOnInit
                            doubleClick={{ mode: 'toggle' }}
                        >
                            <TransformComponent
                                wrapperStyle={{ width: '100%', height: '100%' }}
                                contentStyle={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <img
                                    src={currentPhoto.url}
                                    alt={meal.meal_type_label}
                                    className="max-w-full max-h-full object-contain select-none"
                                />
                            </TransformComponent>
                        </TransformWrapper>
                    )}

                    {hasMultiple && (
                        <>
                            <button
                                onClick={prevPhoto}
                                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextPhoto}
                                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                            >
                                <ChevronRight size={24} />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                                {photos.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        className={[
                                            'w-1.5 h-1.5 rounded-full transition-colors',
                                            i === currentIndex ? 'bg-white' : 'bg-white/40',
                                        ].join(' ')}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>

        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <AlertDialogContent className="bg-[var(--bg-elevated)] border-[var(--border)]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-[var(--text-primary)]">Delete this meal?</AlertDialogTitle>
                    <AlertDialogDescription className="text-[var(--text-secondary)]">
                        This action cannot be undone. All photos will be permanently removed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-[var(--border)] text-[var(--text-secondary)]">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-destructive text-white hover:bg-destructive/90"
                    >
                        {deleting ? 'Deleting…' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}