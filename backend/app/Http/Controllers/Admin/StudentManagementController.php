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
        return response()->json($query->orderBy('full_name')->paginate(15));
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
            'address' => 'required|string',
            'major_id' => 'required|exists:majors,id',
        ]);

        $user = User::create([
            'name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'siswa'
        ]);

        $student = StudentProfile::create([
            'user_id' => $user->id,
            'nisn' => $request->nisn,
            'nik' => $request->nik,
            'full_name' => $request->full_name,
            'birth_place' => $request->birth_place,
            'birth_date' => $request->birth_date,
            'religion' => $request->religion,
            'address' => $request->address,
            'major_id' => $request->major_id,
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
            'address' => 'sometimes|string',
            'major_id' => 'sometimes|exists:majors,id',
            'password' => 'sometimes|string|min:6',
        ]);

        // sync user
        $userPatch = [];
        if (isset($validated['full_name'])) $userPatch['name'] = $validated['full_name'];
        if (isset($validated['email'])) $userPatch['email'] = $validated['email'];
        if (isset($validated['password'])) $userPatch['password'] = Hash::make($validated['password']);
        if (!empty($userPatch)) $student->user->update($userPatch);

        $profilePatch = collect($validated)->only(['full_name','nisn','nik','birth_place','birth_date','religion','address','major_id'])->toArray();
        if (!empty($profilePatch)) $student->update($profilePatch);

        // photo via admin
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
