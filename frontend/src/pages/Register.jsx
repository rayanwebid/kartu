import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';

const InputLine = ({ label, name, type = "text", form, setForm }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-700)' }}>{label} <span style={{ color: '#e11d48' }}>*</span></label>
        <input
            type={type} required
            style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--surface-200)', borderRadius: '0.5rem', outline: 'none' }}
            value={form[name]}
            onChange={e => setForm({ ...form, [name]: e.target.value })}
        />
    </div>
);

export default function Register() {
    const [form, setForm] = useState({
        full_name: '', email: '', password: '', password_confirmation: '',
        nisn: '', nik: '', birth_place: '', birth_date: '', religion: 'Islam', address: '', major_id: ''
    });
    const [majors, setMajors] = useState([]);
    const [error, setError] = useState(null);
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
            await api.post('/register', form);
            alert('Pendaftaran berhasil! Silakan masuk.');
            navigate('/login');
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                const msgs = Object.entries(data.errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join(' | ');
                // pesan khusus NISN biar jelas
                if (data.errors.nisn) {
                    setError(data.errors.nisn.join(' ') + ' — NISN sudah ada di database, tidak bisa mendaftar lagi.');
                } else {
                    setError(msgs || data.message);
                }
            } else {
                setError(data?.message || 'Terjadi kesalahan saat pendaftaran. Pastikan semua form terisi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-50)', padding: '2rem 1rem' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>Formulir Pendaftaran Siswa Baru</h2>
                    <p style={{ color: 'var(--text-500)', fontSize: '0.875rem' }}>Mohon isi data diri Anda dengan sebenar-benarnya untuk pendaftaran di <Link to="/" style={{ color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>{websiteName}</Link>. Semua kolom bertanda <span style={{ color: '#e11d48' }}>*</span> wajib diisi.</p>
                </div>

                {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{error}</div>}

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <InputLine form={form} setForm={setForm} label="Nama Lengkap" name="full_name" />
                        <InputLine form={form} setForm={setForm} label="Alamat Email" name="email" type="email" />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <InputLine form={form} setForm={setForm} label="NISN (10 Digit)" name="nisn" />
                        <InputLine form={form} setForm={setForm} label="NIK (16 Digit)" name="nik" />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <InputLine form={form} setForm={setForm} label="Tempat Lahir" name="birth_place" />
                        <InputLine form={form} setForm={setForm} label="Tanggal Lahir" name="birth_date" type="date" />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-700)' }}>Alamat Lengkap <span style={{ color: '#e11d48' }}>*</span></label>
                        <textarea
                            required rows={3}
                            style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--surface-200)', borderRadius: '0.5rem', outline: 'none' }}
                            value={form.address}
                            onChange={e => setForm({ ...form, address: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <InputLine form={form} setForm={setForm} label="Kata Sandi (Min: 6)" name="password" type="password" />
                        <InputLine form={form} setForm={setForm} label="Konfirmasi Sandi" name="password_confirmation" type="password" />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                        {loading ? 'Memproses...' : 'Kirim Pendaftaran'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-500)' }}>
                        Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Masuk di sini</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
