<?php

namespace App\Http\Controllers;

use App\Models\Visiteur;
use Illuminate\Http\Request;

class VisiteurController extends Controller
{
    public function index()
    {
        return response()->json(Visiteur::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
        ]);

        $visiteur = Visiteur::create($validated);

        return response()->json($visiteur, 201);
    }

    public function show($id)
    {
        $visiteur = Visiteur::findOrFail($id);
        return response()->json($visiteur);
    }

    public function update(Request $request, $id)
    {
        $visiteur = Visiteur::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
        ]);

        $visiteur->update($validated);

        return response()->json($visiteur);
    }

    public function destroy($id)
    {
        $visiteur = Visiteur::findOrFail($id);
        $visiteur->delete();

        return response()->json(['message' => 'Visiteur deleted successfully']);
    }
}
