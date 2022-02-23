<?php

namespace Tests\Feature\Models;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use App\Models\CastMember;
use Tests\TestCase;
use Ramsey\Uuid\Uuid as UuidUuid;


class CastMemberTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(CastMember::class, 1)->create();
        $cast_member = CastMember::all();
        $this->assertCount(1, $cast_member);
        $castMemberKey = array_keys($cast_member->first()->getAttributes());
        $this->assertEqualsCanonicalizing(
            [
                'id',
                'name',
                'type',
                'created_at',
                'updated_at',
                'deleted_at'
            ],
            $castMemberKey
        );
    }

    public function testCreate()
    {        
        $cast_member = CastMember::create([
            'name' => 'test1',
            'type' => CastMember::TYPE_ACTOR
            ]
        );
        $cast_member->refresh();

        $this->assertEquals(36,strlen($cast_member->id));
        $this->assertTrue( UuidUuid::isValid($cast_member->id), 'The Uuid '.$cast_member->id.' is not valid');
        $this->assertEquals('test1', $cast_member->name);
        $this->assertContains(
            $cast_member->type,
            CastMember::TYPE_ARRAY_CAST, 
            'The given type has not a valid value. Allowed values are ' . implode(',', CastMember::TYPE_ARRAY_CAST)
        );  
    }

    public function testUpdate()
    {
        $cast_member = factory(CastMember::class)->create([
            'type' => CastMember::TYPE_DIRECTOR
        ])->first();

        $data = [
            'name' => 'test_name_updated',
            'type' => CastMember::TYPE_ACTOR
        ];
        $cast_member->update($data);

        foreach($data as $key => $value) {
            $this->assertEquals($value, $cast_member->{$key});
        }
    }

    public function testDelete()
    {
        factory(CastMember::class, 2)->create();
        CastMember::destroy(CastMember::all()->first()->getAttributes());
        $this->assertCount(1, CastMember::all());

        $cast_member = factory(CastMember::class)->create();
        $cast_member->delete();
        $this->assertNull(CastMember::find($cast_member->id));

        $cast_member->restore();
        $this->assertNotNull(CastMember::find($cast_member->id));
    }
}
