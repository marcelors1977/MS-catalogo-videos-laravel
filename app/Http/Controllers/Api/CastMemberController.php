<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CastMemberResource;
use App\Models\CastMember;

class CastMemberController extends BasicCrudController
{
    private $rules;

    public function __construct(){
        $this->rules = [
            'name' => 'required|max:255',
            'type' => 
                'required|in:' . \join(',',CastMember::TYPE_ARRAY_CAST)
        ];
    }   

    protected function model(){
        return CastMember::class;
    }

    protected function rulesStore(){
        return $this->rules;
    }
    
    protected function  rulesUpdate(){
        return $this->rules;
    }

    protected function  resourceCollection()
    {
        return $this->resource();
    }

    protected function  resource()
    {
        return CastMemberResource::class;   
    }
}
