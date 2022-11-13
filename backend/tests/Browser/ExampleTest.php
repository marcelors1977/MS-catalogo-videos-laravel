<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    /**
     * A basic browser test example.
     *
     * @return void
     */

    public function testBasicExample()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/admin/categories')
                    ->waitForText('Listagem de categorias',1)
                    ->assertSee('Listagem de categorias')
                    ->assertSee('ID')
                    ->assertSee('Nome')
                    ->assertSee('Ativo?')
                    ->assertSee('Criado em')
                    ->assertSee('Ações');
        });
    }
}
