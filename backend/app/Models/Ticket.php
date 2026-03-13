<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    protected $table = 'tickets';

    protected $fillable = [
        'type',
        'description',
    ];

    public function billets(): HasMany
    {
        return $this->hasMany(Billet::class, 'id_ticket');
    }
}
