<?php

namespace Tests\Feature\Http\Controllers\Api;

use Illuminate\Support\Facades\Storage;
use App\Models\Category;
use App\Models\Gender;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class VideoControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves;

    private $video;
    private $sendData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = factory(Video::class)->create();
        $this->sendData = [
                    'title' => 'test_video_store',
                    'description' => 'description',
                    'year_launched' => 2010,
                    'rating' => Video::RATING_LIST[0],
                    'duration' => 120
                ];
    }

    public function testIndex()
    {
        $response = $this->get(route('videos.index'));

        $response->assertStatus(200);
        $response->assertJson([$this->video->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('videos.show', ['video' => $this->video->id]));

        $response->assertStatus(200);
        $response->assertJson($this->video->toArray());
    }

    public function testInvalidationRequired(){
        $data = [ 
            'title' => '',
            'description' => '',
            'year_launched' => '',
            'rating' => '',
            'duration' => '',
            'categories_id' => '',
            'genders_id' => '',
        ];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');
    }

    public function testInvalidationMax(){
        $data = [ 
            'title' => str_repeat('a', 256)
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);       

        $data = [ 
            'video_file' => str_repeat('a', 1001)
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 1000]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 1000]);    
    }

    public function testInvalidationInteger(){
        $data = [ 
            'duration' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'integer');
        $this->assertInvalidationInUpdateAction($data, 'integer');       
    }

    public function testInvalidationYearLaunchedField(){
        $data = [ 
            'year_launched' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'date_format', ['format' => 'Y']);
        $this->assertInvalidationInUpdateAction($data, 'date_format', ['format' => 'Y']);       
    }

    public function testInvalidationOpenedField(){
        $data = [ 
            'opened' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');      
    }

    public function testInvalidationRatingField(){
        $data = [ 
            'rating' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'in');
        $this->assertInvalidationInUpdateAction($data, 'in');      
    }

    public function testInvalidationTypeOfVideoFile(){
        $data = [ 
            'video_file' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'mimetypes', ['values' => 'video/mp4']);
        $this->assertInvalidationInUpdateAction($data, 'mimetypes', ['values' => 'video/mp4']);      
    }

    public function testInvalidationCategoriesField(){
        $category = \factory(Category::class)->create();
        $category->delete();
        $dataDeleted = [
            'categories_id' => [$category->id]
        ];
        $this->IsInvalidationIfArrayAndExists('categories_id',$dataDeleted);

    }

    public function testInvalidationGendersField(){
        $gender = \factory(Gender::class)->create();
        $gender->delete();
        $dataDeleted = [
            'genders_id' => [$gender->id]
        ];
        $this->IsInvalidationIfArrayAndExists('genders_id', $dataDeleted);
    }

    public function IsInvalidationIfArrayAndExists(string $dataField, array $dataDeleted){
        $data = [ $dataField => 'a'];

        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');    
        
        $data = [ $dataField => [100] ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists'); 

        $this->assertInvalidationInStoreAction($dataDeleted, 'exists');
        $this->assertInvalidationInUpdateAction($dataDeleted, 'exists'); 
    }

    public function testInvalidationExistsRelationsBetween(){
        $gender = \factory(Gender::class)->create();
        
        $data = [  
            'genders_id' => [$gender->id]
        ];

        $this->assertInvalidationInStoreAction($data, 'ExistsRelationsBetween');
        $this->assertInvalidationInUpdateAction($data, 'ExistsRelationsBetween');    
    }

    public function testSave(){
        $categoryIds = \factory(Category::class,3)->create()->pluck('id');
        $gender = \factory(Gender::class,2)->create();
        $genderIds = [$gender[0]->id, $gender[1]->id];
        $gender[0]->categories()->sync($categoryIds[0]);   
        $gender[1]->categories()->sync([$categoryIds[1], $categoryIds[2]]);
        Storage::fake();
        $file = UploadedFile::fake()->create('video',10,'video/mp4');

        $data = [
            [
                'send_data' => $this->sendData + [
                                    'opened' => false, 
                                    'categories_id' => $categoryIds, 
                                    'genders_id' => $genderIds,
                                    'video_file' => $file
                                ],
                'test_data' => $this->sendData + ['opened' => false],
            ],
            [
                'send_data' => $this->sendData + [
                                    'opened' => true, 
                                    'categories_id' => $categoryIds, 
                                    'genders_id' => $genderIds,
                                    'video_file' => $file
                                ],
                'test_data' => $this->sendData + ['opened' => true],
            ],
            [
                'send_data' => $this->sendData + [
                                    'rating' => Video::RATING_LIST[1], 
                                    'categories_id' => $categoryIds, 
                                    'genders_id' => $genderIds,
                                    'video_file' => $file
                                ],
                'test_data' => $this->sendData + ['rating' => Video::RATING_LIST[1]],
            ]
        ];

        foreach ($data as $key => $value) {
            $response = $this->assertStore(
                $value['send_data'], 
                $value['test_data'] + ['deleted_at' => null]
            );
            $response->assertJsonStructure([
                'created_at', 'updated_at'
            ]);
            $this->assertHasCategory($response->json('id'), $categoryIds);
            $this->assertHasGender($response->json('id'), $genderIds);
            Storage::assertExists("{$response->json('id')}/{$file->hashName()}");

            $response = $this->assertUpdate(
                $value['send_data'], 
                $value['test_data'] + ['deleted_at' => null]
            );
            $response->assertJsonStructure([
                'created_at', 'updated_at'
            ]);
            $this->assertHasCategory($response->json('id'), $categoryIds);
            $this->assertHasGender($response->json('id'), $genderIds);
        }
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

    public function testDelete()
    {
        $video = factory(Video::class)->create();
 
        $response = $this->json('DELETE',route('videos.destroy', ['video' => $video->id]));
        $response->assertNoContent(204);

        $response = $this->get(route('videos.show', ['video' => $video->id]));
        $response->assertNotFound();
        
        $response = $this->get(route('videos.index'));
        $response->assertJson([$this->video->toArray()]);

        $this->assertNotNull(Video::withTrashed()->find($this->video->id));
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
