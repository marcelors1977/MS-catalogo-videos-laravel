<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use ReflectionClass;

abstract class BasicCrudController extends Controller
{
    protected $paginationSize = 15;
    
    protected abstract function model();

    protected abstract function rulesStore();

    protected abstract function rulesUpdate();

    protected abstract function resource();

    protected abstract function resourceCollection();

    protected function findOrFail($id){
        $model = $this->model();
        $keyName = (new $model)->getRouteKeyName();
        return $this->model()::where($keyName, $id)->firstOrFail();
    }
   
    public function index()
    {
        $data = !$this->paginationSize ? $this->model()::all() : $this->model()::paginate($this->paginationSize);
        $resourceCollectionClass = $this->resourceCollection();
        $refClass = new ReflectionClass($this->resourceCollection());
        return $refClass->isSubclassOf(ResourceCollection::class)
            ? new $resourceCollectionClass($data)
            : $resourceCollectionClass::collection($data);
    }

    public function store(Request $request)
    {
        $validatedDate = $this->validate($request, $this->rulesStore() );
        $obj = $this->model()::create($validatedDate);
        $obj->refresh();
        $resource = $this->resource();
        return new $resource($obj);
    }

    public function show($id)
    {
        $obj = $this->findOrFail($id);
        $resource = $this->resource();
        return new $resource($obj);
    }

    public function update(Request $request, $id)
    {
        $obj = $this->findOrFail($id);
        $validatedDate = $this->validate($request, $this->rulesUpdate() );
        $obj->update($validatedDate);
        $resource = $this->resource();
        return new $resource($obj);
    }

    public function destroy($id)
    {
        $obj = $this->findOrFail($id);
        $obj->delete();
        return response()->noContent(); // retorna 204 - que é sucesso mas não precisa retornar conteúdo
    }
}
