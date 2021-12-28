<?php

namespace App\Models\Traits;

use Ramsey\Uuid\Uuid as RamseyUuid;

trait Uuid {

    //função executar antes da criação das tables de fato, para prover o campo Uuid na inserção
    public static function boot(){
        parent::boot();
        static::creating(function($obj){
            $obj->id = RamseyUuid::uuid4()->toString();
        });
    }
}