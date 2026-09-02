<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentManagementController extends Controller
{
    public function index(Request $request) { 
        $query = StudentProfile::with(['user', 'major']);
        if ($request->has('major_id')) {
            $query->where('major_id', $request->major_id);
        }
        if ($request->has('search')) {
            $query->where('full_name', 'like', '%' . $request->search . '%')
                  ->orWhere('nisn', 'like', '%' . $request->search . '%');
        }
        return response()->json($query->paginate(15)); 
    }
    
    public function store(Request $request) {
        $validated = $request->validate([
            'email' => 'required|email|unique:users',
            'full_name' => 'required|string',
            'password' => 'required|string|min:6',
            'nisn' => 'required|string|unique:student_profiles,nisn',
            'nik' => 'required|string|unique:student_profiles,nik',
            'birth_place' => 'required|string',
            'birth_date' => 'required|date',
            'religion' => 'required|string',
            'address' => 'required|string',
            'major_id' => 'required|integer',
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
            'full_name' => 'sometimes|string',
            'birth_place' => 'sometimes|string',
            'birth_date' => 'sometimes|date',
            'religion' => 'sometimes|string',
            'address' => 'sometimes|string',
            'major_id' => 'sometimes|exists:majors,id',
        ]);
        
        $student->update($validated);
        if (isset($validated['full_name'])) {
            $student->user->update(['name' => $validated['full_name']]);
        }
        
        return response()->json($student);
    }
    
    public function destroy(StudentProfile $student) {
        $userId = $student->user_id;
        $student->delete();
        User::find($userId)->delete();
        return response()->json(null, 204);
    }
}
