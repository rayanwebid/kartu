import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Reuse identical rendering to StudentDashboard.jsx: same ids card-front/card-back, same html2canvas scale:6
export async function downloadCardImage(side, nisn) {
    const target = document.getElementById(side === 'front' ? 'card-front' : 'card-back');
    if (!target) return;
    const old = target.style.borderRadius;
    target.style.borderRadius = '0px';
    const canvas = await html2canvas(target, { scale: 6, useCORS: true, allowTaint: true, logging: false });
    target.style.borderRadius = old;
    const a = document.createElement('a');
    a.download = side === 'front' ? `Kartu_Depan_${nisn}.png` : `Kartu_Belakang_${nisn}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
}

export async function downloadCardPDF(profile, template, backTemplate) {
    const front = document.getElementById('card-front');
    if (!front) return;
    const back = document.getElementById('card-back');
    const orientation = template?.orientation === 'landscape' ? 'l' : 'p';
    const w = template?.orientation === 'landscape' ? 86 : 54;
    const h = template?.orientation === 'landscape' ? 54 : 86;
    const doc = new jsPDF({ orientation, unit: 'mm', format: [w, h] });
    const oldFront = front.style.borderRadius;
    const oldBack = back ? back.style.borderRadius : null;
    front.style.borderRadius = '0px';
    if (back) back.style.borderRadius = '0px';
    const cf = await html2canvas(front, { scale: 6, useCORS: true, allowTaint: true, logging: false });
    doc.addImage(cf.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, w, h);
    if (back) {
        doc.addPage();
        const cb = await html2canvas(back, { scale: 6, useCORS: true, allowTaint: true, logging: false });
        doc.addImage(cb.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, w, h);
    }
    front.style.borderRadius = oldFront;
    if (back) back.style.borderRadius = oldBack;
    doc.save(`IDCard_${profile.nisn}.pdf`);
}

export function StudentCard({ profile, template, backTemplate, schoolName }) {
    if (!profile) return null;
    return (
        <div style={{ padding: '2rem', background: 'var(--surface-100)', borderRadius: '1rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}>
            <div id="card-front" className="id-card" style={{
                width: template?.orientation === 'portrait' ? '54mm' : '86mm',
                height: template?.orientation === 'portrait' ? '86mm' : '54mm',
                background: template?.background_image_path ? `url(/api/image?path=${template.background_image_path}) no-repeat center/cover` : 'white',
                position: 'relative', borderRadius: '8px', boxShadow: 'var(--shadow-md)', overflow: 'hidden', backgroundColor: 'white'
            }}>
                {template?.orientation === 'portrait' ? (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 16px 2px 16px', gap: '8px', zIndex: 10 }}>
                            {template?.logo_image_path ? <img src={`/api/image?path=${template.logo_image_path}`} crossOrigin="anonymous" style={{ width: '38px', height: '38px', objectFit: 'contain' }} /> : <div style={{ width: '38px', height: '38px' }} />}
                            <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ fontSize: '4.5px', textTransform: 'uppercase', color: 'white', fontWeight: 600 }}>{template?.foundation_name || 'NAMA YAYASAN'}</div>
                                <div style={{ fontSize: '7.5px', fontWeight: 900, color: '#FFFF00', textShadow: '1px 1px 1px rgba(0,0,0,0.5)', marginTop: '2px' }}>{template?.school_name || 'NAMA SEKOLAH'}</div>
                                <div style={{ fontSize: '5px', fontWeight: 700, color: '#FFFF00' }}>{template?.accreditation || 'TERAKREDITASI'}</div>
                                <div style={{ fontSize: '4px', color: 'white', marginTop: '2px', background: 'rgba(0,0,40,0.4)', padding: '1px 3px', borderRadius: '2px', display: 'inline-block', alignSelf: 'center' }}>{template?.school_address || 'Alamat Sekolah'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 18px', marginTop: '2px', zIndex: 10 }}>
                            <div style={{ width: '62px', height: '82px', aspectRatio: '3 / 4', border: '2px solid white', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', backgroundColor: '#ccc', flexShrink: 0 }}>
                                {profile?.photo_path && <img src={`/api/image?path=${profile.photo_path}`} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />}
                            </div>
                            <div style={{ width: '65px', height: '65px', background: 'white', padding: '4px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                {profile?.nisn && <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${profile.nisn}`} crossOrigin="anonymous" style={{ width: '100%', height: '100%' }} />}
                            </div>
                        </div>
                        <div style={{ padding: '0 14px', marginTop: '3px', zIndex: 10 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.5px', fontFamily: '"Arial", sans-serif', color: '#0f172a', fontWeight: 700, lineHeight: '1.15' }}>
                                <tbody>
                                    <tr><td style={{ width: '32%', paddingBottom: '1.5px' }}>Nama</td><td style={{ width: '4%', paddingBottom: '1.5px' }}>:</td><td style={{ paddingBottom: '1.5px', textTransform: 'uppercase', wordBreak: 'break-word' }}>{(profile?.full_name || '').toUpperCase()}</td></tr>
                                    <tr><td style={{ paddingBottom: '1.5px' }}>NIK / NIS</td><td style={{ paddingBottom: '1.5px' }}>:</td><td style={{ paddingBottom: '1.5px', textTransform: 'uppercase' }}>{profile?.nik} / {profile?.nisn}</td></tr>
                                    <tr><td style={{ paddingBottom: '1.5px' }}>Tempat, Tgl Lahir</td><td style={{ paddingBottom: '1.5px' }}>:</td><td style={{ paddingBottom: '1.5px', textTransform: 'uppercase' }}>{(profile?.birth_place || '').toUpperCase()}, {profile?.birth_date}</td></tr>
                                    <tr><td style={{ paddingBottom: '1.5px' }}>Agama</td><td style={{ paddingBottom: '1.5px' }}>:</td><td style={{ paddingBottom: '1.5px', textTransform: 'uppercase' }}>{(profile?.religion || '').toUpperCase()}</td></tr>
                                    <tr><td style={{ paddingBottom: '1.5px' }}>Konsentrasi Keahlian</td><td style={{ paddingBottom: '1.5px' }}>:</td><td style={{ paddingBottom: '1.5px', textTransform: 'uppercase' }}>{(profile?.major?.name || '').toUpperCase()}</td></tr>
                                    <tr><td style={{ verticalAlign: 'top', paddingTop: '1px' }}>Alamat</td><td style={{ verticalAlign: 'top', paddingTop: '1px' }}>:</td><td style={{ lineHeight: '1.2', textTransform: 'uppercase', wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: (profile?.formatted_address||'').length > 70 ? '6px' : '6.5px' }}>{(profile?.formatted_address || profile?.address || '').toUpperCase()}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 14px', marginTop: '4px', marginBottom: '4px', alignItems: 'flex-end', zIndex: 10 }}>
                            <div style={{ background: '#e11d48', color: 'white', padding: '3px 5px', fontSize: '5px', fontWeight: 800, textAlign: 'center', lineHeight: '1.15' }}>BERLAKU SELAMA<br />MENJADI SISWA</div>
                            <div style={{ textAlign: 'center', fontSize: '4.5px', color: '#0f172a', fontWeight: 700, width: '82px', position: 'relative', lineHeight: '1.15' }}>
                                <div style={{ textTransform: 'uppercase' }}>{(template?.sign_place_date || 'BANYUWANGI, 17 JULI 2024').toUpperCase()}</div>
                                <div style={{ marginTop: '1px' }}>Kepala Sekolah,</div>
                                <div style={{ position: 'relative', height: '26px', margin: '1px 0' }}>
                                    {template?.signature_image_path && <img src={`/api/image?path=${template.signature_image_path}`} crossOrigin="anonymous" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '110%', maxHeight: '32px', objectFit: 'contain', mixBlendMode: 'multiply' }} />}
                                </div>
                                <div style={{ fontWeight: 800, textDecoration: 'underline', textTransform: 'uppercase', fontSize: '5px' }}>{(template?.principal_name || 'NAMA KEPALA SEKOLAH').toUpperCase()}</div>
                                <div style={{ textTransform: 'uppercase' }}>{(template?.principal_nip || 'NIP/NBM. -').toUpperCase()}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginLeft: '50px', textAlign: 'center', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '10px', color: '#1e3a8a', fontWeight: 800 }}>KARTU TANDA PELAJAR</h4>
                            <h5 style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 800 }}>{schoolName || 'SMKS MUHAMMADIYAH 2 GENTENG'}</h5>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flex: 1, marginTop: '8px' }}>
                            <div style={{ width: '62px', height: '82px', aspectRatio: '3 / 4', background: '#ccc', borderRadius: '4px', overflow: 'hidden', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', flexShrink: 0 }}>
                                {profile?.photo_path && <img src={`/api/image?path=${profile.photo_path}`} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />}
                            </div>
                            <div style={{ flex: 1, fontSize: '9px', display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: 600 }}>
                                <div style={{ display: 'flex' }}><span style={{ width: '60px' }}>Nama</span><span style={{ textTransform: 'uppercase' }}>: {(profile?.full_name || '').toUpperCase()}</span></div>
                                <div style={{ display: 'flex' }}><span style={{ width: '60px' }}>NISN / NIK</span><span>: {profile?.nisn} / {profile?.nik}</span></div>
                                <div style={{ display: 'flex' }}><span style={{ width: '60px' }}>TTL</span><span style={{ textTransform: 'uppercase' }}>: {(profile?.birth_place || '').toUpperCase()}, {profile?.birth_date}</span></div>
                                <div style={{ display: 'flex' }}><span style={{ width: '60px' }}>Agama</span><span style={{ textTransform: 'uppercase' }}>: {(profile?.religion || '').toUpperCase()}</span></div>
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}><span style={{ width: '60px', flexShrink: 0 }}>Alamat</span><span style={{ width: '8px', flexShrink: 0, textAlign: 'center' }}>:</span><span style={{ flex: 1, textTransform: 'uppercase', wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: (profile?.formatted_address||'').length > 65 ? '7.5px' : '9px' }}>{(profile?.formatted_address || profile?.address || '').toUpperCase()}</span></div>
                            </div>
                        </div>
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
                    position: 'relative', borderRadius: '8px', boxShadow: 'var(--shadow-md)', overflow: 'hidden', backgroundColor: 'white'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
                </div>
            )}
        </div>
    );
}
