import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { CheckCircle2, Clock3 } from 'lucide-react';

const InputLine = ({ label, name, type = "text", form, setForm, placeholder }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-700)' }}>{label} <span style={{ color: '#e11d48' }}>*</span></label>
        <input
            type={type} required
            placeholder={placeholder || ''}
            style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--surface-200)', borderRadius: '0.5rem', outline: 'none' }}
            value={form[name]}
            onChange={e => setForm({ ...form, [name]: e.target.value })}
        />
    </div>
);

export default function Register() {
    const [form, setForm] = useState({
        full_name: '', email: '', password: '', password_confirmation: '',
        nisn: '', nik: '', birth_place: '', birth_date: '', religion: 'Islam',
        dusun: '', rt: '', rw: '', desa: '', kecamatan: '', kabupaten: '', major_id: ''
    });
    const [majors, setMajors] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [websiteName, setWebsiteName] = useState('e-Pelajar');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/public/landing-content')
            .then(res => {
                if (res.data?.website_name) setWebsiteName(res.data.website_name);
            }).catch(console.error);
        api.get('/public/majors').then(res => setMajors(res.data)).catch(() => {
            api.get('/admin/majors').then(res => setMajors(res.data)).catch(() => {});
        });
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!form.major_id) {
            setError('Jurusan wajib dipilih.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/register', form);
            setSuccess(res.data?.message || 'Pendaftaran berhasil! Akun Anda menunggu persetujuan admin. Anda akan bisa login setelah admin menyetujui.');
            setForm({ full_name: '', email: '', password: '', password_confirmation: '', nisn: '', nik: '', birth_place: '', birth_date: '', religion: 'Islam', dusun: '', rt: '', rw: '', desa: '', kecamatan: '', kabupaten: '', major_id: '' });
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                if (data.errors.nisn) {
                    setError(data.errors.nisn.join(' ') + ' — NISN sudah ada di database, tidak bisa mendaftar lagi.');
                } else if (data.errors.major_id) {
                    setError(data.errors.major_id.join(' '));
                } else {
                    const msgs = Object.entries(data.errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join(' | ');
                    setError(msgs || data.message);
                }
            } else {
                setError(data?.message || 'Terjadi kesalahan saat pendaftaran. Pastikan semua form terisi.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-50)', padding: '1rem' }}>
                <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '560px', padding: '2rem', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, background: '#fef3c7', color: '#d97706', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Clock3 size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Pendaftaran Diterima — Menunggu Persetujuan</h2>
                    <p style={{ color: 'var(--text-700)', fontSize: '0.95rem', lineHeight: 1.6, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.75rem', padding: '0.9rem 1rem', textAlign: 'left' }}>
                        {success}<br /><br />
                        <b>Apa selanjutnya?</b><br />
                        • Admin akan meninjau data Anda di Dashboard Admin → <b>Persetujuan</b>.<br />
                        • Jika <b>Disetujui</b>, Anda bisa login dengan <b>NISN / Email</b> dan kata sandi yang barusan didaftarkan.<br />
                        • Jika <b>Ditolak</b>, hubungi admin sekolah untuk perbaikan data.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                        <Link to="/login" className="btn btn-primary" style={{ padding: '0.7rem 1.25rem' }}>Ke Halaman Login</Link>
                        <button onClick={() => setSuccess(null)} className="btn btn-secondary" style={{ padding: '0.7rem 1.25rem' }}>Daftar Akun Lain</button>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-500)' }}>Pendaftaran di {websiteName} memerlukan persetujuan admin.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-50)', padding: '1rem' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '640px', padding: '1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.4rem' }}>Formulir Pendaftaran Siswa Baru</h2>
                    <p style={{ color: 'var(--text-500)', fontSize: '0.85rem' }}>Mohon isi data diri Anda dengan sebenar-benarnya untuk pendaftaran di <Link to="/" style={{ color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>{websiteName}</Link>. Semua kolom bertanda <span style={{ color: '#e11d48' }}>*</span> wajib diisi. <b>Setelah daftar, akun menunggu persetujuan admin.</b></p>
                </div>

                {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{error}</div>}

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <div className="form-row" style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
                        <InputLine form={form} setForm={setForm} label="Nama Lengkap" name="full_name" />
                        <InputLine form={form} setForm={setForm} label="Alamat Email" name="email" type="email" />
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
                        <InputLine form={form} setForm={setForm} label="NISN (10 Digit)" name="nisn" />
                        <InputLine form={form} setForm={setForm} label="NIK (16 Digit)" name="nik" />
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
                        <InputLine form={form} setForm={setForm} label="Tempat Lahir" name="birth_place" />
                        <InputLine form={form} setForm={setForm} label="Tanggal Lahir" name="birth_date" type="date" />
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-700)' }}>Agama <span style={{ color: '#e11d48' }}>*</span></label>
                            <select
                                required
                                style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--surface-200)', borderRadius: '0.5rem', outline: 'none', background: 'white' }}
                                value={form.religion}
                                onChange={e => setForm({ ...form, religion: e.target.value })}
                            >
                                <option value="Islam">Islam</option>
                                <option value="Kristen">Kristen</option>
                                <option value="Katolik">Katolik</option>
                                <option value="Hindu">Hindu</option>
                                <option value="Buddha">Buddha</option>
                                <option value="Konghucu">Konghucu</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-700)' }}>Jurusan / Konsentrasi Keahlian <span style={{ color: '#e11d48' }}>*</span></label>
                            <select
                                required
                                style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--surface-200)', borderRadius: '0.5rem', outline: 'none', background: 'white' }}
                                value={form.major_id}
                                onChange={e => setForm({ ...form, major_id: e.target.value })}
                            >
                                <option value="">-- Pilih Jurusan --</option>
                                {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-700)', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-200)' }}>Alamat (isi per kolom — cukup nama, prefix otomatis)</div>
                    <div style={{ background: '#f8fafc', border: '1px solid var(--surface-200)', borderRadius: '0.75rem', padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="form-row" style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
                            <InputLine form={form} setForm={setForm} label="Dusun" name="dusun" placeholder="Krajan" />
                            <div style={{ display: 'flex', gap: '0.9rem', flex: 1 }}>
                                <InputLine form={form} setForm={setForm} label="RT" name="rt" placeholder="003" />
                                <InputLine form={form} setForm={setForm} label="RW" name="rw" placeholder="006" />
                            </div>
                        </div>
                        <div className="form-row" style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
                            <InputLine form={form} setForm={setForm} label="Desa" name="desa" placeholder="Sambirejo" />
                            <InputLine form={form} setForm={setForm} label="Kecamatan" name="kecamatan" placeholder="Genteng" />
                        </div>
                        <InputLine form={form} setForm={setForm} label="Kabupaten" name="kabupaten" placeholder="Banyuwangi" />
                        <div style={{ fontSize: '0.75rem', color: '#64748b', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', padding: '0.5rem 0.6rem' }}>
                            Contoh: Dusun <b>Krajan</b> → tampil <b>Dusun Krajan</b> • RT 3 + RW 6 → <b>RT 003/RW 006</b> • Desa Sambirejo, Kec. Genteng, Kab. Banyuwangi
                        </div>
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
                        <InputLine form={form} setForm={setForm} label="Kata Sandi (Min: 6)" name="password" type="password" />
                        <InputLine form={form} setForm={setForm} label="Konfirmasi Sandi" name="password_confirmation" type="password" />
                    </div>

                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', fontSize: '0.8rem', color: '#92400e', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <Clock3 size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>Setelah <b>Kirim Pendaftaran</b>, akun berstatus <b>Menunggu persetujuan admin</b>. Anda belum bisa login sampai admin menyetujui.</span>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.25rem', width: '100%' }}>
                        {loading ? 'Memproses...' : 'Kirim Pendaftaran'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-500)' }}>
                        Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Masuk di sini</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
