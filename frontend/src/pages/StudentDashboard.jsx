import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { User, CreditCard, LogOut, Upload, Printer, Edit2, Image, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const InputLine = ({ label, name, type = "text", form, setForm, isEditing }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-700)' }}>{label}</label>
        <input
            type={type}
            disabled={!isEditing}
            style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--surface-200)', borderRadius: '0.5rem', outline: 'none', background: isEditing ? 'white' : 'var(--surface-50)' }}
            value={form[name] || ''}
            onChange={e => setForm({ ...form, [name]: e.target.value })}
        />
    </div>
);

export default function StudentDashboard() {
    const { user, logout } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [template, setTemplate] = useState(null);
    const [backTemplate, setBackTemplate] = useState(null);
    const [schoolName, setSchoolName] = useState('KARTU PELAJAR');
    const [websiteName, setWebsiteName] = useState('e-Pelajar');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({});
    const [majors, setMajors] = useState([]);

    useEffect(() => {
        api.get('/siswa/card').then(res => {
            setProfile(res.data.profile);
            setTemplate(res.data.template);
            setBackTemplate(res.data.back_template);
            setSchoolName(res.data.school_name || 'KARTU PELAJAR');
            setWebsiteName(res.data.website_name || 'e-Pelajar');
            setForm(res.data.profile);
        }).catch(console.error).finally(() => setLoading(false));
        api.get('/public/majors').then(res => setMajors(res.data)).catch(() => {
            api.get('/admin/majors').then(res => setMajors(res.data)).catch(() => {});
        });
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            ['full_name', 'birth_place', 'birth_date', 'religion', 'address', 'major_id', 'email'].forEach(k => {
                if (form[k] !== undefined && form[k] !== null && form[k] !== '') formData.append(k, form[k]);
            });
            if (form.photoFile) formData.append('photo', form.photoFile);

            const res = await api.post('/siswa/profile', formData);
            setProfile(res.data);
            // refresh card data biar major name update
            const cardRes = await api.get('/siswa/card');
            setProfile(cardRes.data.profile);
            setForm(cardRes.data.profile);
            setIsEditing(false);
            alert('Profil berhasil diperbarui');
        } catch (err) {
            const msg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : null) || 'Gagal memperbarui profil';
            alert(msg);
        }
    };

    const downloadImage = async (side) => {
        const target = side === 'front' ? document.getElementById('card-front') : document.getElementById('card-back');
        if (target) {
            const oldRadius = target.style.borderRadius;
            target.style.borderRadius = '0px';

            const canvas = await html2canvas(target, { scale: 6, useCORS: true, allowTaint: true, logging: false });

            target.style.borderRadius = oldRadius;

            const link = document.createElement('a');
            link.download = side === 'front' ? `Kartu_Depan_${profile.nisn}.png` : `Kartu_Belakang_${profile.nisn}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };

    const downloadPDF = async () => {
        const front = document.getElementById('card-front');
        const back = document.getElementById('card-back');
        if (!front) return;

        const orientation = template?.orientation === 'landscape' ? 'l' : 'p';
        const w = template?.orientation === 'landscape' ? 86 : 54;
        const h = template?.orientation === 'landscape' ? 54 : 86;

        const doc = new jsPDF({ orientation, unit: 'mm', format: [w, h] });

        const oldFrontRadius = front.style.borderRadius;
        const oldBackRadius = back ? back.style.borderRadius : null;

        front.style.borderRadius = '0px';
        if (back) back.style.borderRadius = '0px';

        if (front) {
            const canvasFront = await html2canvas(front, { scale: 6, useCORS: true, allowTaint: true, logging: false });
            doc.addImage(canvasFront.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, w, h);
        }

        if (back) {
            doc.addPage();
            const canvasBack = await html2canvas(back, { scale: 6, useCORS: true, allowTaint: true, logging: false });
            doc.addImage(canvasBack.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, w, h);
        }

        front.style.borderRadius = oldFrontRadius;
        if (back) back.style.borderRadius = oldBackRadius;

        doc.save(`IDCard_${profile.nisn}.pdf`);
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat data...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--surface-50)', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <nav style={{ background: 'white', padding: '1rem 2rem', borderBottom: '1px solid var(--surface-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary-700)' }}>{websiteName} Dashboard</div>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Halo, {user?.name}</span>
                    <button onClick={logout} className="btn" style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                        <LogOut size={16} style={{ marginRight: '0.5rem' }} /> Keluar
                    </button>
                </div>
            </nav>

            <div className="container" style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', flex: 1 }}>

                {/* Sidebar */}
                <aside style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        onClick={() => setActiveTab('profile')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '0.75rem',
                            background: activeTab === 'profile' ? 'var(--primary-50)' : 'transparent', color: activeTab === 'profile' ? 'var(--primary-700)' : 'var(--text-700)', fontWeight: activeTab === 'profile' ? 600 : 500, transition: 'all 0.2s'
                        }}>
                        <User size={20} /> Biodata Diri
                    </button>
                    <button
                        onClick={() => setActiveTab('card')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '0.75rem',
                            background: activeTab === 'card' ? 'var(--primary-50)' : 'transparent', color: activeTab === 'card' ? 'var(--primary-700)' : 'var(--text-700)', fontWeight: activeTab === 'card' ? 600 : 500, transition: 'all 0.2s'
                        }}>
                        <CreditCard size={20} /> Kartu Pelajar Digital
                    </button>
                </aside>

                {/* Main Content */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="print-area">

                    {activeTab === 'profile' && (
                        <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2>Informasi Profil</h2>
                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                                        <Edit2 size={16} style={{ marginRight: '0.5rem' }} /> Edit Profil
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', background: 'var(--surface-50)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--surface-200)' }}>
                                    <div style={{ width: 100, height: 100, borderRadius: '8px', backgroundColor: 'var(--surface-200)', overflow: 'hidden', border: '3px solid white', boxShadow: 'var(--shadow-sm)', flexShrink: 0, aspectRatio: '1 / 1' }}>
                                        {profile?.photo_path ? (
                                            <img src={`/api/image?path=${profile.photo_path}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                                <User size={40} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Foto Profil</h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-500)', marginBottom: '0.75rem' }}>Persegi 1:1 — JPG/PNG (Maks 2MB). Tidak dipotong oval, tidak ditarik melebar.</p>
                                        <input
                                            type="file" accept="image/png, image/jpeg"
                                            disabled={!isEditing}
                                            onChange={e => setForm({ ...form, photoFile: e.target.files[0] })}
                                            style={{ fontSize: '0.875rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <InputLine form={form} setForm={setForm} isEditing={isEditing} label="Nama Lengkap" name="full_name" />
                                    <InputLine form={form} setForm={setForm} isEditing={isEditing} label="Alamat Email" name="email" />

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-700)' }}>NISN (Terkunci)</label>
                                        <input type="text" disabled style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--surface-200)', borderRadius: '0.5rem', background: '#e2e8f0' }} value={profile?.nisn || ''} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-700)' }}>NIK (Terkunci)</label>
                                        <input type="text" disabled style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--surface-200)', borderRadius: '0.5rem', background: '#e2e8f0' }} value={profile?.nik || ''} />
                                    </div>

                                    <InputLine form={form} setForm={setForm} isEditing={isEditing} label="Tempat Lahir" name="birth_place" />
                                    <InputLine form={form} setForm={setForm} isEditing={isEditing} label="Tanggal Lahir" name="birth_date" type="date" />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-700)' }}>Agama</label>
                                    <select
                                        disabled={!isEditing}
                                        style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--surface-200)', borderRadius: '0.5rem', outline: 'none', background: isEditing ? 'white' : 'var(--surface-50)' }}
                                        value={form.religion || ''}
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
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-700)' }}>Jurusan / Konsentrasi Keahlian</label>
                                    <select
                                        disabled={!isEditing}
                                        style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--surface-200)', borderRadius: '0.5rem', outline: 'none', background: isEditing ? 'white' : 'var(--surface-50)' }}
                                        value={form.major_id || ''}
                                        onChange={e => setForm({ ...form, major_id: e.target.value })}
                                    >
                                        <option value="">-- Pilih Jurusan --</option>
                                        {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                    {!isEditing && profile?.major?.name && (
                                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Saat ini: {profile.major.name}</span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-700)' }}>Alamat Lengkap</label>
                                    <textarea
                                        disabled={!isEditing}
                                        rows={3}
                                        style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--surface-200)', borderRadius: '0.5rem', outline: 'none', background: isEditing ? 'white' : 'var(--surface-50)' }}
                                        value={form.address || ''}
                                        onChange={e => setForm({ ...form, address: e.target.value })}
                                    />
                                </div>

                                {isEditing && (
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                                        <button type="button" onClick={() => { setIsEditing(false); setForm(profile); }} className="btn btn-secondary">Batal</button>
                                        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Simpan Perubahan</button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {activeTab === 'card' && (
                        <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="no-print">
                                <h2>Cetak Kartu Pelajar</h2>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button onClick={() => downloadImage('front')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                                        <Image size={16} style={{ marginRight: '0.5rem' }} /> PNG (Depan)
                                    </button>
                                    {backTemplate && (
                                        <button onClick={() => downloadImage('back')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                                            <Image size={16} style={{ marginRight: '0.5rem' }} /> PNG (Belakang)
                                        </button>
                                    )}
                                    <button onClick={downloadPDF} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                        <FileText size={16} style={{ marginRight: '0.5rem' }} /> Download (PDF)
                                    </button>
                                </div>
                            </div>

                            <div style={{ padding: '2rem', background: 'var(--surface-100)', borderRadius: '1rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}>
                                {/* Front ID Card Canvas */}
                                <div id="card-front" className="id-card" style={{
                                    width: template?.orientation === 'portrait' ? '54mm' : '86mm',
                                    height: template?.orientation === 'portrait' ? '86mm' : '54mm',
                                    background: template?.background_image_path ? `url(/api/image?path=${template.background_image_path}) no-repeat center/cover` : 'white',
                                    position: 'relative',
                                    borderRadius: '8px',
                                    boxShadow: 'var(--shadow-md)',
                                    overflow: 'hidden',
                                    backgroundColor: 'white'
                                }}>
                                    {/* Default Layout responsive strictly based on orientation */}
                                    {template?.orientation === 'portrait' ? (
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

                                            {/* Header Section */}
                                            <div style={{ display: 'flex', alignItems: 'center', padding: '6px 16px 2px 16px', gap: '8px', zIndex: 10 }}>
                                                {template?.logo_image_path ? (
                                                    <img src={`/api/image?path=${template.logo_image_path}`} crossOrigin="anonymous" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
                                                ) : (
                                                    <div style={{ width: '38px', height: '38px' }} />
                                                )}

                                                <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                    <div style={{ fontSize: '4.5px', textTransform: 'uppercase', color: 'white', fontWeight: 600, letterSpacing: '0.2px' }}>{template?.foundation_name || 'NAMA YAYASAN'}</div>
                                                    <div style={{ fontSize: '7.5px', fontWeight: 900, color: '#FFFF00', textShadow: '1px 1px 1px rgba(0,0,0,0.5)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden' }}>{template?.school_name || 'NAMA SEKOLAH'}</div>
                                                    <div style={{ fontSize: '5px', fontWeight: 700, color: '#FFFF00', marginTop: '1px' }}>{template?.accreditation || 'TERAKREDITASI'}</div>
                                                    <div style={{ fontSize: '4px', color: 'white', marginTop: '2px', background: 'rgba(0,0,40,0.4)', padding: '1px 3px', borderRadius: '2px', display: 'inline-block', alignSelf: 'center' }}>{template?.school_address || 'Alamat Sekolah'}</div>
                                                </div>
                                            </div>

                                            {/* Media Section: Photo & QR — persegi 1:1, tidak oval, tidak ketarik */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 18px', marginTop: '2px', zIndex: 10 }}>
                                                <div style={{ width: '75px', height: '75px', aspectRatio: '1 / 1', border: '2px solid white', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', backgroundColor: '#ccc', flexShrink: 0 }}>
                                                    {profile?.photo_path && <img src={`/api/image?path=${profile.photo_path}`} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />}
                                                </div>
                                                <div style={{ width: '65px', height: '65px', background: 'white', padding: '4px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                                    {profile?.nisn && <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${profile.nisn}`} crossOrigin="anonymous" style={{ width: '100%', height: '100%' }} />}
                                                </div>
                                            </div>

                                            {/* Biodata Section */}
                                            <div style={{ padding: '0 14px', marginTop: '4px', zIndex: 10 }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7px', fontFamily: '"Arial", sans-serif', color: '#0f172a', fontWeight: 600 }}>
                                                    <tbody>
                                                        <tr><td style={{ width: '32%', paddingBottom: '2px' }}>Nama</td><td style={{ width: '4%', paddingBottom: '2px' }}>:</td><td style={{ paddingBottom: '2px', textTransform: 'uppercase' }}>{profile?.full_name}</td></tr>
                                                        <tr><td style={{ paddingBottom: '2px' }}>NIK / NIS</td><td style={{ paddingBottom: '2px' }}>:</td><td style={{ paddingBottom: '2px' }}>{profile?.nik} / {profile?.nisn}</td></tr>
                                                        <tr><td style={{ paddingBottom: '2px' }}>Tempat, Tgl Lahir</td><td style={{ paddingBottom: '2px' }}>:</td><td style={{ paddingBottom: '2px' }}>{profile?.birth_place}, {profile?.birth_date}</td></tr>
                                                        <tr><td style={{ paddingBottom: '2px' }}>Agama</td><td style={{ paddingBottom: '2px' }}>:</td><td style={{ paddingBottom: '2px' }}>{profile?.religion}</td></tr>
                                                        <tr><td style={{ paddingBottom: '2px' }}>Konsentrasi Keahlian</td><td style={{ paddingBottom: '2px' }}>:</td><td style={{ paddingBottom: '2px' }}>{profile?.major?.name || ''}</td></tr>
                                                        <tr>
                                                            <td style={{ verticalAlign: 'top' }}>Alamat</td>
                                                            <td style={{ verticalAlign: 'top' }}>:</td>
                                                            <td style={{ lineHeight: '1.2' }}>{profile?.address}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Footer Section */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 14px', marginTop: 'auto', marginBottom: '8px', alignItems: 'flex-end', zIndex: 10 }}>
                                                <div style={{ background: '#e11d48', color: 'white', padding: '4px 6px', fontSize: '5.5px', fontWeight: 800, textAlign: 'center', lineHeight: '1.2', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                                    BERLAKU SELAMA<br />MENJADI SISWA
                                                </div>

                                                <div style={{ textAlign: 'center', fontSize: '5px', color: '#0f172a', fontWeight: 700, width: '75px', position: 'relative' }}>
                                                    <div>{template?.sign_place_date || 'Banyuwangi, 17 Juli 2024'}</div>
                                                    <div style={{ marginTop: '2px' }}>Kepala Sekolah,</div>

                                                    <div style={{ position: 'relative', height: '35px', margin: '2px 0' }}>
                                                        {template?.signature_image_path && (
                                                            <img src={`/api/image?path=${template.signature_image_path}`} crossOrigin="anonymous" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120%', maxHeight: '42px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                                                        )}
                                                    </div>

                                                    <div style={{ fontWeight: 800, textDecoration: 'underline' }}>{template?.principal_name || 'NAMA KEPALA SEKOLAH'}</div>
                                                    <div style={{ marginTop: '1px' }}>{template?.principal_nip || 'NIP/NBM. -'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ marginLeft: '50px', textAlign: 'center', marginBottom: '8px' }}>
                                                <h4 style={{ fontSize: '10px', color: '#1e3a8a', fontWeight: 800 }}>KARTU TANDA PELAJAR</h4>
                                                <h5 style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 800 }}>{schoolName}</h5>
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px', flex: 1, marginTop: '8px' }}>
                                                {/* Photo — persegi 1:1 */}
                                                <div style={{ width: '70px', height: '70px', aspectRatio: '1 / 1', background: '#ccc', borderRadius: '6px', overflow: 'hidden', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', flexShrink: 0 }}>
                                                    {profile?.photo_path && <img src={`/api/image?path=${profile.photo_path}`} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />}
                                                </div>

                                                {/* Data */}
                                                <div style={{ flex: 1, fontSize: '9px', display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: 600 }}>
                                                    <div style={{ display: 'flex' }}><span style={{ width: '60px' }}>Nama</span><span>: {profile?.full_name}</span></div>
                                                    <div style={{ display: 'flex' }}><span style={{ width: '60px' }}>NISN / NIK</span><span>: {profile?.nisn} / {profile?.nik}</span></div>
                                                    <div style={{ display: 'flex' }}><span style={{ width: '60px' }}>TTL</span><span>: {profile?.birth_place}, {profile?.birth_date}</span></div>
                                                    <div style={{ display: 'flex' }}><span style={{ width: '60px' }}>Agama</span><span>: {profile?.religion}</span></div>
                                                    <div style={{ display: 'flex' }}><span style={{ width: '60px' }}>Alamat</span><span>: {profile?.address}</span></div>
                                                </div>
                                            </div>

                                            {/* QR Code pseudo element */}
                                            <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '40px', height: '40px', background: 'white', padding: '2px', border: '1px solid #ccc' }}>
                                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${profile?.nisn}`} crossOrigin="anonymous" style={{ width: '100%', height: '100%' }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {backTemplate && (
                                    <div id="card-back" className="id-card" style={{
                                        width: backTemplate?.orientation === 'portrait' ? '54mm' : '86mm',
                                        height: backTemplate?.orientation === 'portrait' ? '86mm' : '54mm',
                                        background: backTemplate?.background_image_path ? `url(/api/image?path=${backTemplate.background_image_path}) no-repeat center/cover` : 'white',
                                        position: 'relative',
                                        borderRadius: '8px',
                                        boxShadow: 'var(--shadow-md)',
                                        overflow: 'hidden',
                                        backgroundColor: 'white'
                                    }}>
                                        {/* Blank card with only background for Back */}
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></div>
                                    </div>
                                )}

                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* CSS for print injection */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; }
                    .no-print { display: none; }
                    .id-card { box-shadow: none !important; border: 1px solid #ddd; }
                    @page { size: auto; margin: 0; }
                }
            `}</style>
        </div>
    );
}
