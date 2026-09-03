import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const login = useAuthStore(state => state.login);
    const navigate = useNavigate();
    const [websiteName, setWebsiteName] = useState('e-Pelajar');

    useEffect(() => {
        api.get('/public/landing-content')
            .then(res => {
                if (res.data?.website_name) setWebsiteName(res.data.website_name);
            }).catch(console.error);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const data = await login(credentials);
            if (data?.user?.role === 'admin') navigate('/admin');
            else navigate('/siswa');
        } catch (err) {
            const data = err.response?.data;
            // Laravel ValidationException: errors.email[0] berisi pesan pending/rejected
            const msg = data?.errors?.email?.[0] || data?.message || 'Login gagal. Periksa kembali kredensial Anda.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-50)' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem 2rem' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ width: 48, height: 48, background: 'var(--primary-600)', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1rem' }}>
                            <ShieldCheck size={28} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Selamat Datang</h2>
                        <p style={{ color: 'var(--text-500)', fontSize: '0.875rem' }}>Masuk untuk mengelola <b>{websiteName}</b> Anda</p>
                    </div>
                </Link>

                {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-700)' }}>Alamat Email / Username (NISN)</label>
                        <input
                            type="text"
                            required
                            inputMode="text"
                            autoComplete="username"
                            style={{ padding: '0.75rem 1rem', border: '1px solid var(--surface-200)', borderRadius: '0.5rem', outline: 'none', transition: 'all 0.2s' }}
                            placeholder="NISN (contoh: 0117030646) atau nisn@kartu.smkmuda.id / admin@admin.com"
                            value={credentials.email}
                            onChange={e => setCredentials({ ...credentials, email: e.target.value.trim() })}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Siswa bisa login pakai NISN saja (tanpa @kartu.smkmuda.id)</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-700)' }}>Kata Sandi</label>
                        <input
                            type="password"
                            required
                            style={{ padding: '0.75rem 1rem', border: '1px solid var(--surface-200)', borderRadius: '0.5rem', outline: 'none' }}
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
                        {loading ? 'Memproses...' : 'Masuk Sekarang'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-500)' }}>
                        Belum punya akun? <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Daftar sebagai siswa</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
