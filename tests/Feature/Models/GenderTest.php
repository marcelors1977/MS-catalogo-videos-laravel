<?php

namespace Tests\Feature\Models;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use App\Models\Gender;
use Tests\TestCase;
use Ramsey\Uuid\Uuid as UuidUuid;


class GenderTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(Gender::class, 1)->create();
        $gender = Gender::all();
        $this->assertCount(1, $gender);
        $genderKey = array_keys($gender->first()->getAttributes());
        $this->assertEqualsCanonicalizing(
            [
                'id',
                'name',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at'
            ],
            $genderKey
        );
    }

    public function testCreate()
    {        
        $gender = Gender::create(
            ['name' => 'test1']
        );
        $gender->refresh();

        $this->assertEquals('test1', $gender->name);
        $this->assertNull($gender->description);
        $this->assertTrue($gender->is_active);
        
        $gender = Gender::create([
            'name' => 'test1',
            'is_active' => false
        ]);
        $this->assertFalse($gender->is_active);
    
        $gender = Gender::create([
            'name' => 'test1',
            'is_active' => true
        ]);
        $this->assertTrue($gender->is_active);

        $gender = Gender::create([
            'name' => 'test_uuid_invalid'
        ]);
        $gender->id = '123456789';
        $this->assertFalse( UuidUuid::isValid($gender->id), 'The Uuid '.$gender->id.' is not valid');

        $gender = Gender::create([
            'name' => 'test_uuid_valid'
        ]);
        $this->assertTrue( UuidUuid::isValid($gender->id), 'The Uuid '.$gender->id.' is not valid');
    }

    public function testUpdate()
    {
        $gender = factory(Gender::class)->create([
            'is_active' => false
        ])->first();

        $data = [
            'name' => 'test_name_updated',
            'is_active' => true
        ];
        $gender->update($data);

        foreach($data as $key => $value) {
            $this->assertEquals($value, $gender->{$key});
        }
    }

    public function testDelete()
    {
        factory(Gender::class, 2)->create();
        Gender::destroy(Gender::all()->first()->getAttributes());
        $this->assertCount(1, Gender::all());
    }
}
