<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\GenderController;
use App\Http\Resources\GenderResource;
use App\Models\Category;
use App\Models\Gender;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;
use Tests\Exceptions\TestException;
use illuminate\Http\Request;
use Tests\Traits\TestResources;

class GenderControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves, TestResources;

    private $gender;
    private $serializedFields = [
        'id',
        'name',
        'is_active',
        'created_at',
        'updated_at',
        'deleted_at',
        'categories' => [
            '*' => [
                'id',
                'name',
                'description',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at'
            ]
        ]
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->gender = factory(Gender::class)->create();
    }

    public function testIndex()
    {
        $response = $this->get(route('genders.index'));
        $response
            ->assertStatus(200)
            ->assertJson([
                'meta' => ['per_page' => 15]
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => $this->serializedFields
                ],
                'links' => [],
                'meta' => []
            ]);
        $this->assertResource($response, GenderResource::collection(collect([$this->gender]))); 
    }

    public function testShow()
    {
        $response = $this->get(route('genders.show', ['gender' => $this->gender->id]));

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
            'data' => $this->serializedFields
            ])
            ->assertJsonFragment($this->gender->toArray());

        $this->assertResource($response, new GenderResource($this->gender));
    }

    public function testInvalidationRequired(){
        $data = [ 'name' => ''];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');
    }

    public function testInvalidationMax(){
        $data = [
            'name' => \str_repeat('a', 256)
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);       
    }

    public function testInvalidationOpenedField(){
        $data = [
            'is_active' => 'a'
        ];  
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');      
    }

    public function testInvalidationCategoriesField(){
        $data = [ 'categories_id' => 'a'];

        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');    
        
        $data = [ 'categories_id' => [100] ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists'); 

        $category = \factory(Category::class)->create();
        $category->delete();

        $data = [
            'categories_id' => [$category->id]
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists'); 
    }

    public function testRollbackStore(){
        $this->generalRollback('rulesStore');
    }

    public function testRollbackUpdate(){
        $this->generalRollback('rulesUpdate');
    }

    public function generalRollback($rules){
        $controller = \Mockery::mock(GenderController::class)
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();
        
        $controller
            ->shouldReceive('validate')
            ->withAnyArgs()
            ->andReturn([
                'name' => 'test',
                'is_active' => false
            ]);

        $controller
            ->shouldReceive($rules)
            ->withAnyArgs()
            ->andReturn([]);
  
        $controller
            ->shouldReceive('handleRelations')
            ->once()
            ->andThrow(new TestException());

        $request = \Mockery::mock(Request::class);
        $request->categories_id = [];

        $hasError = false;
        try {
            if( $rules === 'rulesUpdate' ){
                $controller->update($request, $this->gender->id);
            } else {
                $controller->store($request);
            }
            
        } catch (TestException $exception) {
            if( $rules === 'rulesUpdate' ){
                $this->assertTrue(Gender::find($this->gender->id)->toArray()['is_active'] );
            } else {
                $this->assertCount(1, Gender::all());
            }  
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testSave(){
        $category = \factory(Category::class)->create();
        $data = [
            [
                'send_data' => ['name' => 'test_gender_save', 'categories_id' => [$category->id]],
                'test_data' => ['name' => 'test_gender_save', 'is_active' => true]
            ],
            [
                'send_data' => ['name' => 'test_gender_save', 'is_active' => false, 'categories_id' => [$category->id]],
                'test_data' => ['name' => 'test_gender_save', 'is_active' => false]
            ]
        ];

        $serializedFieldsNoCategories = \array_filter($this->serializedFields, function($item,$key) {
            return $key !== 'categories' ? $item : '';
        },ARRAY_FILTER_USE_BOTH );

        foreach ($data as $key => $value) {
            $response = $this->assertStore(
                $value['send_data'], 
                $value['test_data'] + ['deleted_at' => null]
            ); 
            $response->assertJsonStructure([
                'data' => $serializedFieldsNoCategories
            ]);

            $id = $this->getIdFromResponse($response);
            $this->assertHasCategory($id, $category->id);
            $this->assertResource($response, new GenderResource(Gender::find($id)));

            $response = $this->assertUpdate(
                $value['send_data'], 
                $value['test_data'] + ['deleted_at' => null]
            );
            $response->assertJsonStructure([
                'data' => $serializedFieldsNoCategories
            ]);
            $id = $this->getIdFromResponse($response);
            $this->assertHasCategory($id, $category->id);
            $this->assertResource($response, new GenderResource(Gender::find($id)));
        }
    }

    public function testDelete()
    {
        $gender = factory(Gender::class)->create();
        
        $response = $this->json('DELETE',route('genders.destroy', ['gender' => $gender]));
        $response->assertNoContent(204);

        $response = $this->get(route('genders.show', ['gender' => $gender]));
        $response->assertNotFound();
        
        $response = $this->get(route('genders.index'));
        $resource = GenderResource::collection(collect([$this->gender]));
        $this->assertResource($response, $resource);
    }

    public function testHandleRelations(){
        $gender = factory(Gender::class)->create();
        $reflectionClass = new \ReflectionClass(GenderController::class);
        $refletionMethod = $reflectionClass->getMethod('handleRelations');
        $refletionMethod->setAccessible(true);
        $controller = new GenderController;

        $refletionMethod->invokeArgs(
            $controller, 
            [$gender, ['categories_id' => []]
        ]);
        $this->assertCount(0, $gender->categories);

        $category = \factory(Category::class)->create();
        $refletionMethod->invokeArgs(
            $controller, 
            [$gender, ['categories_id' => [$category->id]]
        ]);

        $gender->refresh();
        $this->assertCount(1, $gender->categories);
        $this->assertHasCategory($gender->id, $category->id);

        $refletionMethod->invokeArgs(
            $controller, 
            [$this->gender, []
        ]);
        $this->gender->refresh();
        $this->assertCount(1, $gender->categories);
        $this->assertHasCategory($gender->id, $category->id);
        
        $refletionMethod->invokeArgs(
            $controller, 
            [$gender, ['categories_id' => []]
        ]);
        $gender->refresh();
        $this->assertCount(0, $gender->categories);
        $this->assertDatabaseMissing('category_gender', [
            'category_id' => $category->id,
            'gender_id' => $gender->id
        ]);
    }

    public function testSyncCategories(){
        $categoryId = \factory(Category::class,3)->create()->pluck('id')->toArray();
        $sendData = [
            'name' => 'teste',
            'categories_id' => [$categoryId[0]]
        ];
        $response = $this->json('POST', $this->routeStore(), $sendData);
        $this->assertDatabaseHas('category_gender', [
            'category_id' => $categoryId[0],
            'gender_id' => $this->getIdFromResponse($response)
        ]);

        $sendData = [
            'name' => 'teste',
            'categories_id' => [$categoryId[1], $categoryId[2]]
        ];
        $response = $this->json('PUT', $this->routeUpdate(), $sendData);
           $this->assertDatabaseMissing('category_gender', [
            'category_id' => $categoryId[0],
            'gender_id' => $this->getIdFromResponse($response)
        ]);
        $this->assertDatabaseHas('category_gender', [
            'category_id' => $categoryId[1],
            'gender_id' => $this->getIdFromResponse($response)
        ]);
        $this->assertDatabaseHas('category_gender', [
            'category_id' => $categoryId[2],
            'gender_id' => $this->getIdFromResponse($response)
        ]);
    }

    protected function assertHasCategory($genderId, $categoryId){
        $this->assertDatabaseHas('category_gender', [
            'gender_id' => $genderId,
            'category_id' => $categoryId
        ]);
    }

    protected function routeStore(){
        return route('genders.store');
    }

    protected function routeUpdate(){
        return route('genders.update', ['gender' => $this->gender->id]);
    }

    protected function model(){
        return Gender::class;
    }
}

