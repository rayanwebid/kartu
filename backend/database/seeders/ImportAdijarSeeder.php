<?php

namespace Database\Seeders;

use App\Models\Major;
use App\Models\User;
use App\Models\StudentProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ImportAdijarSeeder extends Seeder
{
    public function run(): void
    {
        // Locate json files: prefer database/data, fallback to /tmp (for manual docker cp)
        $jurusanPath = database_path('data/jurusans.json');
        $siswaPath = database_path('data/siswa_eligible.json');
        if (!File::exists($jurusanPath)) $jurusanPath = '/tmp/jurusans.json';
        if (!File::exists($siswaPath)) $siswaPath = '/tmp/siswa_eligible.json';

        if (!File::exists($jurusanPath) || !File::exists($siswaPath)) {
            $this->command->error("JSON not found: $jurusanPath or $siswaPath");
            return;
        }

        $jurusans = json_decode(File::get($jurusanPath), true);
        $siswas = json_decode(File::get($siswaPath), true);

        $this->command->info("Found " . count($jurusans) . " jurusans, " . count($siswas) . " siswa eligible");

        DB::transaction(function () use ($jurusans, $siswas) {
            // 1. Replace majors with ADIJAR jurusans
            $this->command->info("Replacing majors...");
            // Delete old majors only if no student_profiles reference them yet (currently 0)
            // If profiles exist, we keep them and upsert; here we clean because prod has 0 profiles
            $existingCount = Major::count();
            $profileCount = StudentProfile::count();
            if ($profileCount === 0) {
                DB::statement('PRAGMA foreign_keys=OFF');
                Major::truncate();
                DB::statement('PRAGMA foreign_keys=ON');
                $this->command->info("Truncated $existingCount old majors");
            }

            $kodeToId = [];
            foreach ($jurusans as $j) {
                $name = trim($j['nama']);
                $major = Major::firstOrCreate(['name' => $name]);
                $kodeToId[$j['kode']] = $major->id;
                $kodeToId[$j['id']] = $major->id; // also map UUID
                $this->command->info("Major {$j['kode']} => id {$major->id} : $name");
            }

            // Also map by nama for fallback
            $namaToId = Major::pluck('id', 'name')->toArray();

            // 2. Import siswa
            $inserted = 0;
            $skippedEmail = 0;
            $skippedNisn = 0;
            $skippedNik = 0;
            $defaultPassword = 'stemda123';
            $hashedPassword = Hash::make($defaultPassword);

            foreach ($siswas as $s) {
                $nisn = trim($s['nisn']);
                $nik = trim($s['nik_siswa']);
                $email = $nisn . '@kartu.smkmuda.id';
                $fullName = trim($s['nama_lengkap']);

                // Skip if already exists (idempotent)
                if (User::where('email', $email)->exists()) { $skippedEmail++; continue; }
                if (StudentProfile::where('nisn', $nisn)->exists()) { $skippedNisn++; continue; }
                if (StudentProfile::where('nik', $nik)->exists()) { $skippedNik++; continue; }

                $majorId = $kodeToId[$s['jurusan_kode']] ?? $kodeToId[$s['jurusan_id']] ?? $namaToId[$s['jurusan_nama']] ?? Major::first()->id;

                // Build address
                $addrParts = array_filter([
                    $s['alamat_domisili'] ?? null,
                    !empty($s['desa_kelurahan']) ? "Desa {$s['desa_kelurahan']}" : null,
                    !empty($s['kecamatan']) ? "Kec. {$s['kecamatan']}" : null,
                    !empty($s['kabupaten_kota']) ? "Kab. {$s['kabupaten_kota']}" : null,
                    $s['provinsi'] ?? null,
                ]);
                $address = implode(', ', $addrParts) ?: ($s['alamat_domisili'] ?? '-');

                $birthPlace = $s['tempat_lahir'] ?: 'Banyuwangi';
                $birthDate = $s['tanggal_lahir'] ?: '2010-01-01';
                $religion = $s['agama'] ?: 'Islam';

                $user = User::create([
                    'name' => $fullName,
                    'email' => $email,
                    'password' => $hashedPassword,
                    'role' => 'siswa',
                ]);

                StudentProfile::create([
                    'user_id' => $user->id,
                    'nisn' => $nisn,
                    'nik' => $nik,
                    'full_name' => $fullName,
                    'photo_path' => null,
                    'birth_place' => $birthPlace,
                    'birth_date' => $birthDate,
                    'religion' => $religion,
                    'major_id' => $majorId,
                    'address' => $address,
                ]);
                $inserted++;
            }

            $this->command->info("Import done: inserted=$inserted skippedEmail=$skippedEmail skippedNisn=$skippedNisn skippedNik=$skippedNik");
        });
    }
}
