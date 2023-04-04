<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Bschmitt\Amqp\Table;
use Bschmitt\Amqp\Message;

class SyncModelObserver
{
    public function created(Model $model)
    {
        $modelName = $this->getModelName($model);
        $data = $model->toArray();
        $action = __FUNCTION__;
        $routingKey = "model.{$modelName}.{$action}";

        try {
            $this->publish($routingKey, $data);
        } catch (\Exception $exception) {
            $id = $model->id;
            $myException = new \Exception("The model $modelName with ID $id not synced on $action", 0, $exception);
            report($myException);
        }
        
    }

    public function updated(Model $model)
    {
        $modelName = $this->getModelName($model);
        $data = $model->toArray();
        $action = __FUNCTION__;
        $routingKey = "model.{$modelName}.{$action}";
        try {
            $this->publish($routingKey, $data);
        } catch (\Exception $exception) {
            $id = $model->id;
            $myException = new \Exception("The model $modelName with ID $id not synced on $action", 0, $exception);
            report($myException);
        }
    }

    public function deleted(Model $model)
    {
        $modelName = $this->getModelName($model);
        $data = ['id' => $model->id];
        $action = __FUNCTION__;
        $routingKey = "model.{$modelName}.{$action}";
        
        try {
            $this->publish($routingKey, $data);
        } catch (\Exception $exception) {
            $id = $model->id;
            $myException = new \Exception("The model $modelName with ID $id not synced on $action", 0, $exception);
            report($myException);
        }
    }

    public function belongsToManyAttached($relation, $model, $ids){
        $modelName = $this->getModelName($model);
        $relationName = \Str::snake($relation);
        $routingKey = "model.{$modelName}_{$relationName}.attached";
        $data = [
            'id' => $model->id,
            'relation_ids' => $ids
        ];
        
        try {
            $this->publish($routingKey, $data, 10000);
        } catch (\Exception $exception) {
            $id = $model->id;
            $myException = new \Exception("The model $modelName with ID $id not synced on attached", 0, $exception);
            report($myException);
        }
    }
    
    public function belongsToManyDetached($relation, $model, $ids){
        $modelName = $this->getModelName($model);
        $relationName = \Str::snake($relation);
        $routingKey = "model.{$modelName}_{$relationName}.detached";
        $data = [
            'id' => $model->id,
            'relation_ids' => $ids
        ];
        
        try {
            $this->publish($routingKey, $data, 2000);
        } catch (\Exception $exception) {
            $id = $model->id;
            $myException = new \Exception("The model $modelName with ID $id not synced on detached", 0, $exception);
            report($myException);
        }
    }

    public function restored(Model $model)
    {
        //
    }

    public function forceDeleted(Model $model)
    {
        //
    }

    protected function getModelName(Model $model) {
        $shortName = (new \ReflectionClass($model))->getShortName();
        return \Str::snake($shortName);
    }

    protected function publish($routingKey, array $data, $delayMessage = 0) {

        $message = new Message(
            \json_encode($data),
            [
                'content_type' => 'application/json',
                'delivery_mode' => 2 ,// persistent 
            ]
        ); 

        if( $delayMessage ) {
            $headers = new Table(array(
                'x-delay' => $delayMessage,
            ));
    
            $message->set('application_headers',$headers); 
        }    

        \Amqp::publish(
                $routingKey,
                $message,
                [
                    'exchange_type' => 'x-delayed-message',
                    'exchange' => config('amqp.properties.production.exchange'),
                ]
            );
    }
}
