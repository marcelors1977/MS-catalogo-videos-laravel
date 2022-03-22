<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestResources;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class CategoryControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves, TestResources;

    private $category;
    private $serializedFields = [
        'id',
        'name',
        'description',
        'is_active',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->category = factory(Category::class)->create();
    }

    public function testIndex()
    {
        $response = $this->get(route('categories.index'));

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

        $this->assertResource(
            $response, 
            CategoryResource::collection(collect([$this->category]))
        );    
    }

    public function testShow()
    {
        $response = $this->get(route('categories.show', ['category' => $this->category->id]));

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => $this->serializedFields
            ]);

        $id = $this->getIdFromResponse($response);
        $this->assertResource($response, new CategoryResource(Category::find($id)));
    }

    public function testInvalidationData()
    {
        $data = [ 'name' => ''];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');

        $data = [
            'name' => \str_repeat('a', 256)
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);

        $data = [
            'is_active' => 'a'
        ];        
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');
    }

    public function testStore()
    {
        $data = [
            'name' => 'test_category_store'
        ];
        $response = $this->assertStore($data, $data + ['description' => null , 'is_active' => true, 'deleted_at' => null]);
        $response->assertJsonStructure([
            'data' => $this->serializedFields
        ]);
        $data = [
            'name' => 'test',
            'description' => 'description',
            'is_active' => false
        ];
        $this->assertStore($data, $data + ['description' => 'description' , 'is_active' => false]);
        $id = $this->getIdFromResponse($response);
        $this->assertResource($response, new CategoryResource(Category::find($id))
        );
    }

    public function testUpdate()
    {
        $this->category->is_active = false;

        $data = [
            'name' => 'test_category_update',
            'description' => 'test_category_update',
            'is_active' => true 
        ];
        $response = $this->assertUpdate($data, $data + ['deleted_at' => null]);
        $response->assertJsonStructure([
            'data' => $this->serializedFields
        ]);
        $id = $this->getIdFromResponse($response);
        $this->assertResource($response, new CategoryResource(Category::find($id)));

        $data = [
            'name' => 'test_category_update',
            'description' => ''
        ];
        $this->assertUpdate($data,  array_merge($data, ['description' => null]));

        $data['description'] = 'test_update_category';
        $this->assertUpdate($data,  array_merge($data, ['description' => 'test_update_category']));
  
        $data['description'] = null;
        $this->assertUpdate($data,  array_merge($data, ['description' => null]));
    }

    public function testDelete() {
        $category = factory(Category::class)->create();

        $response = $this->get(route('categories.index'));
        $response->assertJsonCount(2, 'data');

        $response = $this->json('DELETE',route('categories.destroy', ['category' => $category]));
        $response->assertNoContent(204);

        $response = $this->get(route('categories.show', ['category' => $category]));
        $response->assertNotFound();
        
        $response = $this->get(route('categories.index'));
        $this->assertResource(
            $response, 
            CategoryResource::collection(collect([$this->category]))
        );
    }

    protected function routeStore(){
        return route('categories.store');
    }

    protected function routeUpdate(){
        return route('categories.update', ['category' => $this->category->id]);
    }

    protected function model(){
        return Category::class;
    }
}
