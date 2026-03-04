<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Attraction extends Model
{
    protected $table = 'attractions';
    
    protected $fillable = [
        'nom',
        'prix',
        'status'
    ];

    protected $casts = [
        'prix' => 'decimal:2',
        'status' => 'string'
    ];

    public function billets(): BelongsToMany
    {
        return $this->belongsToMany(
            Billet::class, 
            'attraction_billet', 
            'id_attraction', 
            'id_billet'
        )->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}