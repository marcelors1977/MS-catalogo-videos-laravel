<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use App\Http\Resources\CategoryResource;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Tests\Stubs\Controllers\CategoryControllerStub;
use Tests\Stubs\Models\CategoryStub;
use Tests\TestCase;
use illuminate\Http\Request;
use illuminate\Validation\ValidationException;

class BasicCrudControllerTest extends TestCase
{
    private $serializedFields = [
        'id',
        'name',
        'description',
        'created_at',
        'updated_at'
    ];

    protected function setUp(): void
    {
        parent::setUp();
        CategoryStub::dropTable();
        CategoryStub::createTable();
        $this->controller = new CategoryControllerStub();
    }

    protected function tearDown(): void
    {
        CategoryStub::dropTable();
        parent::tearDown();                
    }

    public function testIndex(){
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $request = \Mockery::mock(Request::class)
            ->makePartial();
        $request
            ->shouldReceive('get')
            ->andReturn('15');
        $request
            ->shouldReceive('all');

        $dataArray = $this->controller->index($request)->response()->getData(true);
        
        $this->assertEquals([$category->toArray()], $dataArray['data']);

        $this->assertArrayHasKey('links', $dataArray);
        $this->assertEquals(15, $dataArray['meta']['per_page']);
        foreach ($this->serializedFields as $key) {
            $this->assertArrayHasKey($key, $dataArray['data'][0]);
        }
    }

    public function testInvalidationDataInStore(){
        $this->expectException(ValidationException::class);
        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => '']);
        $this->controller->store($request);
    }

    public function testStore(){
        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test_name', 'description' => 'test_description']);
        $obj = $this->controller->store($request);
        $data = $obj->response()->getData(true);
        
        $this->assertArrayHasKey('data', $data);
        $this->assertEquals($data['data'],CategoryStub::find($obj->id)->toArray());
       
        foreach ($this->serializedFields as $key) {
            $this->assertArrayHasKey($key, $data['data']);
        }
    }
    
    public function testShow(){
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $data = $this->controller->show([$category->id])->response()->getData(true);
        
        $this->assertArrayHasKey('data', $data);
        $this->assertEquals($data['data'],$category->toArray());
        
        foreach ($this->serializedFields as $key) {
            $this->assertArrayHasKey($key, $data['data']);
        }
    }

    public function testUpdate(){
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $request = \Mockery::mock(Request::class)
            ->makePartial();
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test_updated', 'description' => 'test_description_updated']);
        $request
            ->shouldReceive('isMethod')
            ->andReturn('PUT');

        $obj = $this->controller->update($request, $category->id);
        $data = $obj->response()->getData(true);
  
        $this->assertArrayHasKey('data', $data);
        $this->assertEquals($data['data'],CategoryStub::find($obj->id)->toArray());

        foreach ($this->serializedFields as $key) {
            $this->assertArrayHasKey($key, $data['data']);
        }
    }

    public function testDelete(){
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $obj = $this->controller->destroy($category->id);
        $this->assertNull(CategoryStub::find($category->id));
    }

    public function testIfFindOrFailFetchModel(){
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);

        $reflectionClass = new \ReflectionClass(BasicCrudController::class);
        $refletionMethod = $reflectionClass->getMethod('findOrFail');
        $refletionMethod->setAccessible(true);

        $result = $refletionMethod->invokeArgs($this->controller, [$category->id]);
        $this->assertInstanceOf(CategoryStub::class, $result);
    }

    public function testIfFindOrFailThrowExceptionIdInvalid(){
        $this->expectException(ModelNotFoundException::class);
        $reflectionClass = new \ReflectionClass(BasicCrudController::class);
        $refletionMethod = $reflectionClass->getMethod('findOrFail');
        $refletionMethod->setAccessible(true);

        $result = $refletionMethod->invokeArgs($this->controller, [0]);
        $this->assertInstanceOf(CategoryStub::class, $result);
    }
}
