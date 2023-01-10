<?php

namespace App\Observers;

use App\Models\Gender;
use Bschmitt\Amqp\Message;

class GenderObserver
{
    public function created(Gender $gender)
    { 
        $message = new Message($gender->toJson());
        \Amqp::publish('model.gender.created', $message);
    }

    public function updated(Gender $gender)
    {
        $message = new Message($gender->toJson());
        \Amqp::publish('model.gender.updated', $message);
    }

    public function deleted(Gender $gender)
    {
        $message = new Message(json_encode(['id' => $gender->id]));
        \Amqp::publish('model.gender.deleted', $message);
    }

    public function restored(Gender $gender)
    {
        //
    }

    public function forceDeleted(Gender $gender)
    {
        //
    }
}
