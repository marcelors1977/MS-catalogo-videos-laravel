<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Models\CastMember;
use Faker\Generator as Faker;

$factory->define(CastMember::class, function (Faker $faker) {
    return [
        'name' => $faker->unique()->name(),
        'type' => CastMember::TYPE_ARRAY_CAST[array_rand(CastMember::TYPE_ARRAY_CAST,1)]
    ];
});
