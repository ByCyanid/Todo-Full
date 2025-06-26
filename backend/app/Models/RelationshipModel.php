<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RelationshipModel extends Model
{

    protected $table = 'relationships';
    protected $fillable = [
        'source_table_id',
        'target_table_id',
        'relationship_type',
        'edge_data',
        'database_id',
        'user_id'
    ];

    protected $casts = [
        'edge_data' => 'array'
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
