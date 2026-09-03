<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\StudentProfile;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed|min:6',
            'full_name' => 'required|string|max:255',
            'nisn' => 'required|string|unique:student_profiles,nisn',
            'nik' => 'required|string|unique:student_profiles,nik',
            'birth_place' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'religion' => 'required|string',
            'address' => 'required|string',
            'major_id' => 'required|exists:majors,id',
        ], [
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan. Gunakan email lain.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'full_name.required' => 'Nama lengkap wajib diisi.',
            'nisn.required' => 'NISN wajib diisi.',
            'nisn.unique' => 'NISN sudah digunakan — NISN ini sudah terdaftar di database, tidak bisa mendaftar lagi. Hubungi admin jika ini data Anda.',
            'nik.required' => 'NIK wajib diisi.',
            'nik.unique' => 'NIK sudah digunakan — NIK ini sudah terdaftar.',
            'birth_place.required' => 'Tempat lahir wajib diisi.',
            'birth_date.required' => 'Tanggal lahir wajib diisi.',
            'birth_date.date' => 'Format tanggal lahir tidak valid.',
            'religion.required' => 'Agama wajib dipilih.',
            'address.required' => 'Alamat lengkap wajib diisi.',
            'major_id.required' => 'Jurusan wajib dipilih.',
            'major_id.exists' => 'Jurusan tidak valid.',
        ]);

        $user = User::create([
            'name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'siswa'
        ]);

        StudentProfile::create([
            'user_id' => $user->id,
            'nisn' => $request->nisn,
            'nik' => $request->nik,
            'full_name' => $request->full_name,
            'photo_path' => null, // Can be uploaded later
            'birth_place' => $request->birth_place,
            'birth_date' => $request->birth_date,
            'religion' => $request->religion,
            'major_id' => $request->major_id ?? 1, // Default to a major for now
            'address' => $request->address,
        ]);

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('siswa-token')->plainTextToken
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required',
        ]);

        $login = trim($request->input('email'));

        $user = null;

        // Jika input adalah email valid, cari by email
        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
            $user = User::where('email', $login)->first();
        } else {
            // Coba sebagai NISN langsung
            $profile = StudentProfile::where('nisn', $login)->first();
            if ($profile) {
                $user = User::find($profile->user_id);
            }
            // Fallback: NISN@kartu.smkmuda.id
            if (!$user) {
                $user = User::where('email', $login . '@kartu.smkmuda.id')->first();
            }
            // Fallback: cari email persis (jika NISN numeric tapi disimpan sebagai email tanpa domain)
            if (!$user) {
                $user = User::where('email', $login)->first();
            }
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial tidak sesuai.'],
            ]);
        }

        return response()->json([
            'user' => $user,
            'token' => $user->createToken($user->role . '-token')->plainTextToken
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}
