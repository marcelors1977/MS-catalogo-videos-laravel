<?php

namespace Tests\Unit\Models;

use App\Models\CastMember;
use PHPUnit\Framework\TestCase;
use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;
use EloquentFilter\Filterable;

class CastMemberUnitTest extends TestCase
{
    private $gender;

    protected function setUp(): void
    {
        parent::setUp();
        $this->cast_member = new CastMember();
    }

    public function testFillableAttribute()
    {        
        $fillable = ['name','type'];
        $this->assertEquals($fillable, $this->cast_member->getFillable());
    }
    
    public function testIfUseTraits()
    {
        $traits = [ SoftDeletes::class, Uuid::class, Filterable::class ];
        $castMemberTraits = array_keys(class_uses(CastMember::class));
        $this->assertEquals($traits, $castMemberTraits);
    }

    public function testCasts()
    {
        $casts = [ 'id' => 'string', 'type' => 'integer'];
        $this->assertEquals($casts, $this->cast_member->getCasts());
    }

    public function testIncremeting()
    {
        $this->assertFalse( $this->cast_member->incrementing);
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at','created_at','updated_at'];
        foreach ($dates as $date){
            $this->assertContains($date,$this->cast_member->getDates() );
        }
        $this->assertCount(count($dates), $this->cast_member->getDates());
    }

}
