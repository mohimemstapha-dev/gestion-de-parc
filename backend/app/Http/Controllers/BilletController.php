<?php

namespace App\Http\Controllers;

use App\Models\Billet;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BilletController extends Controller
{
    public function index()
    {
        return response()->json(Billet::with(['visiteur', 'ticket', 'attractions'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_visiteur' => 'required|exists:visiteurs,id',
            'id_ticket' => 'required|exists:tickets,id',
            'attractions' => 'nullable|array',
            'attractions.*' => 'exists:attractions,id',
        ]);

        $validated['numero_billet'] = 'BLT-' . strtoupper(Str::random(8));

        $billet = Billet::create($validated);

        if (!empty($request->attractions)) {
            $billet->attractions()->sync($request->attractions);
        }

        return response()->json($billet->load(['visiteur', 'ticket', 'attractions']), 201);
    }

    public function show($id)
    {
        $billet = Billet::with(['visiteur', 'ticket', 'attractions'])->findOrFail($id);
        return response()->json($billet);
    }

    public function update(Request $request, $id)
    {
        $billet = Billet::findOrFail($id);

        $validated = $request->validate([
            'id_visiteur' => 'sometimes|required|exists:visiteurs,id',
            'id_ticket' => 'sometimes|required|exists:tickets,id',
            'attractions' => 'nullable|array',
            'attractions.*' => 'exists:attractions,id',
        ]);

        $billet->update($validated);

        if ($request->has('attractions')) {
            $billet->attractions()->sync($request->attractions);
        }

        return response()->json($billet->load(['visiteur', 'ticket', 'attractions']));
    }

    public function destroy($id)
    {
        $billet = Billet::findOrFail($id);
        $billet->delete();

        return response()->json(['message' => 'Billet deleted successfully']);
    }
}
