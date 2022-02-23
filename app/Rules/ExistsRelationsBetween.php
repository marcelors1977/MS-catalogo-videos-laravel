<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class ExistsRelationsBetween implements Rule
{
    private $ids_model_related;
    private $model_with_relantions;
    private $key_of_relationship;
    
    public function __construct($ids_model_related, $model_with_relantions, $key_of_relationship)
    {
        $this->ids_model_related = $ids_model_related == null ? [] : $ids_model_related;
        $this->model_with_relantions = $model_with_relantions;
        $this->key_of_relationship = $key_of_relationship;
    }

    public function passes($attribute, $value)
    {
        $array_genders_id = is_array($value) == false ? [$value] : $value;

        $result_set = 
            $this->model_with_relantions::
                with(
                    [$this->key_of_relationship => 
                            function($query){
                                $query->whereIn('categories.id',$this->ids_model_related);
                            }
                    ]
                )
                ->whereIn('genders.id',$array_genders_id)->get();

        $array_of_pivot = [];
        /* First, validate the relationship in one direction' */
        foreach ($result_set as $key => $item) { 
            if (!$item[$this->key_of_relationship]->toArray() ){
                return false;
            } 
            $array_of_pivot = array_merge($array_of_pivot, $item[$this->key_of_relationship]->pluck('pivot.category_id')->toArray());
        }

        /* Second, validate the relationship in another direction' */
        foreach ($this->ids_model_related as $id) {
            if ( in_array($id, $array_of_pivot) == false ){
                return false;
            }
        }

        return true;
    }

    public function message()
    {
        return trans('validation.ExistsRelationsBetween');
    }
}
