<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingContent;
use Illuminate\Http\Request;

class LandingContentController extends Controller
{
    public function index() {
        return response()->json(LandingContent::firstOrCreate([
            'hero_title' => 'SMKS Muhammadiyah 2 Genteng',
            'hero_description' => 'Platform digital terintegrasi untuk pendaftaran dan manajemen Kartu Pelajar cerdas.'
        ]));
    }
    
    public function publicShow() {
        return $this->index();
    }
    
    public function store(Request $request) {
        $content = LandingContent::firstOrCreate([
            'hero_title' => 'SMKS Muhammadiyah 2 Genteng',
            'hero_description' => 'Platform digital terintegrasi untuk pendaftaran dan manajemen Kartu Pelajar cerdas.'
        ]);
        
        $content->update($request->only([
            'website_name', 'hero_title', 'hero_description', 'contact_info', 'footer_text'
        ]));
        
        if ($request->hasFile('school_logo')) {
            $content->update(['school_logo_path' => $request->file('school_logo')->store('landing', 'public')]);
        }
        
        return response()->json($content);
    }

    public function show(LandingContent $landingContent) { return response()->json($landingContent); }

    public function update(Request $request, LandingContent $landingContent) {
        return $this->store($request);
    }
}
