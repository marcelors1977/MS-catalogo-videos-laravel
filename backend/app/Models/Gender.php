<?php

namespace App\Models;

use App\ModelFilters\GenderFilter;
use App\Models\Traits\SerializeDateToIso8601;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Chelout\RelationshipEvents\Concerns\HasBelongsToManyEvents;

class Gender extends Model
{
    use SoftDeletes, Traits\Uuid, Filterable, SerializeDateToIso8601, HasBelongsToManyEvents;

    protected $fillable = ['name','is_active'];
    protected $dates = ['deleted_at'];
    protected $casts = [ 
        'id'  => 'string',
        'is_active' => 'boolean'
    ];
    public $incrementing = false;
    protected $keyType = 'string';
    protected $observables = [
        'belongsToManyAttached',
        'belongsToManyDetached'
    ];

    public function categories(){
        return $this->belongsToMany(Category::class);
    }

    public function modelFilter()
    {
        return $this->provideFilter(GenderFilter::class);
    }
}
