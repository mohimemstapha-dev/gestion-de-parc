<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Visiteur extends Model
{
    protected $table = 'visiteurs';

    protected $fillable = [
        'nom',
        'prenom',
    ];

    public function billets(): HasMany
    {
        return $this->hasMany(Billet::class, 'id_visiteur');
    }
}
