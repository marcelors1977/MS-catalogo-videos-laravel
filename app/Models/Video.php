<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Video extends Model
{
    use SoftDeletes, Traits\Uuid, Traits\UploadFiles;

    const RATING_LIST = ['L','10','12','14','16','18'];

    protected $fillable = [
        'title',
        'description', 
        'year_launched', 
        'opened', 
        'rating', 
        'duration'
    ];

    protected $dates = ['deleted_at'];

    protected $casts = [ 
        'id'  => 'string', 
        'opened' => 'boolean', 
        'year_lauched' => 'integer', 
        'duration' => 'integer'
    ];

    public $incrementing = false;
    public static $filefields = ['video_file'];

    public static function create(array $attributes = []){
        $files = self::extractFiles($attributes);
        try {
            \DB::beginTransaction();
            $obj = static::query()->create($attributes);
            static::handleRelations($obj, $attributes);
            $obj->uploadFiles($files);
            \DB::commit();
            return $obj;
        } catch (\Exception $e) {
            if (isset($obj)) {
                $obj->deleteFiles($files);
            }
            \DB::rollback();
            throw $e;
        }
    }

    public function update(array $attributes = [], array $options = []){
        try {
            \DB::beginTransaction();
            $saved = parent::update($attributes, $options);
            static::handleRelations($this, $attributes);
            if ($saved){
                //uploads aqui
                //exlcuir os antigos
            }
            //uploads
            \DB::commit();
            return $saved;
        } catch (\Exception $e) {
            // excluir os arquivos de uploads
            \DB::rollback();
            throw $e;
        }
    }

    protected static function handleRelations(Video $video, array $attributes)
    {
        if (isset($attributes['categories_id'])){
            $video->categories()->sync($attributes['categories_id']);
        } 
        
        if (isset($attributes['genders_id'])){
            $video->genders()->sync($attributes['genders_id']);
        }
    }

    public function categories(){
        return $this->belongsToMany(Category::class)->withTrashed();
    }

    public function genders(){
        return $this->belongsToMany(Gender::class)->withTrashed();
    }

    protected function uploadDir(){
       return $this->id; 
    }
}
