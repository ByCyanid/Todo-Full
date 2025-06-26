<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TablesModel extends Model
{
    protected $table = 'tables';
    protected $fillable = [
        'name',
        'description',
        'columns',
        'position',
        'database_id',
        'user_id'
    ];

    protected $casts = [
        'columns' => 'array',
        'position' => 'array'
    ];

    public function database()
    {
        return $this->belongsTo(DatabaseModel::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
