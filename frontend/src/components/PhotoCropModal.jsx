import { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RotateCw, ZoomIn } from 'lucide-react';

// Rasio kartu: 62x82 ≈ 0.756 → pakai 3/4 = 0.75 biar pas bingkai kartu
const ASPECT = 3 / 4;

function canvasToBlob(canvas, mime = 'image/jpeg', quality = 0.92) {
    return new Promise(resolve => canvas.toBlob(b => resolve(b), mime, quality));
}

export default function PhotoCropModal({ file, onClose, onCropped }) {
    const imgRef = useRef(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [src, setSrc] = useState(() => file ? URL.createObjectURL(file) : '');

    const onImageLoad = useCallback(e => {
        const { width, height } = e.currentTarget;
        // crop awal: ambil tengah, lebar 90% dengan rasio 3:4
        const cropWidth = width * 0.9;
        const cropHeight = cropWidth / ASPECT;
        let w = cropWidth, h = cropHeight, x = (width - w) / 2, y = (height - h) / 2;
        if (h > height * 0.9) {
            h = height * 0.9;
            w = h * ASPECT;
            x = (width - w) / 2;
            y = (height - h) / 2;
        }
        const pct = {
            unit: 'px',
            x, y, width: w, height: h,
        };
        setCrop(pct);
        // set completed untuk tombol Crop langsung aktif
        setCompletedCrop(pct);
    }, []);

    const handleApply = async () => {
        if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) return;
        const img = imgRef.current;
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;

        // output 600x800 (3:4) kualitas cetak cukup, tidak berat
        const outW = 600, outH = 800;
        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';

        const sx = completedCrop.x * scaleX;
        const sy = completedCrop.y * scaleY;
        const sw = completedCrop.width * scaleX;
        const sh = completedCrop.height * scaleY;

        // fill putih dulu biar JPEG tidak transparan hitam
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outW, outH);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

        const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
        if (!blob) return;
        const croppedFile = new File([blob], file?.name || 'foto-kartu.jpg', { type: 'image/jpeg' });
        // beri preview url agar caller bisa tampil langsung (opsional)
        croppedFile._previewUrl = URL.createObjectURL(blob);
        onCropped(croppedFile);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80, padding: '1rem' }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '560px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ZoomIn size={16} /> Sesuaikan Foto — Tarik biar pas bingkai 3:4</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>Geser & perbesar bingkai kuning — hasil akan persis 62×82 di kartu (tidak melar).</div>
                    </div>
                    <button type="button" onClick={onClose} style={{ background: '#fee2e2', border: 'none', padding: '0.4rem', borderRadius: '0.5rem' }}><X size={16} /></button>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '1rem', background: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <ReactCrop
                        crop={crop}
                        onChange={(_, pct) => setCrop(pct)}
                        onComplete={c => setCompletedCrop(c)}
                        aspect={ASPECT}
                        minWidth={40}
                        minHeight={40}
                    >
                        <img
                            ref={imgRef}
                            src={src}
                            alt="Crop"
                            onLoad={onImageLoad}
                            style={{ maxWidth: '100%', maxHeight: '60vh', display: 'block' }}
                            crossOrigin="anonymous"
                        />
                    </ReactCrop>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', padding: '0.85rem 1rem', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', background: 'white' }}>
                    <button type="button" onClick={onClose} className="btn btn-secondary" style={{ padding: '0.55rem 1rem' }}>Batal</button>
                    <button type="button" onClick={handleApply} className="btn btn-primary" style={{ padding: '0.55rem 1.1rem' }}><Check size={16} style={{ marginRight: '0.35rem' }} /> Pakai Foto Ini</button>
                </div>
            </div>
        </div>
    );
}
