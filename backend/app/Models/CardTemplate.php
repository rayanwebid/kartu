<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardTemplate extends Model
{
    protected $fillable = [
        'template_name', 'background_image_path', 'orientation', 
        'width_mm', 'height_mm', 'layout_coordinates', 'is_active',
        'foundation_name', 'school_name', 'accreditation', 'school_address', 'sign_place_date',
        'principal_name', 'principal_nip', 'logo_image_path', 'signature_image_path', 'card_type'
    ];
    
    protected function casts(): array
    {
        return [
            'layout_coordinates' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
