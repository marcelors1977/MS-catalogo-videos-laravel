<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use illuminate\Http\Request;

abstract class BasicCrudController extends Controller
{
    protected abstract function model();

    protected abstract function rulesStore();

    protected abstract function rulesUpdate();

    protected function findOrFail($id){
        $model = $this->model();
        $keyName = (new $model)->getRouteKeyName();
        return $this->model()::where($keyName, $id)->firstOrFail();
    }
   
    public function index()
    {
        return $this->model()::all();
    }

    public function store(Request $request)
    {
        $validatedDate = $this->validate($request, $this->rulesStore() );
        $obj = $this->model()::create($validatedDate);
        $obj->refresh();
        return $obj;
    }

    public function show($id)
    {
        $obj = $this->findOrFail($id);
        return $obj;
    }

    public function update(Request $request, $id)
    {
        $obj = $this->findOrFail($id);
        $validatedDate = $this->validate($request, $this->rulesUpdate() );
        $obj->update($validatedDate);
        return $obj;
    }

    public function destroy($id)
    {
        $obj = $this->findOrFail($id);
        $obj->delete();
        return response()->noContent(); // retorna 204 - que é sucesso mas não precisa retornar conteúdo
    }
}
