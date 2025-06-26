<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DatabaseModel extends Model
{
    protected $table = 'databases';
    protected $fillable = [
        'name',
        'description',
        'tables',
        'relationships',
        'user_id'
    ];

    protected $casts = [
        'tables' => 'array',
        'relationships' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tables()
    {
        return $this->hasMany(TablesModel::class);
    }

    public function relationships()
    {
        return $this->hasMany(RelationshipModel::class);
    }
}
