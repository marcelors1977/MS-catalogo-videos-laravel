<?php

namespace Tests\Unit\Models;

use App\Models\Video;
use PHPUnit\Framework\TestCase;
use App\Models\Traits\Uuid;
use App\Models\Traits\UploadFiles;
use Illuminate\Database\Eloquent\SoftDeletes;

class VideoUnitTest extends TestCase
{
    private $video;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = new Video();
    }

    public function testFillableAttribute()
    {
        $fillable = [
            'title',
            'description', 
            'year_launched', 
            'opened', 
            'rating', 
            'duration', 
            'video_file', 
            'thumb_file',
            'banner_file',
            'trailer_file'
        ];
        $this->assertEquals($fillable, $this->video->getFillable());
    }

    public function testConstRatingList()
    {
        $rating_list = [
            'L',
            '10', 
            '12', 
            '14', 
            '16', 
            '18'
        ];
        $this->assertEquals($rating_list, Video::RATING_LIST);
    }

    public function testConstFilesSize()
    {
        $this->assertEquals(Video::THUMB_FILE_MAX_SIZE, 1024 * 5);
        $this->assertEquals(Video::BANNER_FILE_MAX_SIZE, 1024 * 10);
        $this->assertEquals(Video::TRAILER_FILE_MAX_SIZE, 1024 * 1024 * 1);
        $this->assertEquals(Video::VIDEO_FILE_MAX_SIZE, 1024 * 1024 * 50);
    }

    public function testFileFields(){
        $filefields = [
            'video_file', 
            'thumb_file', 
            'banner_file', 
            'trailer_file'
        ];
        
        $this->assertEquals($filefields, Video::$filefields);
    }
    
    public function testIfUseTraits()
    {
        $traits = [ SoftDeletes::class, Uuid::class, UploadFiles::class ];
        $videoTraits = array_keys(class_uses(Video::class));
        $this->assertEquals($traits, $videoTraits);
    }
 
    public function testCasts()
    {
        $casts = [ 
            'id'  => 'string', 
            'opened' => 'boolean', 
            'year_lauched' => 'integer', 
            'duration' => 'integer'   
        ];
        $this->assertEquals($casts, $this->video->getCasts());
    }

    public function testIncremeting()
    {
        $this->assertFalse( $this->video->incrementing);
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at','created_at','updated_at'];
        foreach ($dates as $date){
            $this->assertContains($date,$this->video->getDates() );
        }
        $this->assertCount(count($dates), $this->video->getDates());
    }
}
