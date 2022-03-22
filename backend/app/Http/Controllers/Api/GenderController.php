<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\GenderResource;
use App\Models\Gender;
use illuminate\Http\Request;


class GenderController extends BasicCrudController
{
    private $rules = [
        'name' => 'required|max:255',
        'is_active' => 'boolean',
        'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL'
    ];

    public function store(Request $request)
    {
        $validatedDate = $this->validate($request, $this->rulesStore() );
        $self = $this;
        $obj = \DB::transaction(function () use ($request, $validatedDate, $self) {
            $obj = $this->model()::create($validatedDate);
            $self->handleRelations($obj, $validatedDate);
            return $obj;
        });

        $obj->refresh();
        $resource = $this->resource();
        return new $resource($obj);
    }

    public function update(Request $request, $id)
    {
        $obj = $this->findOrFail($id);
        $validatedDate = $this->validate($request, $this->rulesUpdate() );
        $self = $this;
        $obj = \DB::transaction(function () use ($request, $validatedDate, $self, $obj) {
            $obj->update($validatedDate);
            $self->handleRelations($obj, $validatedDate);
            return $obj;
        });
        $resource = $this->resource();
        return new $resource($obj);
    }

    protected function handleRelations($gender, $validatedDate){
        if (isset($validatedDate['categories_id'])){
            $gender->categories()->sync($validatedDate['categories_id']);
        }         
    }

    protected function model(){
        return Gender::class;
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
        return GenderResource::class;   
    }
}
