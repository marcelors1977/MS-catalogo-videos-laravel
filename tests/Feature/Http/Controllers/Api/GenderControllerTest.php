<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\Gender;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class GenderControllerTest extends TestCase
{
    use DatabaseMigrations;

    public function testIndex()
    {
        $gender = factory(Gender::class)->create();
        $response = $this->get(route('genders.index'));

        $response->assertStatus(200);
        $response->assertJson([$gender->toArray()]);
    }

    public function testShow()
    {
        $gender = factory(Gender::class)->create();
        $response = $this->get(route('genders.show', ['gender' => $gender->id]));

        $response->assertStatus(200);
        $response->assertJson($gender->toArray());
    }

    public function testInvalidationData()
    {
        $response = $this->json('POST', route('genders.store'), []);
        $this->assertInvalidationRequired($response);

        $response = $this->json(
            'POST',
            route('genders.store'),
            [
                'name' => \str_repeat('a', 256),
                'is_active' => 'a'
            ]
        );
        $this->assertInvalidationMax($response);
        $this->assertInvalidationBoolean($response);

        $gender = \factory(Gender::class)->create();
        $response = $this->json('PUT', route('genders.update', ['gender' => $gender->id]), []);
        $this->assertInvalidationRequired($response);

        $response = $this->json(
            'PUT',
            route('genders.update', ['gender' => $gender->id]),
            [
                'name' => \str_repeat('a', 256),
                'is_active' => 'a'
            ]
        );
        $this->assertInvalidationMax($response);
        $this->assertInvalidationBoolean($response);
    }

    protected function assertInvalidationRequired(TestResponse $response)
    {
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonMissingValidationErrors('is_active')
            ->assertJsonFragment([
                \Lang::get('validation.required', ['attribute' => 'name'])
            ]);
    }

    protected function assertInvalidationMax(TestResponse $response)
    {
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonFragment([
                \Lang::get('validation.max.string', ['attribute' => 'name', 'max' => 255]),
            ]);
    }

    protected function assertInvalidationBoolean(TestResponse $response)
    {
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['is_active'])
            ->assertJsonFragment([
                \Lang::get('validation.boolean', ['attribute' => 'is active']),
            ]);
    }

    public function testStore()
    {
        $response = $this->json('POST', route('genders.store'), [
            'name' => 'test'
        ]);

        $id = $response->json('id');
        $gender = Gender::find($id);

        $response
            ->assertStatus(201)
            ->assertJson($gender->toArray());
        $this->assertTrue($response->json('is_active'));
        $this->assertNull($response->json('description'));

        $response = $this->json('POST', route('genders.store'), [
            'name' => 'test',
            'is_active' => false
        ]);

        $response->assertJsonFragment([
            'is_active' => false,
        ]);
    }

    public function testUpdate()
    {
        $gender = factory(Gender::class)->create([
            'is_active' => false
        ]);
        $response = $this->json(
            'PUT',
            route('genders.update', ['gender' => $gender->id]),
            [
                'name' => 'test',
                'is_active' => true
            ]
        );

        $id = $response->json('id');
        $gender = Gender::find($id);

        $response
            ->assertStatus(200)
            ->assertJson($gender->toArray())
            ->assertJsonFragment([
                'is_active' => true,
            ]);

    }

    public function testDelete()
    {
        $gender = factory(Gender::class, 2)->create();
        
        $response = $this->json('DELETE',route('genders.destroy', ['gender' => $gender[1]]));
        $response->assertNoContent(204);

        $response = $this->get(route('genders.show', ['gender' => $gender[1]]));
        $response->assertNotFound();
        
        $response = $this->get(route('genders.index'));
        $response->assertJsonCount(1);
    
    }
}

