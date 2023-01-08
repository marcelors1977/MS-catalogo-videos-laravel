<?php

namespace App\Providers;

use App\Models\CastMember;
use App\Models\Category;
use App\Models\Gender;
use App\Observers\CastMemberObserver;
use App\Observers\CategoryObserver;
use App\Observers\GenderObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
        \View::addExtension('html','blade');
        Category::observe(CategoryObserver::class);
        CastMember::observe(CastMemberObserver::class);
        Gender::observe(GenderObserver::class);
    }
}
