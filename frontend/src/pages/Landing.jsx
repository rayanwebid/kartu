import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { ShieldCheck, Zap, Printer } from 'lucide-react';

export default function Landing() {
    const [content, setContent] = useState(null);

    useEffect(() => {
        // Fetch dynamic content
        api.get('/public/landing-content')
            .then(res => setContent(res.data))
            .catch(console.error);
    }, []);

    const title = content?.hero_title || 'Sistem Informasi Kartu Pelajar';
    const description = content?.hero_description || 'Platform digital terintegrasi untuk pendaftaran, manajemen, dan pencetakan Kartu Pelajar cerdas dengan validasi QR Code responsif.';
    const websiteName = content?.website_name || 'e-Pelajar';

    return (
        <div className="landing-wrapper" style={{ overflowX: 'hidden' }}>
            <nav className="landing-header" style={{ padding: '1.5rem 0', position: 'fixed', top: 0, width: '100%', zIndex: 50, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 40, height: 40, background: 'var(--primary-600)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <ShieldCheck size={24} />
                            </div>
                            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-900)' }}>{websiteName}</span>
                        </div>
                    </Link>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to="/login" style={{ fontWeight: 600, color: 'var(--text-500)', transition: 'color 0.2s' }}>Login</Link>
                        <Link to="/register" className="btn btn-primary">Daftar Baru</Link>
                    </div>
                </div>
            </nav>

            <header style={{ paddingTop: '10rem', paddingBottom: '6rem', minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'radial-gradient(circle at top right, var(--primary-50), transparent)' }}>
                <div className="container animate-fade-in landing-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 10 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', borderRadius: '2rem', boxShadow: 'var(--shadow-sm)', width: 'fit-content' }}>
                            <Zap size={16} color="var(--primary-500)" />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-700)' }}>Generasi Kartu Instan 2026</span>
                        </div>
                        <h1 style={{ fontSize: '3.5rem', letterSpacing: '-0.02em' }}>{title}</h1>
                        <p style={{ fontSize: '1.125rem', color: 'var(--text-500)', maxWidth: '90%', lineHeight: 1.7 }}>
                            {description}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>Mulai Sekarang</Link>
                            <a href="#features" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>Pelajari Fitur</a>
                        </div>
                    </div>

                    <div className="animate-float" style={{ position: 'relative' }}>
                        {/* Abstract background shapes */}
                        <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'var(--primary-100)', borderRadius: '50%', filter: 'blur(40px)', top: '-20%', right: '-10%', zIndex: -1 }}></div>

                        {/* Sample Card */}
                        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', transform: 'rotate(2deg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-600)' }}>KARTU PELAJAR</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-500)' }}>SMA Nusantara Digital</p>
                                </div>
                                <ShieldCheck size={32} color="var(--primary-500)" />
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                                <div style={{ width: '90px', height: '120px', background: '#ccc', borderRadius: '8px', overflow: 'hidden' }}>
                                    <img src="https://ui-avatars.com/api/?name=Siswa+Teladan&background=random&size=200" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-500)', textTransform: 'uppercase' }}>Nama Lengkap</div>
                                        <div style={{ fontWeight: 600 }}>Siswa Teladan</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-500)', textTransform: 'uppercase' }}>NISN / NIK</div>
                                        <div style={{ fontWeight: 500 }}>0012345678 / 3171234567890</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <div style={{ padding: '0.5rem', background: 'white', borderRadius: '8px' }}>
                                    {/* Mock QR */}
                                    <div style={{ width: 64, height: 64, background: 'repeating-linear-gradient(45deg, #000, #000 5px, #fff 5px, #fff 10px)' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
}
