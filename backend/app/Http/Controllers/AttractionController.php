<?php

namespace App\Http\Controllers;

use App\Models\Attraction;
use Illuminate\Http\Request;

class AttractionController extends Controller
{
    public function index()
    {
        return response()->json(Attraction::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prix' => 'required|numeric|min:0',
            'status' => 'nullable|string|in:active,inactive,maintenance',
        ]);

        $attraction = Attraction::create($validated);

        return response()->json($attraction, 201);
    }

    public function show($id)
    {
        $attraction = Attraction::findOrFail($id);
        return response()->json($attraction);
    }

    public function update(Request $request, $id)
    {
        $attraction = Attraction::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'prix' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|string|in:active,inactive,maintenance',
        ]);

        $attraction->update($validated);

        return response()->json($attraction);
    }

    public function destroy($id)
    {
        $attraction = Attraction::findOrFail($id);
        $attraction->delete();

        return response()->json(['message' => 'Attraction deleted successfully']);
    }
}
