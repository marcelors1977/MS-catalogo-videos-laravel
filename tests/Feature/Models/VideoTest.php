<?php

namespace Tests\Feature\Models;

use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Ramsey\Uuid\Uuid as UuidUuid;

class VideoTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(Video::class, 1)->create();
        $videos = Video::all();
        $this->assertCount(1, $videos);
        $videoKey = array_keys($videos->first()->getAttributes());
        $this->assertEqualsCanonicalizing(
            [
                'id',
                'title',
                'description',
                'year_launched',
                'opened',
                'rating',
                'duration',
                'created_at',
                'updated_at',
                'deleted_at'
            ],
            $videoKey
        );
    }
    public function testCreate()
    {   
        $data = [
            'title' => 'test_create_video',
            'description' => 'description',
            'year_launched' => '2004',
            'rating'=> 'L',
            'duration' => '30'
        ];

        $video = Video::create($data);
        $video->refresh();

        $this->assertEquals(36,strlen($video->id));
        $this->assertTrue( UuidUuid::isValid($video->id), 'The Uuid '.$video->id.' is not valid');
        foreach($data as $key => $value) {
            $this->assertEquals($value, $video->{$key});
        }
        $this->assertFalse($video->opened);
       
        $video = factory(Video::class)->create([
            'opened' => false,
            'rating' => 'MRS'
        ]);
        $this->assertFalse($video->opened);
        $this->assertNotContains(
            $video->rating,
            Video::RATING_LIST
        );
    }

    public function testUpdate()
    {
        $video = factory(Video::class)->create([
            'title' => 'testUpdate',
            'description' => 'description',
            'opened' => false
        ]);

        $data = [
            'title' => 'test_title_updated',
            'description' => 'test_description_updated',
            'opened' => true
        ];
        $video->update($data);

        foreach($data as $key => $value) {
            $this->assertEquals($value, $video->{$key});
        }
    }

    public function testDelete()
    {
        $video = factory(Video::class, 2)->create();
        $VideoToDelete = $video[0];
        $video[0]->delete();
        $this->assertCount(1, Video::all());
        $this->assertNull(Video::find($video[0]->id));

        $video[0]->restore();
        $this->assertNotNull(Video::find($video[0]->id));
    }
}
