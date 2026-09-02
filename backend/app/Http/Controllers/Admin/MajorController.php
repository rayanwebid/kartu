<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Major;
use Illuminate\Http\Request;

class MajorController extends Controller
{
    public function index() { return response()->json(Major::all()); }
    
    public function store(Request $request) {
        $validated = $request->validate(['name' => 'required|string']);
        return response()->json(Major::create($validated), 201);
    }
    
    public function show(Major $major) { return response()->json($major); }
    
    public function update(Request $request, Major $major) {
        $validated = $request->validate(['name' => 'required|string']);
        $major->update($validated);
        return response()->json($major);
    }
    
    public function destroy(Major $major) {
        $major->delete();
        return response()->json(null, 204);
    }
}
