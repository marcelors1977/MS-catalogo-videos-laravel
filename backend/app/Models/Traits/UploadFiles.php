<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

trait UploadFiles {

    public $oldFiles = [];

    protected abstract function uploadDir();

    public static function bootUploadFiles(){
        static::updating(function (Model $model){
            $fieldsUpdated = array_keys($model->getDirty());
            $filesUpdated = array_intersect($fieldsUpdated, self::$filefields);
            $filesFiltered = Arr::where($filesUpdated, function ($fileField) use($model) {
                return $model->getOriginal($fileField);
            });
            $model->oldFiles = array_map(function($fileField) use($model) {
                return $model->getOriginal($fileField);
            }, $filesFiltered);
        });
    }

    public function uploadFiles(array $files)
    {
         foreach ($files as $file) {
            $this->uploadFile($file);
        }
    }

    public function uploadFile(UploadedFile $file){
        $file->store($this->uploadDir());
    }

    public function deleteOldFiles(){
        $this->deleteFiles($this->oldFiles);
    }

    public function deleteFiles(array $files){
        foreach ($files as $file) {
            $this->deleteFile($file);
        }
    }

    public function deleteFile($file){
        $filename = $file instanceof UploadedFile ? $file->hashName() : $file;
        Storage::delete($this->relativeFilePath($filename));
    }

    public static function extractFiles(array &$attributes = []){
        $files = [];
        foreach (self::$filefields as $file) {
            if (isset($attributes[$file]) && $attributes[$file] instanceof UploadedFile){
                $files[] = $attributes[$file];
                $attributes[$file] = $attributes[$file]->hashName();
            }
        }
        return $files;
    }

    public function getFileUrl($filename){
        return Storage::url($this->relativeFilePath($filename));
    }

    public function relativeFilePath($value) {
        return "{$this->uploadDir()}/{$value}";
    }
}