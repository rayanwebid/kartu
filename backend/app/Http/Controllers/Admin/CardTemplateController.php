<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CardTemplate;
use Illuminate\Http\Request;

class CardTemplateController extends Controller
{
    public function index() { return response()->json(CardTemplate::all()); }
    
    public function store(Request $request) {
        $validated = $request->validate([
            'template_name' => 'required|string',
            'orientation' => 'required|in:landscape,portrait',
            'width_mm' => 'sometimes|numeric',
            'height_mm' => 'sometimes|numeric',
            'layout_coordinates' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
            'foundation_name' => 'sometimes|nullable|string',
            'school_name' => 'sometimes|nullable|string',
            'accreditation' => 'sometimes|nullable|string',
            'school_address' => 'sometimes|nullable|string',
            'sign_place_date' => 'sometimes|nullable|string',
            'principal_name' => 'sometimes|nullable|string',
            'principal_nip' => 'sometimes|nullable|string',
            'card_type' => 'sometimes|in:front,back',
        ]);

        if ($request->hasFile('background_image')) {
            $validated['background_image_path'] = $request->file('background_image')->store('templates', 'public');
        } else {
            $validated['background_image_path'] = '';
        }

        if ($request->hasFile('logo_image')) {
            $validated['logo_image_path'] = $request->file('logo_image')->store('templates', 'public');
        }

        if ($request->hasFile('signature_image')) {
            $validated['signature_image_path'] = $request->file('signature_image')->store('templates', 'public');
        }
        
        if (isset($validated['is_active']) && $validated['is_active']) {
            $type = $validated['card_type'] ?? 'front';
            CardTemplate::where('is_active', true)->where('card_type', $type)->update(['is_active' => false]);
        }

        return response()->json(CardTemplate::create($validated), 201);
    }

    public function show(CardTemplate $template) { return response()->json($template); }

    public function update(Request $request, CardTemplate $template) {
        $validated = $request->validate([
            'template_name' => 'sometimes|string',
            'orientation' => 'sometimes|in:landscape,portrait',
            'width_mm' => 'sometimes|numeric',
            'height_mm' => 'sometimes|numeric',
            'layout_coordinates' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
            'foundation_name' => 'sometimes|nullable|string',
            'school_name' => 'sometimes|nullable|string',
            'accreditation' => 'sometimes|nullable|string',
            'school_address' => 'sometimes|nullable|string',
            'sign_place_date' => 'sometimes|nullable|string',
            'principal_name' => 'sometimes|nullable|string',
            'principal_nip' => 'sometimes|nullable|string',
            'card_type' => 'sometimes|in:front,back',
        ]);

        if ($request->hasFile('background_image')) {
            $validated['background_image_path'] = $request->file('background_image')->store('templates', 'public');
        }
        
        if ($request->hasFile('logo_image')) {
            $validated['logo_image_path'] = $request->file('logo_image')->store('templates', 'public');
        }

        if ($request->hasFile('signature_image')) {
            $validated['signature_image_path'] = $request->file('signature_image')->store('templates', 'public');
        }
        
        if (isset($validated['is_active']) && $validated['is_active']) {
            $type = $validated['card_type'] ?? $template->card_type;
            CardTemplate::where('is_active', true)->where('card_type', $type)->where('id', '!=', $template->id)->update(['is_active' => false]);
        }

        $template->update($validated);
        return response()->json($template);
    }

    public function destroy(CardTemplate $template) {
        $template->delete();
        return response()->json(null, 204);
    }
}
