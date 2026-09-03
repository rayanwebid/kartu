<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    protected $fillable = [
        'user_id', 'nisn', 'nik', 'full_name', 'photo_path', 
        'birth_place', 'birth_date', 'religion', 'major_id', 'address',
        'dusun', 'rt', 'rw', 'desa', 'kecamatan', 'kabupaten', 'is_locked', 'edit_count'
    ];

    protected $casts = [
        'is_locked' => 'boolean',
        'edit_count' => 'integer',
    ];

    protected $appends = ['formatted_address'];

    public function user() {
        return $this->belongsTo(User::class);
    }
    public function major() {
        return $this->belongsTo(Major::class);
    }

    public function getFormattedAddressAttribute(): string
    {
        // Jika ada pecahan alamat, rakit: Dusun Krajan, RT 003/RW 006, Desa X, Kec. Y, Kab. Z
        if ($this->dusun || $this->desa || $this->kecamatan || $this->kabupaten) {
            $parts = [];
            if ($this->dusun) {
                $d = trim($this->dusun);
                // pastikan prefix Dusun tidak dobel jika siswa sudah tulis "Dusun Krajan"
                if (!preg_match('/^dusun\s+/i', $d)) $d = 'Dusun ' . $d;
                $parts[] = $d;
            }
            if ($this->rt || $this->rw) {
                $rt = $this->rt ? trim($this->rt) : '-';
                $rw = $this->rw ? trim($this->rw) : '-';
                // normalisasi RT/RW jadi 3 digit jika angka
                if (ctype_digit($rt)) $rt = str_pad($rt, 3, '0', STR_PAD_LEFT);
                if (ctype_digit($rw)) $rw = str_pad($rw, 3, '0', STR_PAD_LEFT);
                $parts[] = "RT $rt/RW $rw";
            }
            if ($this->desa) {
                $desa = trim($this->desa);
                if (!preg_match('/^desa\s+/i', $desa)) $desa = 'Desa ' . $desa;
                $parts[] = $desa;
            }
            if ($this->kecamatan) {
                $kec = trim($this->kecamatan);
                if (!preg_match('/^kec\.?\s+/i', $kec)) $kec = 'Kec. ' . $kec;
                $parts[] = $kec;
            }
            if ($this->kabupaten) {
                $kab = trim($this->kabupaten);
                if (!preg_match('/^kab\.?\s+/i', $kab)) $kab = 'Kab. ' . $kab;
                $parts[] = $kab;
            }
            return implode(', ', $parts);
        }
        return $this->address ?? '';
    }

    public static function composeAddress(array $parts): string
    {
        $tmp = new static($parts);
        return $tmp->formatted_address;
    }
}
