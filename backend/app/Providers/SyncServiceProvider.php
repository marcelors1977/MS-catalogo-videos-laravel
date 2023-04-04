<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\CastMember;
use App\Models\Category;
use App\Models\Gender;
use App\Observers\SyncModelObserver;

class SyncServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {     
        if (config('app.sync_rabbitmq_enable') !== true) {
            return;
        }
        Category::observe(SyncModelObserver::class);
        CastMember::observe(SyncModelObserver::class);
        Gender::observe(SyncModelObserver::class);
    }
}
