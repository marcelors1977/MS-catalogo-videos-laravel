<?php

namespace App\Observers;

use App\Models\Gender;
use Bschmitt\Amqp\Message;

class GenderObserver
{
    /**
     * Handle the gender "created" event.
     *
     * @param  \App\Models\Gender  $gender
     * @return void
     */
    public function created(Gender $gender)
    { 
        $message = new Message($gender->toJson());
        \Amqp::publish('model.gender.created', $message);
    }

    /**
     * Handle the gender "updated" event.
     *
     * @param  \App\Models\Gender  $gender
     * @return void
     */
    public function updated(Gender $gender)
    {
        $message = new Message($gender->toJson());
        \Amqp::publish('model.gender.updated', $message);
    }

    /**
     * Handle the gender "deleted" event.
     *
     * @param  \App\Models\Gender  $gender
     * @return void
     */
    public function deleted(Gender $gender)
    {
        $message = new Message($gender->toJson());
        \Amqp::publish('model.gender.deleted', $message);
    }

    /**
     * Handle the gender "restored" event.
     *
     * @param  \App\Models\Gender  $gender
     * @return void
     */
    public function restored(Gender $gender)
    {
        //
    }

    /**
     * Handle the gender "force deleted" event.
     *
     * @param  \App\Models\Gender  $gender
     * @return void
     */
    public function forceDeleted(Gender $gender)
    {
        //
    }
}
