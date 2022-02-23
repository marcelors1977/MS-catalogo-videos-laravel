<?php

namespace App\Http\Controllers\Api;

use App\Models\Gender;
use illuminate\Http\Request;


class GenderController extends BasicCrudController
{
    private $rules = [
        'name' => 'required|max:255',
        'is_active' => 'boolean',
        'categories_id' => 'required|array|exists:categories,id'
    ];

    public function store(Request $request)
    {
        $validatedDate = $this->validate($request, $this->rulesStore() );
        $self = $this;
        $obj = \DB::transaction(function () use ($request, $validatedDate, $self) {
            $obj = $this->model()::create($validatedDate);
            $self->handleRelations($obj, $request);
            return $obj;
        });

        $obj->refresh();
        return $obj;
    }

    public function update(Request $request, $id)
    {
        $obj = $this->findOrFail($id);
        $validatedDate = $this->validate($request, $this->rulesUpdate() );
        $self = $this;
        $obj = \DB::transaction(function () use ($request, $validatedDate, $self, $obj) {
            $obj->update($validatedDate);
            $self->handleRelations($obj, $request);
            return $obj;
        });
        return $obj;
    }

    protected function handleRelations($gender, Request $request){
        $gender->categories()->sync($request->get('categories_id'));
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
}
