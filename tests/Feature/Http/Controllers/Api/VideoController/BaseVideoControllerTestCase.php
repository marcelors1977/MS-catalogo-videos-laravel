<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\Video;
use App\Models\Category;
use App\Models\Gender;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

abstract class BaseVideoControllerTestCase extends TestCase
{
    use DatabaseMigrations;

    protected $video;
    protected $sendData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = factory(Video::class)->create();
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
}
