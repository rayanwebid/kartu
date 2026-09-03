<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
class StudentProfileController extends Controller
{
    public function show(Request $request)
    {
        $profile = $request->user()->studentProfile()->with('major')->first();
        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }
        return response()->json($profile);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $profile = $user->studentProfile;
        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        // Biodata kunci sekali edit — setelah is_locked=true hanya admin yang bisa buka
        if ($profile->is_locked) {
            return response()->json(['message' => 'Biodata terkunci. Hubungi admin untuk perbaikan (admin: Reset Edit).'], 422);
        }

        $validated = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'birth_place' => 'sometimes|string|max:255',
            'birth_date' => 'sometimes|date',
            'religion' => 'sometimes|string|max:50',
            'major_id' => 'sometimes|exists:majors,id',
            'dusun' => 'sometimes|string|max:255',
            'rt' => 'sometimes|string|max:10',
            'rw' => 'sometimes|string|max:10',
            'desa' => 'sometimes|string|max:255',
            'kecamatan' => 'sometimes|string|max:255',
            'kabupaten' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'photo' => 'sometimes|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        // Foto: sekali per siklus edit. Jika sudah terkunci tidak bisa upload sama sekali (dicek di atas).
        // Jika is_locked=false (edit pertama atau setelah admin Reset Edit), boleh upload/ganti foto — ganti akan timpa foto lama.
        // Cegah Simpan tanpa foto: jika belum pernah ada foto & tidak upload baru, tolak
        if (!$request->hasFile('photo') && empty($profile->photo_path)) {
            return response()->json(['message' => 'Foto wajib diisi — unggah foto 3:4 pas 62×82 lalu Simpan.'], 422);
        }
        if ($request->hasFile('photo')) {
            // hapus foto lama jika ada agar tidak menumpuk storage
            if (!empty($profile->photo_path) && \Illuminate\Support\Facades\Storage::disk('public')->exists($profile->photo_path)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($profile->photo_path);
            }
            $path = $request->file('photo')->store('photos', 'public');
            $validated['photo_path'] = $path;
        }

        // Susun ulang address jika ada salah satu bagian alamat dikirim
        $addrKeys = ['dusun','rt','rw','desa','kecamatan','kabupaten'];
        $hasAddr = false;
        foreach ($addrKeys as $k) if (array_key_exists($k, $validated)) { $hasAddr = true; break; }
        if ($hasAddr) {
            $merged = array_merge(
                ['dusun'=>$profile->dusun,'rt'=>$profile->rt,'rw'=>$profile->rw,'desa'=>$profile->desa,'kecamatan'=>$profile->kecamatan,'kabupaten'=>$profile->kabupaten],
                array_intersect_key($validated, array_flip($addrKeys))
            );
            $validated['address'] = \App\Models\StudentProfile::composeAddress($merged);
        }

        // Hapus email dari profile update
        $email = $validated['email'] ?? null;
        unset($validated['email'], $validated['photo']);

        if (!empty($validated)) {
            $profile->update($validated);
        }

        if (array_key_exists('full_name', $validated)) {
            $user->update(['name' => $validated['full_name']]);
        }
        if ($email) {
            $user->update(['email' => $email]);
        }

        // Kunci biodata: begitu siswa menekan Simpan, langsung kunci + hitung edit
        $profile->update(['is_locked' => true, 'edit_count' => ($profile->edit_count ?? 0) + 1]);

        return response()->json($profile->fresh()->load('major'));
    }

    public function cardPreview(Request $request)
    {
        $profile = $request->user()->studentProfile()->with('major')->first();
        $template = \App\Models\CardTemplate::where('is_active', true)->where('card_type', 'front')->first() 
            ?? \App\Models\CardTemplate::where('is_active', true)->first();
            
        $backTemplate = \App\Models\CardTemplate::where('is_active', true)->where('card_type', 'back')->first();
        
        $landing = \App\Models\LandingContent::first();

        return response()->json([
            'profile' => $profile,
            'template' => $template,
            'back_template' => $backTemplate,
            'school_name' => $landing?->hero_title,
            'website_name' => $landing?->website_name
        ]);
    }
}
