<?php

namespace Tests\Feature\Rules;

use App\Models\Category;
use App\Models\Gender;
use App\Rules\ExistsRelationsBetween;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Database\Eloquent\Collection;
use Tests\TestCase;

class ExistsRelationsBetweenTest extends TestCase
{
    use DatabaseMigrations;

    private $categories;
    private $genders;

    protected function setUp(): void
    {
        parent::setUp();
        $this->categories = \factory(Category::class,4)->create();
        $this->genders = \factory(Gender::class,2)->create();

        $this->genders[0]->categories()->sync([
            $this->categories[0]->id,
            $this->categories[1]->id
        ]);

        $this->genders[1]->categories()->sync([
            $this->categories[2]->id
        ]);
    }

    public function testPassesIsvalid(){
        $rule = $this->basicRule([$this->categories[2]->id]);
        $isValid = $rule->passes('', [$this->genders[1]->id]);
        $this->assertTrue($isValid);

        $rule = $this->basicRule([
            $this->categories[0]->id,
            $this->categories[2]->id
        ]);
        $isValid = $rule->passes('', [
            $this->genders[0]->id,
            $this->genders[1]->id
        ]);
        $this->assertTrue($isValid);

        $rule = $this->basicRule([
            $this->categories[0]->id,
            $this->categories[1]->id,
            $this->categories[2]->id
        ]);
        $isValid = $rule->passes('', [
            $this->genders[0]->id,
            $this->genders[1]->id
        ]);
        $this->assertTrue($isValid);
    }

    public function testPassesIsInvalid(){
        $rule = $this->basicRule([$this->categories[0]->id]);
        $isValid = $rule->passes('', [
            $this->genders[0]->id,
            $this->genders[1]->id
        ]);
        $this->assertFalse($isValid);

        $rule = $this->basicRule([$this->categories[3]->id]);
        $isValid = $rule->passes('', [$this->genders[1]->id]);
        $this->assertFalse($isValid);
    }

    protected function basicRule($arrayIds){
        return new ExistsRelationsBetween(
            $arrayIds,
            Gender::class,
            'categories'
        ); 
    }
}
