<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use Illuminate\Support\Facades\Storage;
use App\Models\Video;
use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Http\UploadedFile;
use Tests\Traits\TestValidations;
use Illuminate\Support\Arr;
use Tests\Traits\TestSaves;

class VideoControllerUploadsTest extends BaseVideoControllerTestCase
{
    use TestValidations, TestSaves;

    public function testInvalidationTypeAndMaxVideoFile(){
        $data = [
            ['video_file'    => UploadedFile::fake()->create('video.avi', Video::VIDEO_FILE_MAX_SIZE + 1)],
            ['trailer_file'  => UploadedFile::fake()->create('trailer.avi', Video::TRAILER_FILE_MAX_SIZE + 1)],
            ['thumb_file'   => UploadedFile::fake()->create('thumb.txt', Video::THUMB_FILE_MAX_SIZE + 1)],
            ['banner_file'  => UploadedFile::fake()->create('banner.ppt', Video::BANNER_FILE_MAX_SIZE + 1)]
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

        $this->assertInvalidationInStoreAction($data[0], 'max.file', ['max' => Video::VIDEO_FILE_MAX_SIZE]);
        $this->assertInvalidationInUpdateAction($data[1], 'max.file', ['max' =>  Video::TRAILER_FILE_MAX_SIZE]);
        $this->assertInvalidationInStoreAction($data[2], 'max.file', ['max' => Video::THUMB_FILE_MAX_SIZE]);
        $this->assertInvalidationInUpdateAction($data[3], 'max.file', ['max' => Video::BANNER_FILE_MAX_SIZE]);     
    }

    public function testStoreWithFiles(){
        Storage::fake();
        $files = $this->getFiles();
        $response = $this->json('POST', $this->routeStore(), $this->sendData + $files);

        $response->assertStatus(201);
        $this->assertFilesExistsInStorage($response, $files);
        $this->assertIfFilesUrlExists(
            Video::find($this->getIdFromResponse($response)), 
            $response
        );
    }

    public function testUpdateWithFiles(){
        Storage::fake();
        $files = $this->getFiles();
        $response = $this->json('PUT', $this->routeUpdate(), $this->sendData + $files);

        $response->assertStatus(200);
        $this->assertFilesExistsInStorage($response, $files);
        $this->assertIfFilesUrlExists(
            Video::find($this->getIdFromResponse($response)), 
            $response
        );

        $newFiles = [
            'thumb_file' => UploadedFile::fake()->create("thumb_file.jpg"),
            'video_file' => UploadedFile::fake()->create("video_file.mp4"),
        ];

        $response = $this->json('PUT', $this->routeUpdate(), $this->sendData + $newFiles);

        $response->assertStatus(200);
        $this->assertFilesExistsInStorage(
            $response,
            Arr::except($files,['thumb_file','video_file']) + $newFiles
        );

        $video = Video::find($this->getIdFromResponse($response));
        Storage::assertMissing($video->relativeFilePath($files['thumb_file']->hashName()));
        Storage::assertMissing($video->relativeFilePath($files['video_file']->hashName()));
    }

    protected function assertFilesExistsInStorage(TestResponse $response, $files) {
        $video = Video::find($this->getIdFromResponse($response));
        foreach ($files as $file) {
            Storage::assertExists($video->relativeFilePath($file->hashName()));
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
