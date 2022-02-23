<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\Category;
use App\Models\Gender;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;


class GenderControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves;

    private $gender;

    protected function setUp(): void
    {
        parent::setUp();
        $this->gender = factory(Gender::class)->create();
    }

    public function testIndex()
    {
         $response = $this->get(route('genders.index'));

        $response->assertStatus(200);
        $response->assertJson([$this->gender->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('genders.show', ['gender' => $this->gender->id]));

        $response->assertStatus(200);
        $response->assertJson($this->gender->toArray());
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

        foreach ($data as $key => $value) {
            $response = $this->assertStore(
                $value['send_data'], 
                $value['test_data'] + ['deleted_at' => null]
            );   
            $response->assertJsonStructure([
                'created_at', 'updated_at'
            ]);

            $response = $this->assertUpdate(
                $value['send_data'], 
                $value['test_data'] + ['deleted_at' => null]
            );
            $response->assertJsonStructure([
                'created_at', 'updated_at'
            ]);
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
        $response->assertJson([$this->gender->toArray()]);

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

