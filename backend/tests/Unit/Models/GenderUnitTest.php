<?php

namespace Tests\Unit\Models;

use App\Models\Gender;
use PHPUnit\Framework\TestCase;
use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;
use EloquentFilter\Filterable;

class GenderUnitTest extends TestCase
{
    private $gender;

    protected function setUp(): void
    {
        parent::setUp();
        $this->gender = new Gender();
    }

    public function testFillableAttribute()
    {        
        $fillable = ['name','is_active'];
        $this->assertEquals($fillable, $this->gender->getFillable());
    }
    
    public function testIfUseTraits()
    {
        $traits = [ SoftDeletes::class, Uuid::class, Filterable::class ];
        $genderTraits = array_keys(class_uses(Gender::class));
        $this->assertEquals($traits, $genderTraits);
    }

    public function testCasts()
    {
        $casts = [ 'id' => 'string', 'is_active' => 'boolean'];
        $this->assertEquals($casts, $this->gender->getCasts());
    }

    public function testIncremeting()
    {
        $this->assertFalse( $this->gender->incrementing);
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at','created_at','updated_at'];
        foreach ($dates as $date){
            $this->assertContains($date,$this->gender->getDates() );
        }
        $this->assertCount(count($dates), $this->gender->getDates());
    }

}
