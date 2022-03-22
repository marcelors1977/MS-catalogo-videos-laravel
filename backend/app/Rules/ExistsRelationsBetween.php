<?php
declare(strict_types=1);

namespace App\Rules;

use Illuminate\Support\Collection;
use Illuminate\Contracts\Validation\Rule;

class ExistsRelationsBetween implements Rule
{
    private $ids_model_related;
    private $model_with_relantions;
    private $key_of_relationship;
    
    public function __construct($ids_model_related = null, $model_with_relantions = null, $key_of_relationship = null)
    {
        $this->ids_model_related = $ids_model_related == null ? [] : $ids_model_related;
        $this->model_with_relantions = $model_with_relantions;
        $this->key_of_relationship = $key_of_relationship;
    }

    public function passes($attribute, $value)
    {
        $array_value_ids = is_array($value) == false ? [$value] : $value;
        if (!count($array_value_ids) || !count($this->ids_model_related)) {
            return false;
        }

        $result_set = $this->getRelationshipBetween($array_value_ids);
        $array_of_pivot = [];
        /* First, validate the relationship in one direction' */
        foreach ($result_set as $key => $item) { 
            if (!$item[$this->key_of_relationship]->count() ){
                return false;
            }
            \array_push($array_of_pivot, ... $item[$this->key_of_relationship]->pluck('id')->toArray());
        }
        /* Second, validate the relationship in another direction' */
        if( count(array_unique($this->ids_model_related)) !== count(array_unique($array_of_pivot))){
            return false;
        }

        return true;
    }

    protected function getRelationshipBetween($array_value_ids): Collection {
       return 
            $this->model_with_relantions::
                with(
                    [$this->key_of_relationship => 
                            function($query){
                                $query->whereIn('id',$this->ids_model_related);
                            }
                    ]
                )
                ->whereIn('id',$array_value_ids)
                ->get();
    }

    public function message()
    {
        return trans('validation.ExistsRelationsBetween');
    }
}
