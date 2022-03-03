<?php

namespace App\Http\Controllers\Api;

use App\Models\Gender;
use App\Models\Video;
use illuminate\Http\Request;
use App\Rules\ExistsRelationsBetween;


class VideoController extends BasicCrudController
{
    private $rules;
    private $request_categories_id;

    public function __construct()
    {
        $this->rules = [
            'title' => 'required|max:255',
            'description' => 'required',
            'year_launched' => 'required|date_format:Y',
            'opened' => 'boolean',
            'rating' => 'required|in:' . \join(',', Video::RATING_LIST),
            'duration' => 'required|integer',
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
        $self = $this;
        $obj = \DB::transaction(function () use ($request, $validatedDate, $self) {
            $obj = $this->model()::create($validatedDate);
            $self->handleRelations($obj, $request);
            return $obj;
        });

        $obj->refresh();
        return $obj;
    }

    public function update(Request $request, $id)
    {
        $this->addExtraRule($request->categories_id);
        $obj = $this->findOrFail($id);
        $validatedDate = $this->validate($request, $this->rulesUpdate());
        $self = $this;
        $obj = \DB::transaction(function () use ($request, $validatedDate, $self, $obj) {
            $obj->update($validatedDate);
            $self->handleRelations($obj, $request);
            return $obj;
        });
        return $obj;
    }

    protected function handleRelations($video, Request $request)
    {
        $video->categories()->sync($request->get('categories_id'));
        $video->genders()->sync($request->get('genders_id'));
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
}
