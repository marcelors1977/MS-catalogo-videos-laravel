<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\VideoResource;
use App\Models\Gender;
use App\Models\Video;
use illuminate\Http\Request;
use App\Rules\ExistsRelationsBetween;


class VideoController extends BasicCrudController
{
    private $rules;

    public function __construct()
    {
        $this->rules = [
            'title' => 'required|max:255',
            'description' => 'required',
            'year_launched' => 'required|date_format:Y',
            'opened' => 'boolean',
            'rating' => 'required|in:' . \join(',', Video::RATING_LIST),
            'duration' => 'required|integer',
            'video_file' => 'mimetypes:video/mp4|max:' . Video::VIDEO_FILE_MAX_SIZE,
            'thumb_file' => 'image|max:' . Video::THUMB_FILE_MAX_SIZE,
            'banner_file' => 'image|max:' . Video::BANNER_FILE_MAX_SIZE,
            'trailer_file' => 'mimetypes:video/mp4|max:' . Video::TRAILER_FILE_MAX_SIZE,
            'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL',
            'genders_id' => [
                'required',
                'array',
                'exists:genders,id,deleted_at,NULL'
            ]
        ];
    }

    public function store(Request $request)
    {
        $this->addExtraRule($request->categories_id);
        $validatedDate = $this->validate($request, $this->rulesStore());
        $obj = $this->model()::create($validatedDate);
        $obj->refresh();
        $resource = $this->resource();
        return new $resource($obj);
    }

    public function update(Request $request, $id)
    {
        $this->addExtraRule($request->categories_id);
        $obj = $this->findOrFail($id);
        $validatedDate = $this->validate($request, $this->rulesUpdate());
        $obj->update($validatedDate);
        $resource = $this->resource();
        return new $resource($obj);
    }

    protected function model()
    {
        return Video::class;
    }

    protected function addExtraRule($request_categories_id)
    {
        $this->rules['genders_id'][] = new ExistsRelationsBetween($request_categories_id, Gender::class, 'categories');
    }

    protected function rulesStore()
    {
        return $this->rules;   
    }

    protected function rulesUpdate()
    {
        return $this->rules;
    }

    protected function  resourceCollection()
    {
        return $this->resource();
    }

    protected function  resource()
    {
        return VideoResource::class;   
    }
}
