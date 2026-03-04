<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Billet extends Model
{
    protected $table = 'billets';
    
    protected $fillable = [
        'numero_billet',
        'id_visiteur',
        'id_ticket'
    ];

    public function visiteur(): BelongsTo
    {
        return $this->belongsTo(Visiteur::class, 'id_visiteur');
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'id_ticket');
    }

    public function attractions(): BelongsToMany
    {
        return $this->belongsToMany(
            Attraction::class, 
            'attraction_billet', 
            'id_billet', 
            'id_attraction'
        )->withTimestamps();
    }
}