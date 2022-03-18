<?php

namespace Tests\Unit\Models;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tests\Stubs\Models\UploadFilesStub;

class UploadFilesUnitTest extends TestCase
{

    private $obj;

    protected function setUp(): void
    {
        parent::setUp();
        $this->obj = new UploadFilesStub();
    }

    public function testUploadFile(){
        Storage::fake();
        $file = UploadedFile::fake()->create('video.mp4');
        $this->obj->uploadFile($file);
        Storage::assertExists($this->obj->relativeFilePath($file->hashName()));
    }

    public function testUploadFiles(){
        Storage::fake();
        $file1 = UploadedFile::fake()->create('video1.mp4');
        $file2 = UploadedFile::fake()->create('video2.mp4');
        $this->obj->uploadFiles([$file1,$file2]);
        Storage::assertExists($this->obj->relativeFilePath($file1->hashName()));
        Storage::assertExists($this->obj->relativeFilePath($file2->hashName()));
    }

    public function testDeleteFile(){
        Storage::fake();
        $file = UploadedFile::fake()->create('video.mp4');
        $this->obj->uploadFile($file);
        $filename = $file->hashName();
        $this->obj->deleteFile($filename);
        Storage::assertMissing($this->obj->relativeFilePath($filename));
    
        $file = UploadedFile::fake()->create('video.mp4');
        $this->obj->uploadFile($file);
        $this->obj->deleteFile($file);
        Storage::assertMissing($this->obj->relativeFilePath($file->hashName()));
    }
    
    public function testDeleteFiles(){
        Storage::fake();
        $file1 = UploadedFile::fake()->create('video1.mp4');
        $file2 = UploadedFile::fake()->create('video2.mp4');
        $this->obj->uploadFiles([$file1,$file2]);
        $this->obj->deleteFiles([$file1->hashName(), $file2]);
        Storage::assertMissing($this->obj->relativeFilePath($file1->hashName()));
        Storage::assertMissing($this->obj->relativeFilePath($file2->hashName()));
    }

    public function testDeleteOldFile(){
        Storage::fake();
        $file1 = UploadedFile::fake()->create('video1.mp4')->size(1);
        $file2 = UploadedFile::fake()->create('video2.mp4')->size(1);
        $this->obj->uploadFiles([$file1,$file2]);
        $this->obj->deleteOldFiles();
        $this->assertcount(2,Storage::allFiles());

        $this->obj->oldFiles = [$file1->hashName()];
        $this->obj->deleteOldFiles();
        Storage::assertMissing($this->obj->relativeFilePath($file1->hashName()));
        Storage::assertExists($this->obj->relativeFilePath($file2->hashName()));
    }

    public function testExtractFiles(){
        $attributes = [];
        $files = UploadFilesStub::extractFiles($attributes);
        $this->assertCount(0, $attributes);
        $this->assertCount(0, $files);

        $attributes = ['file1' => 'test'];
        $files = UploadFilesStub::extractFiles($attributes);
        $this->assertCount(1, $attributes);
        $this->assertEquals(['file1' => 'test'], $attributes);
        $this->assertCount(0, $files);

        $attributes = ['file1' => 'test', 'file2' => 'test2'];
        $files = UploadFilesStub::extractFiles($attributes);
        $this->assertCount(2, $attributes);
        $this->assertEquals(['file1' => 'test', 'file2' => 'test2'], $attributes);
        $this->assertCount(0, $files);

        $file1 = UploadedFile::fake()->create('video01.mp4');
        $attributes = ['file1' => $file1, 'file2' => 'test2'];
        $files = UploadFilesStub::extractFiles($attributes);
        $this->assertCount(2, $attributes);
        $this->assertEquals(['file1' => $file1->hashName(), 'file2' => 'test2'], $attributes);
        $this->assertEquals([$file1], $files);

        $file2 = UploadedFile::fake()->create('video02.mp4');
        $attributes = ['file1' => $file1, 'file2' => $file2, 'other' => 'test'];
        $files = UploadFilesStub::extractFiles($attributes);
        $this->assertCount(3, $attributes);
        $this->assertEquals([
                'file1' => $file1->hashName(),
                'file2' => $file2->hashName(), 
                'other' => 'test'
            ], 
            $attributes
        );
        $this->assertEquals([$file1, $file2], $files);
    }

    public function testGetFileUrl(){
        $this->assertEquals('http://localhost:8000/storage/videos/1/', $this->obj->getFileUrl(null));
        $this->assertEquals('http://localhost:8000/storage/videos/1/video.mp4', $this->obj->getFileUrl('video.mp4'));
    }  
}
