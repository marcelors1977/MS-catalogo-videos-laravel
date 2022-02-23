<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Tests\Stubs\Controllers\CategoryControllerStub;
use Tests\Stubs\Models\CategoryStub;
use Tests\TestCase;
use illuminate\Http\Request;
use illuminate\Validation\ValidationException;

class BasicCrudControllerTest extends TestCase
{
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
        $this->assertEquals([$category->toArray()], $this->controller->index()->toArray());
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
        $this->assertEquals(
            CategoryStub::find(1)->toArray(),
            $obj->toArray()
        );
    }

    public function testShow(){
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $this->assertEquals([$category->toArray()], [$this->controller->show([$category->id])->toArray()]);
    }

    public function testUpdate(){
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test_updated', 'description' => 'test_description_updated']);
        $obj = $this->controller->update($request, $category->id);
        $this->assertEquals(
            CategoryStub::find(1)->toArray(),
            $obj->toArray()
        );
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

    protected function searchColunmInArray(array $array, string $colunm) {
        foreach ($array as $key => $value) {
            if(is_array($value)){
                return $this->searchColunmInArray($value, $colunm);
            }
            elseif ($key == $colunm) {
                return $value;
            }
        }
        return null;
    }

}
