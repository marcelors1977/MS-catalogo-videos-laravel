<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Video extends Model
{
    use SoftDeletes, Traits\Uuid, Traits\UploadFiles;

    const RATING_LIST = ['L','10','12','14','16','18'];

    const THUMB_FILE_MAX_SIZE = 1024 * 5; // 5MB
    const BANNER_FILE_MAX_SIZE = 1024 * 10; // 10MB
    const TRAILER_FILE_MAX_SIZE = 1024 * 1024 * 1; // 1GB
    const VIDEO_FILE_MAX_SIZE = 1024 * 1024 * 50; // 50GB

    protected $fillable = [
        'title',
        'description', 
        'year_launched', 
        'opened', 
        'rating', 
        'duration',
        'video_file',
        'thumb_file',
        'banner_file',
        'trailer_file'
    ];

    protected $dates = ['deleted_at'];

    protected $casts = [ 
        'id'  => 'string', 
        'opened' => 'boolean', 
        'year_lauched' => 'integer', 
        'duration' => 'integer'
    ];

    public $incrementing = false;
    public static $filefields = [
        'video_file', 
        'thumb_file', 
        'banner_file', 
        'trailer_file'
    ];

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
        $files = self::extractFiles($attributes);
        try {
            \DB::beginTransaction();
            $saved = parent::update($attributes, $options);
            static::handleRelations($this, $attributes);
            if ($saved){
                self::uploadFiles($files);
            }
            \DB::commit();
            if ($saved && count($files)){
                self::deleteOldFiles();
            }
            return $saved;
        } catch (\Exception $e) {
            self::deleteFiles($files);
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

    public function getVideoFileUrlAttribute()
    {
       return $this->video_file ? $this->getFileUrl($this->video_file) : null;
    }

    public function getThumbFileUrlAttribute()
    {
       return $this->thumb_file ? $this->getFileUrl($this->thumb_file) : null;
    }

    public function getBannerFileUrlAttribute()
    {
       return $this->banner_file ? $this->getFileUrl($this->banner_file) : null;
    }

    public function getTrailerFileUrlAttribute()
    {
       return $this->trailer_file ? $this->getFileUrl($this->trailer_file) : null;
    }

    protected function uploadDir(){
       return $this->id; 
    }
}
