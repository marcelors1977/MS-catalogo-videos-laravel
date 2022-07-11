<?php

namespace App\Models;

use App\ModelFilters\GenderFilter;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Gender extends Model
{
    use SoftDeletes, Traits\Uuid, Filterable;

    protected $fillable = ['name','is_active'];
    protected $dates = ['deleted_at'];
    protected $casts = [ 
        'id'  => 'string',
        'is_active' => 'boolean'
    ];
    public $incrementing = false;
    protected $keyType = 'string';

    public function categories(){
        return $this->belongsToMany(Category::class);
    }

    public function modelFilter()
    {
        return $this->provideFilter(GenderFilter::class);
    }
}
