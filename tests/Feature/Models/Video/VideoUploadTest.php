<?php

namespace Tests\Feature\Models\Video;

use App\Models\Video;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Exceptions\TestException;
use Illuminate\Database\Events\TransactionCommitted;

class VideoUploadTest extends BaseVideoTestCase
{
    protected $filefieldsArray = [];
    
    protected function setUp(): void
    {
        parent::setUp();
        $this->filefieldsArray = [
            'video_file' => UploadedFile::fake()->create('video.mp4'),
            'thumb_file' => UploadedFile::fake()->create('thumb.jpg'),
            'banner_file' => UploadedFile::fake()->create('banner.jpg'),
            'trailer_file' => UploadedFile::fake()->create('trailer.mp4')
        ];
    }

    public function testCreateVideoWithFiles() 
    {
        Storage::fake();
        $video = Video::create($this->sendData + $this->filefieldsArray);
        $this->isFileExists($video);
    }

    public function testValidationFileUrl() 
    {
        $fileFileds = [];
        foreach (Video::$filefields as $field) {
            $fileFields[$field] = "$field.test";
        }
        $video = \factory(Video::class)->create($fileFields);
        $driver = config('filesystems.default');
        $baseUrl = config('filesystems.disks.' . $driver)['url'];
        foreach (Video::$filefields as $field) {
            $fileUrl = $video->{"{$field}_url"};
            $this->assertEquals("{$baseUrl}/$video->id/{$video->{$field}}",$fileUrl);
        }
    }

    public function testUpdateVideoWithFiles()
    {
        Storage::fake();
        $video = Video::create($this->sendData);
        $this->assertCount(0, Storage::allFiles());

        $video->update($this->sendData + $this->filefieldsArray);
        $this->isFileExists($video);
        $this->assertCount(4, Storage::allFiles());
        
        $oldFileUpdated = $video->video_file;
        $video->update($this->sendData + [
            'video_file' => UploadedFile::fake()->create('video1.mp4')
        ]);
        $this->isFileExists($video);
        Storage::assertMissing("{$video->id}/{$oldFileUpdated}");
        $this->assertCount(4, Storage::allFiles());
    }

    public function testDeleteFileAfterRollbackStore(){
        $hasError = false;
        Storage::fake();
        $video = Video::create($this->sendData);
        \Event::listen(TransactionCommitted::class, function () {
            throw new TestException();
        });
        
        try {
            $video->update($this->sendData + $this->filefieldsArray);          
        } catch (TestException $exception) {
            $this->assertCount(0, Storage::allFiles());
            $hasError = true;
        }
        $this->assertTrue($hasError);
    }

    public function testDeleteFileAfterRollbackUpdate(){
        $hasError = false;
        Storage::fake();
        \Event::listen(TransactionCommitted::class, function () {
            throw new TestException();
        });
        
        try {
            Video::create($this->sendData + $this->filefieldsArray
            );          
        } catch (TestException $exception) {
            $this->assertCount(0, Storage::allFiles());
            $hasError = true;
        }
        $this->assertTrue($hasError);
    }

    protected function isFileExists(Video $video){
        foreach ($this->filefieldsArray as $key => $value) {
            Storage::assertExists("{$video->id}/{$video->$key}");
        }
    }
}
