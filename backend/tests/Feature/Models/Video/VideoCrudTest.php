<?php

namespace Tests\Feature\Models\Video;

use App\Models\Category;
use App\Models\Gender;
use App\Models\Video;
use Illuminate\Database\QueryException;
use Ramsey\Uuid\Uuid as UuidUuid;

class VideoCrudTest extends BaseVideoTestCase
{
    private $filefields = [];

    protected function setUp(): void
    {
        parent::setUp();
        foreach (Video::$filefields as $field) {
            $this->filefields[$field] = "{$field}.test";
        }
    }
    
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
                'video_file',
                'thumb_file',
                'banner_file',
                'trailer_file',
                'created_at',
                'updated_at',
                'deleted_at'
            ],
            $videoKey
        );
    }

    public function testCreate()
    {   
        $video = Video::create($this->sendData + $this->filefields);
        $video->refresh();

        $this->assertEquals(36,strlen($video->id));
        $this->assertTrue( UuidUuid::isValid($video->id), 'The Uuid '.$video->id.' is not valid');
        $this->assertDatabaseHas(
            'videos', 
            $this->sendData + $this->filefields + ['opened' => false]
        );
        $this->assertFalse($video->opened);
       
        $video = Video::create($this->sendData + ['opened' => true]);
        $this->assertTrue($video->opened);
        $this->assertDatabaseHas('videos', ['opened' => true]);
    }

    public function testCreateWithRelations()
    {   
        $category = \factory(Category::class)->create();
        $gender = \factory(Gender::class)->create();

        $video = Video::create($this->sendData + [
            'categories_id' => [$category->id],
            'genders_id' => [$gender->id]
        ]);

        $this->assertHasCategory($video->id, $category->id);
        $this->assertHasGender($video->id, $gender->id);
    }

    public function testRollbackStore(){
        $hasError = false;
        try {
            Video::create([$this->sendData + 
                [
                    'categories_id' => [0,1,2],
                    'genders_id' => [1]
                ]
            ]);          
        } catch (QueryException $exception) {
            $this->assertCount(0,Video::all());
            $hasError = true;
        }
        $this->assertTrue($hasError);
    }
    
    public function testUpdate()
    {
        $video = factory(Video::class)->create(['opened' => false]);
        $video->update($this->sendData + $this->filefields);
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas(
            'videos', 
            $this->sendData + $this->filefields + ['opened' => false]
        );

        $video = factory(Video::class)->create(['opened' => false]);
        $video->update($this->sendData + ['opened' => true]);
        $this->assertTrue($video->opened);
        $this->assertDatabaseHas('videos', $this->sendData + ['opened' => true]);
    }

    public function testUpdateWithRelations()
    {
        $category = \factory(Category::class)->create();
        $gender = \factory(Gender::class)->create();
        $video = factory(Video::class)->create();
        $video->update($this->sendData + [
            'opened' => false,
            'categories_id' => [$category->id],
            'genders_id' => [$gender->id]
        ]);
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas('videos', $this->sendData + ['opened' => false]);

        $this->assertHasCategory($video->id, $category->id);
        $this->assertHasGender($video->id, $gender->id);
    }

    public function testRollbackUpdate(){
        $video = \factory(Video::class)->create();
        $oldtitle = $video->title;
        $hasError = false;
        try {
            $video->update([ 
                'categories_id' => [0,1,2],
                'genders_id' => [1]
            ]); 
        } catch (QueryException $exception) {
            $this->assertDatabaseHas('videos', [
                'title' => $oldtitle
            ]);
            $hasError = true;
        }
        $this->assertTrue($hasError);
    }

    public function testDelete()
    {
        $video = factory(Video::class, 2)->create();
        $video[0]->delete();
        $this->assertCount(1, Video::all());
        $this->assertNull(Video::find($video[0]->id));

        $video[0]->restore();
        $this->assertNotNull(Video::find($video[0]->id));
    }

    public function testHandleRelations(){
        $video = \factory(Video::class)->create();
        Video::handleRelations($video,[]);
        $this->assertCount(0, $video->categories);
        $this->assertCount(0, $video->genders);

        $category = \factory(Category::class)->create();
        Video::handleRelations($video, [
            'categories_id' => [$category->id]
        ]);
        $video->refresh();
        $this->assertCount(1, $video->categories);
        
        $gender = \factory(Gender::class)->create();
        Video::handleRelations($video, [
            'genders_id' => [$gender->id]
        ]);
        $video->refresh();
        $this->assertCount(1, $video->genders);

        $video->categories()->delete();
        $video->genders()->delete();

        Video::handleRelations($video, [
            'categories_id' => [$category->id],
            'genders_id' => [$gender->id]
        ]);
        $video->refresh();
        $this->assertCount(1, $video->categories);
        $this->assertCount(1, $video->genders);
    }

    public function testSyncCategories(){
        $categoryId = \factory(Category::class,3)->create()->pluck('id')->toArray();
        $video = \factory(Video::class)->create();
        Video::handleRelations($video, [
            'categories_id' => [$categoryId[0]]
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoryId[0],
            'video_id' => $video->id
        ]);

        Video::handleRelations($video, [
            'categories_id' => [$categoryId[1], $categoryId[2]]
        ]);
        $this->assertDatabaseMissing('category_video', [
            'category_id' => $categoryId[0],
            'video_id' => $video->id
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoryId[1],
            'video_id' => $video->id
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoryId[2],
            'video_id' => $video->id
        ]);
    }

    public function testSyncGenders(){
        $gendersId = \factory(Gender::class,3)->create()->pluck('id')->toArray();
        $video = \factory(Video::class)->create();
        Video::handleRelations($video, [
            'genders_id' => [$gendersId[0]]
        ]);
        $this->assertDatabaseHas('gender_video', [
            'gender_id' => $gendersId[0],
            'video_id' => $video->id
        ]);

        Video::handleRelations($video, [
            'genders_id' => [$gendersId[1], $gendersId[2]]
        ]);
        $this->assertDatabaseMissing('gender_video', [
            'gender_id' => $gendersId[0],
            'video_id' => $video->id
        ]);
        $this->assertDatabaseHas('gender_video', [
            'gender_id' => $gendersId[1],
            'video_id' => $video->id
        ]);
        $this->assertDatabaseHas('gender_video', [
            'gender_id' => $gendersId[2],
            'video_id' => $video->id
        ]);
    }

    protected function assertHasCategory($videoId, $categoryId){
        $this->assertDatabaseHas('category_video', [
            'video_id' => $videoId,
            'category_id' => $categoryId
        ]);
    }

    protected function assertHasGender($videoId, $genderId){
        $this->assertDatabaseHas('gender_video', [
            'video_id' => $videoId,
            'gender_id' => $genderId
        ]);
    }
}
