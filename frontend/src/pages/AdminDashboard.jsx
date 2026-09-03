import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { Users, LayoutTemplate, Settings, GraduationCap, LogOut, Check, X, Plus, Edit2, Save, Trash } from 'lucide-react';

export default function AdminDashboard() {
    const { user, logout } = useAuthStore();
    const [activeTab, setActiveTab] = useState('students');

    // Core States
    const [students, setStudents] = useState([]);
    const [majors, setMajors] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [landing, setLanding] = useState({});

    // Forms Flow States
    const [addStudentMod, setAddStudentMod] = useState(false);
    const [addTemplateMod, setAddTemplateMod] = useState(false);
    const [studentForm, setStudentForm] = useState({});
    const [templateForm, setTemplateForm] = useState({});

    useEffect(() => { loadData(); }, [activeTab]);

    const loadData = () => {
        if (activeTab === 'students') api.get('/admin/students').then(res => setStudents(res.data.data)).catch(console.error);
        if (activeTab === 'majors') api.get('/admin/majors').then(res => setMajors(res.data)).catch(console.error);
        if (activeTab === 'templates') api.get('/admin/templates').then(res => setTemplates(res.data)).catch(console.error);
        if (activeTab === 'landing') api.get('/admin/landing-contents').then(res => setLanding(res.data)).catch(console.error);
    };

    // Major Handlers
    const addMajor = async () => {
        const name = prompt("Masukkan nama jurusan baru:");
        if (name) {
            await api.post('/admin/majors', { name });
            loadData();
        }
    };
    const editMajor = async (m) => {
        const name = prompt("Edit nama jurusan:", m.name);
        if (name) {
            await api.put(`/admin/majors/${m.id}`, { name });
            loadData();
        }
    };
    const deleteMajor = async (id) => {
        if (window.confirm("Hapus jurusan?")) {
            await api.delete(`/admin/majors/${id}`);
            loadData();
        }
    };

    // Student Handlers
    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/students', studentForm);
            alert("Siswa Didaftarkan!");
            setAddStudentMod(false);
            setStudentForm({});
            loadData();
        } catch (err) { alert(err.response?.data?.message || "Gagal mendaftarkan siswa."); }
    };
    const deleteStudent = async (id) => {
        if (window.confirm("Hapus siswa ini dari sistem?")) {
            await api.delete(`/admin/students/${id}`);
            loadData();
        }
    };

    // Template Handlers
    const editTemplate = (t) => {
        setTemplateForm(t);
        setAddTemplateMod(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTemplateSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.keys(templateForm).forEach(k => {
                if (templateForm[k] instanceof File) {
                    formData.append(k, templateForm[k]);
                } else if (
                    templateForm[k] !== undefined &&
                    templateForm[k] !== null &&
                    !k.endsWith('_path') &&
                    k !== 'id' &&
                    k !== 'created_at' &&
                    k !== 'updated_at' &&
                    k !== 'layout_coordinates'
                ) {
                    if (typeof templateForm[k] === 'boolean') {
                        formData.append(k, templateForm[k] ? 1 : 0);
                    } else if (typeof templateForm[k] !== 'object') {
                        formData.append(k, templateForm[k]);
                    }
                }
            });

            if (templateForm.id) {
                formData.append('_method', 'PUT');
                await api.post(`/admin/templates/${templateForm.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                alert("Template diperbarui!");
            } else {
                await api.post('/admin/templates', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                alert("Template ditambahkan!");
            }

            setAddTemplateMod(false);
            setTemplateForm({});
            loadData();
        } catch (err) { alert("Gagal menyimpan template: " + (err.response?.data?.message || err.message)); }
    };
    const deleteTemplate = async (id) => {
        if (window.confirm("Hapus desain ini?")) {
            await api.delete(`/admin/templates/${id}`);
            loadData();
        }
    };

    const saveLanding = async (e) => {
        e.preventDefault();
        await api.post('/admin/landing-contents', landing);
        alert('Sukses diperbarui!');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--surface-50)', display: 'flex', flexDirection: 'column' }}>
            <nav style={{ background: 'white', padding: '1rem 2rem', borderBottom: '1px solid var(--surface-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary-700)' }}>{landing?.website_name || 'e-Pelajar'}</div>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Admin: {user?.name}</span>
                    <button onClick={logout} className="btn" style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                        <LogOut size={16} /> Keluar
                    </button>
                </div>
            </nav>

            <div className="container" style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', flex: 1, alignItems: 'flex-start' }}>
                <aside style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <TabButton icon={<Users size={20} />} label="Daftar Siswa" tab="students" current={activeTab} set={setActiveTab} />
                    <TabButton icon={<GraduationCap size={20} />} label="Master Jurusan" tab="majors" current={activeTab} set={setActiveTab} />
                    <TabButton icon={<LayoutTemplate size={20} />} label="Template Kartu" tab="templates" current={activeTab} set={setActiveTab} />
                    <TabButton icon={<Settings size={20} />} label="Konten Beranda" tab="landing" current={activeTab} set={setActiveTab} />
                </aside>

                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                    {activeTab === 'students' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2>Kelola Siswa Berjalan</h2>
                                <button onClick={() => setAddStudentMod(!addStudentMod)} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                    {addStudentMod ? 'Tutup Pendaftaran' : <><Plus size={16} /> Daftar Baru</>}
                                </button>
                            </div>

                            {addStudentMod ? (
                                <form onSubmit={handleStudentSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--surface-50)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                                    <Input c="2" l="Nama Lengkap" v={studentForm.full_name} onChange={e => setStudentForm({ ...studentForm, full_name: e.target.value })} />
                                    <Input l="Email Akses" type="email" v={studentForm.email} onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} />
                                    <Input l="Password Akses (Min 6)" type="password" v={studentForm.password} onChange={e => setStudentForm({ ...studentForm, password: e.target.value })} />
                                    <Input l="NISN (10 Digit)" v={studentForm.nisn} onChange={e => setStudentForm({ ...studentForm, nisn: e.target.value })} />
                                    <Input l="NIK (16 Digit)" v={studentForm.nik} onChange={e => setStudentForm({ ...studentForm, nik: e.target.value })} />
                                    <Input l="Tempat Lahir" v={studentForm.birth_place} onChange={e => setStudentForm({ ...studentForm, birth_place: e.target.value })} />
                                    <Input l="Tanggal Lahir" type="date" v={studentForm.birth_date} onChange={e => setStudentForm({ ...studentForm, birth_date: e.target.value })} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Agama</label>
                                        <select required className="form-input" onChange={e => setStudentForm({ ...studentForm, religion: e.target.value })} style={{ padding: '0.6rem' }}>
                                            <option value="">-- Pilih --</option>
                                            <option value="Islam">Islam</option><option value="Kristen">Kristen</option>
                                            <option value="Katolik">Katolik</option><option value="Hindu">Hindu</option>
                                            <option value="Buddha">Buddha</option><option value="Konghucu">Konghucu</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Jurusan</label>
                                        {/* Needs major fetch but for simplicity we assume manual ID typing or select, I'll provide a number input */}
                                        <input type="number" required placeholder="ID Jurusan (contoh: 1)" className="form-input" style={{ padding: '0.6rem' }} onChange={e => setStudentForm({ ...studentForm, major_id: e.target.value })} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Alamat Lengkap</label>
                                        <textarea required rows="2" className="form-input" style={{ padding: '0.6rem' }} onChange={e => setStudentForm({ ...studentForm, address: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>Simpan Akun Siswa</button>
                                </form>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                                    <thead style={{ background: 'var(--surface-100)' }}>
                                        <tr><th style={{ padding: '1rem' }}>Nama</th><th style={{ padding: '1rem' }}>Kredensial</th><th style={{ padding: '1rem' }}>Opsi</th></tr>
                                    </thead>
                                    <tbody>
                                        {students.map(s => (
                                            <tr key={s.id} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                                <td style={{ padding: '1rem', fontWeight: 500 }}>{s.full_name} <br /><span style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.major?.name || 'ID Jurusan: ' + s.major_id}</span></td>
                                                <td style={{ padding: '1rem' }}>{s.nisn} <br /><span style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.nik}</span></td>
                                                <td style={{ padding: '1rem' }}>
                                                    <button onClick={() => deleteStudent(s.id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'red' }}><Trash size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {activeTab === 'majors' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2>Master Data Jurusan</h2>
                                <button onClick={addMajor} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}><Plus size={16} /> Jurusan Baru</button>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'var(--surface-100)' }}><tr><th style={{ padding: '1rem' }}>ID</th><th style={{ padding: '1rem' }}>Nama Konsentrasi</th><th style={{ padding: '1rem', textAlign: 'right' }}>Opsi</th></tr></thead>
                                <tbody>
                                    {majors.map(m => (
                                        <tr key={m.id} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                            <td style={{ padding: '1rem' }}>{m.id}</td>
                                            <td style={{ padding: '1rem' }}>{m.name}</td>
                                            <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button onClick={() => editMajor(m)} className="btn btn-secondary" style={{ padding: '0.4rem' }}><Edit2 size={16} /></button>
                                                <button onClick={() => deleteMajor(m.id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'red' }}><Trash size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2>Generator Desain Cetak Kartu</h2>
                                <button onClick={() => { setAddTemplateMod(!addTemplateMod); setTemplateForm({}); }} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                    {addTemplateMod ? 'Batal' : <><Plus size={16} /> Unggah Desain Baru</>}
                                </button>
                            </div>

                            {addTemplateMod && (
                                <form onSubmit={handleTemplateSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--surface-50)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid var(--surface-200)' }}>

                                    <div style={{ gridColumn: 'span 2', fontWeight: 700, fontSize: '1rem', color: 'var(--primary-700)', marginBottom: '0.5rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>Informasi Sistem & Orientasi</div>
                                    <Input l="Nama Tanda / Tag (Info Admin)" v={templateForm.template_name} onChange={e => setTemplateForm({ ...templateForm, template_name: e.target.value })} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Tipe Kartu / Sisi</label>
                                        <select required className="form-input" onChange={e => setTemplateForm({ ...templateForm, card_type: e.target.value })} value={templateForm.card_type || ''} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '0.3rem' }}>
                                            <option value="">-- Pilih Sisi --</option>
                                            <option value="front">Kartu Depan Utama</option>
                                            <option value="back">Kartu Belakang (Spesifikasi Ringan)</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Orientasi Kertas</label>
                                        <select required className="form-input" onChange={e => setTemplateForm({ ...templateForm, orientation: e.target.value })} value={templateForm.orientation || ''} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '0.3rem' }}>
                                            <option value="">-- Pilih --</option>
                                            <option value="landscape">Lanskap (Mendatar)</option>
                                            <option value="portrait">Potret (Berdiri)</option>
                                        </select>
                                    </div>

                                    <div style={{ gridColumn: 'span 2', fontWeight: 700, fontSize: '1rem', color: 'var(--primary-700)', margin: '0.5rem 0', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>Teks Kop Kartu & Instansi</div>
                                    <Input l="Nama Yayasan (Maks: 2 Baris)" disabled={templateForm.card_type === 'back'} v={templateForm.card_type === 'back' ? '' : templateForm.foundation_name} onChange={e => setTemplateForm({ ...templateForm, foundation_name: e.target.value })} />
                                    <Input l="Nama Sekolah (Utama)" disabled={templateForm.card_type === 'back'} v={templateForm.card_type === 'back' ? '' : templateForm.school_name} onChange={e => setTemplateForm({ ...templateForm, school_name: e.target.value })} />
                                    <Input l="Status Akreditasi" disabled={templateForm.card_type === 'back'} v={templateForm.card_type === 'back' ? '' : templateForm.accreditation} onChange={e => setTemplateForm({ ...templateForm, accreditation: e.target.value })} />
                                    <Input l="Alamat Cabang Sekolah" disabled={templateForm.card_type === 'back'} v={templateForm.card_type === 'back' ? '' : templateForm.school_address} onChange={e => setTemplateForm({ ...templateForm, school_address: e.target.value })} />

                                    <div style={{ gridColumn: 'span 2', fontWeight: 700, fontSize: '1rem', color: 'var(--primary-700)', margin: '0.5rem 0', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>Area Tanda Tangan</div>
                                    <Input l="Tempat, Tanggal Pengesahan" disabled={templateForm.card_type === 'back'} v={templateForm.card_type === 'back' ? '' : templateForm.sign_place_date} onChange={e => setTemplateForm({ ...templateForm, sign_place_date: e.target.value })} />
                                    <Input l="Nama Tersignatur (Kepala Sekolah)" disabled={templateForm.card_type === 'back'} v={templateForm.card_type === 'back' ? '' : templateForm.principal_name} onChange={e => setTemplateForm({ ...templateForm, principal_name: e.target.value })} />
                                    <Input l="Teks NBM / NIP" disabled={templateForm.card_type === 'back'} v={templateForm.card_type === 'back' ? '' : templateForm.principal_nip} onChange={e => setTemplateForm({ ...templateForm, principal_nip: e.target.value })} />

                                    <div style={{ gridColumn: 'span 2', fontWeight: 700, fontSize: '1rem', color: 'var(--primary-700)', margin: '0.5rem 0', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>Media Visual</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Gambar Blanko / Background (Opsional)</label>
                                        <input type="file" accept="image/*" className="form-input" style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '0.3rem' }} onChange={e => setTemplateForm({ ...templateForm, background_image: e.target.files[0] })} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', opacity: templateForm.card_type === 'back' ? 0.5 : 1 }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Logo Instansi (Opsional)</label>
                                        <input type="file" accept="image/*" disabled={templateForm.card_type === 'back'} className="form-input" style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '0.3rem', background: templateForm.card_type === 'back' ? '#f1f5f9' : 'white' }} onChange={e => setTemplateForm({ ...templateForm, logo_image: e.target.files[0] })} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', opacity: templateForm.card_type === 'back' ? 0.5 : 1 }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Tanda Tangan & Stempel (Opsional)</label>
                                        <input type="file" accept="image/*" disabled={templateForm.card_type === 'back'} className="form-input" style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '0.3rem', background: templateForm.card_type === 'back' ? '#f1f5f9' : 'white' }} onChange={e => setTemplateForm({ ...templateForm, signature_image: e.target.files[0] })} />
                                    </div>

                                    <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2', marginTop: '1rem', padding: '0.75rem' }}>
                                        {templateForm.id ? 'Perbarui Template' : 'Simpan Ke Dalam Sistem'}
                                    </button>
                                </form>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {templates.map(t => (
                                    <div key={t.id} style={{ border: '1px solid var(--surface-200)', borderRadius: '1rem', padding: '1.5rem', position: 'relative' }}>
                                        {t.background_image_path && <div style={{ width: '100%', height: '100px', background: `url(/storage/${t.background_image_path}) no-repeat center/cover`, marginBottom: '1rem', borderRadius: '0.5rem' }} />}
                                        <h3 style={{ fontSize: '1rem' }}>{t.template_name}</h3>
                                        <div style={{ padding: '2px 6px', background: t.card_type === 'back' ? '#4f46e5' : '#e11d48', color: 'white', fontSize: '0.7rem', display: 'inline-block', borderRadius: '4px', marginTop: '4px', fontWeight: 600 }}>{t.card_type === 'back' ? 'KARTU BELAKANG' : 'KARTU DEPAN'}</div>
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-500)', display: 'flex', gap: '1rem' }}>
                                            <span>Posisi: {t.orientation}</span>
                                            {t.is_active ? <span style={{ color: '#166534', fontWeight: 700 }}>● Default Server</span> : <span>○ Non-aktif</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                            {!t.is_active && (
                                                <button onClick={() => api.put(`/admin/templates/${t.id}`, { is_active: true }).then(loadData)} className="btn btn-secondary" style={{ flex: 1 }}>Jadikan Utama</button>
                                            )}
                                            <button onClick={() => editTemplate(t)} className="btn btn-secondary" style={{ padding: '0.5rem', color: '#1d4ed8' }}><Edit2 size={16} /></button>
                                            <button onClick={() => deleteTemplate(t.id)} className="btn btn-secondary" style={{ padding: '0.5rem', color: 'red' }}><Trash size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'landing' && (
                        <div>
                            <h2>Konfigurasi Tampilan Halaman Depan</h2>
                            <form onSubmit={saveLanding} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', maxWidth: '600px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nama Sistem (Header / Website Name)</label>
                                    <input type="text" className="form-input" style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }} value={landing.website_name || ''} onChange={e => setLanding({ ...landing, website_name: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nama Sekolah / Instansi (Hero Title)</label>
                                    <input type="text" className="form-input" style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }} value={landing.hero_title || ''} onChange={e => setLanding({ ...landing, hero_title: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Slogan / Kalimat Pembuka (Hero Sub)</label>
                                    <textarea rows={3} style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', fontFamily: 'inherit' }} value={landing.hero_description || ''} onChange={e => setLanding({ ...landing, hero_description: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}><Save size={16} style={{ marginRight: '0.5rem' }} /> Simpan CMS Beranda</button>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

const TabButton = ({ icon, label, tab, current, set }) => (
    <button
        onClick={() => set(tab)}
        style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '0.75rem',
            background: current === tab ? 'var(--primary-50)' : 'transparent', color: current === tab ? 'var(--primary-700)' : 'var(--text-700)',
            fontWeight: current === tab ? 600 : 500, transition: 'all 0.2s', border: 'none', cursor: 'pointer', textAlign: 'left'
        }}>
        {icon} {label}
    </button>
);

const Input = ({ l, v, onChange, type = "text", c = "1", disabled = false }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: `span ${c}`, opacity: disabled ? 0.6 : 1 }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>{l}</label>
        <input required={!disabled} disabled={disabled} type={type} className="form-input" style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '0.3rem', background: disabled ? '#f1f5f9' : 'white', cursor: disabled ? 'not-allowed' : 'text' }} value={v || ''} onChange={onChange} />
    </div>
);
