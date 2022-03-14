<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use Illuminate\Support\Facades\Storage;
use App\Models\Category;
use App\Models\Gender;
use App\Models\Video;
use Illuminate\Http\UploadedFile;
use Tests\Traits\TestValidations;

class VideoControllerUploadsTest extends BaseVideoControllerTestCase
{
    use TestValidations;

    public function testInvalidationTypeAndMaxVideoFile(){
        $data = [
            ['video_file'    => UploadedFile::fake()->create('video.avi', 50000001)],
            ['trailer_file'  => UploadedFile::fake()->create('trailer.avi', 1000001)],
            ['thumb_file'   => UploadedFile::fake()->create('thumb.txt', 5001)],
            ['banner_file'  => UploadedFile::fake()->create('banner.ppt', 10001)]
        ];

        $this->assertInvalidationInStoreAction(
            $data[0] + $data[1],
            'mimetypes', 
            ['values' => 'video/mp4']
        );
        $this->assertInvalidationInUpdateAction(
            $data[0] + $data[1], 
            'mimetypes', 
            ['values' => 'video/mp4']
        );  
        $this->assertInvalidationInStoreAction($data[2] + $data[3], 'image');
        $this->assertInvalidationInUpdateAction($data[2] + $data[3], 'image'); 

        $this->assertInvalidationInStoreAction($data[0], 'max.file', ['max' => 50000000]);
        $this->assertInvalidationInUpdateAction($data[1], 'max.file', ['max' => 1000000]);
        $this->assertInvalidationInStoreAction($data[2], 'max.file', ['max' => 5000]);
        $this->assertInvalidationInUpdateAction($data[3], 'max.file', ['max' => 10000]);     
    }

    public function testStoreWithFiles(){
        Storage::fake();
        $files = $this->getFiles();
        $category = \factory(Category::class)->create();
        $gender = \factory(Gender::class)->create();
        $gender->categories()->sync([$category->id]);

        $response = $this->json(
            'POST',
            $this->routeStore(),
            $this->sendData + [
                'categories_id' => [$category->id],
                'genders_id' => [$gender->id]
            ] +
            $files
            );

        $response->assertStatus(201);
        foreach ($files as $file) {
            \Storage::assertExists("{$response->json('id')}/{$file->hashName()}");
        }
    }

    public function testUpdateWithFiles(){
        Storage::fake();
        $files = $this->getFiles();
        $category = \factory(Category::class)->create();
        $gender = \factory(Gender::class)->create();
        $gender->categories()->sync([$category->id]);

        $response = $this->json(
            'PUT',
            $this->routeUpdate(),
            $this->sendData + [
                'categories_id' => [$category->id],
                'genders_id' => [$gender->id]
            ] +
            $files
            );

        $response->assertStatus(200);
        foreach ($files as $file) {
            \Storage::assertExists("{$response->json('id')}/{$file->hashName()}");
        }
    }

    protected function getFiles(){
        return [
            'video_file' => UploadedFile::fake()->create('video.mp4'),
            'thumb_file' => UploadedFile::fake()->create('thumb.bmp'),
            'banner_file' => UploadedFile::fake()->create('banner.jpg'),
            'trailer_file' => UploadedFile::fake()->create('trailer.mp4')
        ];
    }

    protected function routeStore(){
        return route('videos.store');
    }

    protected function routeUpdate(){
        return route('videos.update', ['video' => $this->video->id]);
    }

    protected function model(){
        return Video::class;
    }
}
