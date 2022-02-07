<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class CastMemberControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves;

    private $castMember;

    protected function setUp(): void
    {
        parent::setUp();
        $this->castMember = factory(CastMember::class)->create();
    }

    public function testIndex()
    {
        $response = $this->get(route('cast_members.index'));

        $response->assertStatus(200);
        $response->assertJson([$this->castMember->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('cast_members.show', ['cast_member' => $this->castMember->id]));

        $response->assertStatus(200);
        $response->assertJson($this->castMember->toArray());
    }

    public function testInvalidationData()
    {
        $data = [ 
            'name' => '',
            'type' => ''
        ];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');

        $data = [
            'name' => \str_repeat('a', 256)
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);

        $data = [
            'type' => '3'
        ];        
        $this->assertInvalidationInStoreAction($data, 'in');
        $this->assertInvalidationInUpdateAction($data, 'in');
    }

    public function testStore()
    {
        $data = [
            'name' => 'test_cast',
            'type' => '2'
        ];
        $response = $this->assertStore($data, $data + [ 'deleted_at' => null]);
        $response->assertJsonStructure([
            'created_at', 'updated_at'
        ]);
    }

    public function testUpdate()
    {
        $this->castMember = factory(CastMember::class)->create([
            'type' => '1'
        ]);

        $data = [
            'name' => 'test_updated',
            'type' => '2'
        ];
        $response = $this->assertUpdate($data, $data + ['deleted_at' => null]);
        $response->assertJsonStructure([
            'created_at', 'updated_at'
        ]);
    }

    public function testDelete()
    {
        $cast_member = factory(CastMember::class)->create();
 
        $response = $this->json('DELETE',route('cast_members.destroy', ['cast_member' => $cast_member->id]));
        $response->assertNoContent(204);

        $response = $this->get(route('cast_members.show', ['cast_member' => $cast_member->id]));
        $response->assertNotFound();
        
        $response = $this->get(route('cast_members.index'));
        $response->assertJson([$this->castMember->toArray()]);

    }

    protected function routeStore(){
        return route('cast_members.store');
    }

    protected function routeUpdate(){
        return route('cast_members.update', ['cast_member' => $this->castMember->id]);
    }

    protected function model(){
        return CastMember::class;
    }
}

