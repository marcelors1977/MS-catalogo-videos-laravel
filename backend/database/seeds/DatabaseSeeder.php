<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // $this->call(UsersTableSeeder::class);
        $this->call(CategoriesTableSeeder::class);
        $this->call(GendersTableSeeder::class);
        $this->call(CastMembersTableSeeder::class);
        $this->call(VideosTableSeeder::class);
    }
}