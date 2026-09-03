<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StudentManagementController extends Controller
{
    public function index(Request $request) {
        $query = StudentProfile::with(['user', 'major']);
        if ($request->filled('major_id')) {
            $query->where('major_id', $request->major_id);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('full_name', 'like', '%' . $s . '%')
                  ->orWhere('nisn', 'like', '%' . $s . '%')
                  ->orWhere('nik', 'like', '%' . $s . '%');
            });
        }
        if ($request->filled('approval_status')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('approval_status', $request->approval_status);
            });
        } elseif (!$request->filled('show_pending')) {
            $query->whereHas('user', function ($q) {
                $q->where('approval_status', '!=', 'pending');
            });
        }
        return response()->json($query->orderBy('full_name')->paginate(15));
    }

    public function pending(Request $request) {
        $q = StudentProfile::with(['user', 'major'])->whereHas('user', function ($qq) {
            $qq->where('approval_status', 'pending')->where('role', 'siswa');
        });
        if ($request->filled('search')) {
            $s = $request->search;
            $q->where(function ($qq) use ($s) {
                $qq->where('full_name', 'like', '%' . $s . '%')->orWhere('nisn', 'like', '%' . $s . '%');
            });
        }
        return response()->json($q->orderBy('created_at', 'desc')->paginate(15));
    }

    public function approve(StudentProfile $student) {
        $user = $student->user;
        if (!$user) return response()->json(['message' => 'User tidak ditemukan'], 404);
        $user->update(['approval_status' => 'approved', 'approved_at' => now()]);
        return response()->json(['message' => 'Pendaftaran disetujui. Siswa kini bisa login.', 'profile' => $student->fresh()->load(['user','major'])]);
    }

    public function reject(StudentProfile $student) {
        $user = $student->user;
        if (!$user) return response()->json(['message' => 'User tidak ditemukan'], 404);
        $user->update(['approval_status' => 'rejected']);
        return response()->json(['message' => 'Pendaftaran ditolak.']);
    }

    public function unlock(StudentProfile $student) {
        $student->update(['is_locked' => false]);
        return response()->json(['message' => 'Biodata dibuka. Siswa bisa edit kembali satu kali.', 'profile' => $student->fresh()->load(['user','major'])]);
    }

    public function show(StudentProfile $student) {
        return response()->json($student->load(['user','major']));
    }

    /**
     * Admin preview kartu milik siswa — payload identik dengan /siswa/card
     * agar render Admin == render milik siswa sendiri
     */
    public function cardPreview(StudentProfile $student) {
        $student->load(['major','user']);
        $template = \App\Models\CardTemplate::where('is_active', true)->where('card_type', 'front')->first()
            ?? \App\Models\CardTemplate::where('is_active', true)->first();
        $backTemplate = \App\Models\CardTemplate::where('is_active', true)->where('card_type', 'back')->first();
        $landing = \App\Models\LandingContent::first();
        return response()->json([
            'profile' => $student,
            'template' => $template,
            'back_template' => $backTemplate,
            'school_name' => $landing?->hero_title,
            'website_name' => $landing?->website_name,
        ]);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'full_name' => 'required|string',
            'password' => 'required|string|min:6',
            'nisn' => 'required|string|unique:student_profiles,nisn',
            'nik' => 'required|string|unique:student_profiles,nik',
            'birth_place' => 'required|string',
            'birth_date' => 'required|date',
            'religion' => 'required|string',
            'major_id' => 'required|exists:majors,id',
            'dusun' => 'required|string|max:255',
            'rt' => 'required|string|max:10',
            'rw' => 'required|string|max:10',
            'desa' => 'required|string|max:255',
            'kecamatan' => 'required|string|max:255',
            'kabupaten' => 'required|string|max:255',
        ]);

        $address = StudentProfile::composeAddress($validated);

        $user = User::create([
            'name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'siswa',
            'approval_status' => 'approved',
            'approved_at' => now(),
        ]);

        $student = StudentProfile::create([
            'user_id' => $user->id,
            'nisn' => $request->nisn,
            'nik' => $request->nik,
            'full_name' => $request->full_name,
            'birth_place' => $request->birth_place,
            'birth_date' => $request->birth_date,
            'religion' => $request->religion,
            'address' => $address,
            'dusun' => $validated['dusun'],
            'rt' => $validated['rt'],
            'rw' => $validated['rw'],
            'desa' => $validated['desa'],
            'kecamatan' => $validated['kecamatan'],
            'kabupaten' => $validated['kabupaten'],
            'major_id' => $request->major_id,
            'is_locked' => false,
        ]);

        return response()->json($student->load(['user', 'major']), 201);
    }

    public function update(Request $request, StudentProfile $student) {
        $validated = $request->validate([
            'email' => ['sometimes','email', Rule::unique('users','email')->ignore($student->user_id)],
            'full_name' => 'sometimes|string',
            'nisn' => ['sometimes','string', Rule::unique('student_profiles','nisn')->ignore($student->id)],
            'nik' => ['sometimes','string', Rule::unique('student_profiles','nik')->ignore($student->id)],
            'birth_place' => 'sometimes|string',
            'birth_date' => 'sometimes|date',
            'religion' => 'sometimes|string',
            'dusun' => 'sometimes|string|max:255',
            'rt' => 'sometimes|string|max:10',
            'rw' => 'sometimes|string|max:10',
            'desa' => 'sometimes|string|max:255',
            'kecamatan' => 'sometimes|string|max:255',
            'kabupaten' => 'sometimes|string|max:255',
            'address' => 'sometimes|string',
            'major_id' => 'sometimes|exists:majors,id',
            'password' => 'sometimes|string|min:6',
            'is_locked' => 'sometimes|boolean',
        ]);

        // sync user
        $userPatch = [];
        if (isset($validated['full_name'])) $userPatch['name'] = $validated['full_name'];
        if (isset($validated['email'])) $userPatch['email'] = $validated['email'];
        if (isset($validated['password'])) $userPatch['password'] = Hash::make($validated['password']);
        if (!empty($userPatch)) $student->user->update($userPatch);

        $profilePatch = collect($validated)->only(['full_name','nisn','nik','birth_place','birth_date','religion','address','major_id','dusun','rt','rw','desa','kecamatan','kabupaten','is_locked'])->toArray();
        // Jika ada pecahan alamat, sinkronkan address terformat
        $addrKeys = ['dusun','rt','rw','desa','kecamatan','kabupaten'];
        $hasAddr = false; foreach ($addrKeys as $k) if (array_key_exists($k, $profilePatch)) { $hasAddr = true; break; }
        if ($hasAddr) {
            $merged = array_merge(
                ['dusun'=>$student->dusun,'rt'=>$student->rt,'rw'=>$student->rw,'desa'=>$student->desa,'kecamatan'=>$student->kecamatan,'kabupaten'=>$student->kabupaten],
                array_intersect_key($profilePatch, array_flip($addrKeys))
            );
            $profilePatch['address'] = StudentProfile::composeAddress($merged);
        }
        if (!empty($profilePatch)) $student->update($profilePatch);

        // photo via admin — admin boleh ganti kapan saja
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('photos', 'public');
            $student->update(['photo_path' => $path]);
        }

        return response()->json($student->fresh()->load(['user','major']));
    }

    public function destroy(StudentProfile $student) {
        $userId = $student->user_id;
        $student->delete();
        User::find($userId)?->delete();
        return response()->json(null, 204);
    }
}
