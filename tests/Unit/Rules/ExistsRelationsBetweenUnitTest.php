<?php

namespace Tests\Unit\Rules;

use App\Rules\ExistsRelationsBetween;
use PHPUnit\Framework\TestCase;
use Illuminate\Contracts\Validation\Rule;
use Mockery\MockInterface;

class ExistsRelationsBetweenUnitTest extends TestCase
{
    /**
     * A basic unit test example.
     *
     * @return void
     */
    public function testIsInstanceOfRules()
    {
          $this->assertInstanceOf(Rule::class,new ExistsRelationsBetween());
    }

    public function testPassesReturnsFalseIfArraysComperedIsEmpty(){
        $rule = $this->createRuleMock([1]);
        $this->assertFalse($rule->passes('',[]));

        $rule = $this->createRuleMock([]);
        $this->assertFalse($rule->passes('',[1]));

    }

    public function testPassesReturnsFalseIfResultSetWithoutRelations(){
        $collect2 = \collect([0 => ['teste' => collect([])]]);
        $rule = $this->createRuleMock([1],null,'teste');
        $rule
            ->shouldReceive('getRelationshipBetween')
            ->withAnyArgs()
            ->andReturn($collect2);
        
        $this->assertFalse($rule->passes('',[1]));
    }

    public function testPassesReturnsFalseIfGivenArrayWithoutRelations(){
        $collect2 = \collect([0 => ['teste' => collect([['id' => 1]])]]);
        $rule = $this->createRuleMock([1,2],null,'teste');
        $rule
            ->shouldReceive('getRelationshipBetween')
            ->withAnyArgs()
            ->andReturn($collect2);
        
        $this->assertFalse($rule->passes('',[1]));
    }

    public function testPassesIsValid(){
        $collect2 = \collect([0 => ['teste' => collect([['id' => 1]])]]);
        $rule = $this->createRuleMock([1],null,'teste');
        $rule
            ->shouldReceive('getRelationshipBetween')
            ->withAnyArgs()
            ->andReturn($collect2);
        
        $this->assertTrue($rule->passes('',[1]));
    }

    public function testPassesIsValidWithDuplicated(){
        $collect2 = \collect([0 => ['teste' => collect([['id' => 1],['id' => 2]])]]);
        $rule = $this->createRuleMock([1,2,2],null,'teste');
        $rule
            ->shouldReceive('getRelationshipBetween')
            ->withAnyArgs()
            ->andReturn($collect2);
        
        $this->assertTrue($rule->passes('',[1,1,2]));
    }

    protected function createRuleMock($arrayIds = null, $model = null, $keyRelation = null): MockInterface {
        return \Mockery::mock(ExistsRelationsBetween::class, [$arrayIds, $model, $keyRelation])
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();
    }
}
