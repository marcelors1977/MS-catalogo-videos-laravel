<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class VideoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return parent::toArray($request) + [
            'video_file' => $this->video_file_url,
            'thumb_file' => $this->thumb_file_url,
            'banner_file' => $this->banner_file_url,
            'trailer_file' => $this->trailer_file_url,
            'categories' => CategoryResource::collection($this->categories),
            'genders' => GenderResource::collection($this->genders)
        ];;
    }
}
