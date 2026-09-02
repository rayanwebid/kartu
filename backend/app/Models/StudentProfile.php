<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    protected $fillable = [
        'user_id', 'nisn', 'nik', 'full_name', 'photo_path', 
        'birth_place', 'birth_date', 'religion', 'major_id', 'address'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
    public function major() {
        return $this->belongsTo(Major::class);
    }
}
