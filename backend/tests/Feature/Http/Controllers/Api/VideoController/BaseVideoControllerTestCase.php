<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\Video;
use App\Models\Category;
use App\Models\Gender;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Illuminate\Foundation\Testing\TestResponse;

abstract class BaseVideoControllerTestCase extends TestCase
{
    use DatabaseMigrations;

    protected $video;
    protected $sendData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = factory(Video::class)->create([
            'thumb_file' => 'thumb.jpg',
            'banner_file' => 'banner.jpg',
            'video_file' => 'video.mp4',
            'trailer_file' => 'trailer.mp4',
        ]);
        $category = \factory(Category::class)->create();
        $gender = \factory(Gender::class)->create();
        $gender->categories()->sync($category->id);
        $this->sendData = [
                    'title' => 'test_video_store',
                    'description' => 'description',
                    'year_launched' => 2010,
                    'rating' => Video::RATING_LIST[0],
                    'duration' => 120,
                    'categories_id' => [$category->id],
                    'genders_id' => [$gender->id]
                ];
    }

    protected function assertIfFilesUrlExists(Video $video, TestResponse $response){
        $fileFields = Video::$filefields;
        $data = $response->json('data');
        $data = array_key_exists(0, $data) ? $data[0] : $data;
        foreach ($fileFields as $field) {
            $file = $video->{$field};
            $this->assertEquals(
                \Storage::url($video->relativeFilePath($file)),
                $data[$field . '_url']
            );
        }
    }
}
