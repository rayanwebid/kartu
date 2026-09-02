<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingContent extends Model
{
    protected $fillable = [
        'website_name',
        'hero_title',
        'hero_description',
        'school_logo_path',
        'contact_info',
        'footer_text',
        'features_json',
    ];

    protected function casts(): array
    {
        return [
            'features_json' => 'array',
        ];
    }
}
