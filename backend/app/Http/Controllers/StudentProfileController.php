<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StudentProfileController extends Controller
{
    public function show(Request $request)
    {
        $profile = $request->user()->studentProfile()->with('major')->first();
        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }
        return response()->json($profile);
    }

    public function update(Request $request)
    {
        $profile = $request->user()->studentProfile;
        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $validated = $request->validate([
            'full_name' => 'sometimes|string',
            'birth_place' => 'sometimes|string',
            'birth_date' => 'sometimes|date',
            'religion' => 'sometimes|string',
            'address' => 'sometimes|string',
            'major_id' => 'sometimes|exists:majors,id',
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('photos', 'public');
            $validated['photo_path'] = $path;
        }

        $profile->update($validated);

        if (array_key_exists('full_name', $validated)) {
            $request->user()->update(['name' => $validated['full_name']]);
        }

        return response()->json($profile);
    }

    public function cardPreview(Request $request)
    {
        $profile = $request->user()->studentProfile()->with('major')->first();
        $template = \App\Models\CardTemplate::where('is_active', true)->where('card_type', 'front')->first() 
            ?? \App\Models\CardTemplate::where('is_active', true)->first();
            
        $backTemplate = \App\Models\CardTemplate::where('is_active', true)->where('card_type', 'back')->first();
        
        $landing = \App\Models\LandingContent::first();

        return response()->json([
            'profile' => $profile,
            'template' => $template,
            'back_template' => $backTemplate,
            'school_name' => $landing?->hero_title,
            'website_name' => $landing?->website_name
        ]);
    }
}
