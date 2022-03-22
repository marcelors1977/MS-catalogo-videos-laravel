<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Http\Resources\VideoResource;
use App\Models\Category;
use App\Models\Gender;
use App\Models\Video;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;
use Illuminate\Support\Arr;
use Tests\Traits\TestResources;

class VideoControllerCrudTest extends BaseVideoControllerTestCase
{
    private $serializedFields = [
        'id',
        'title',
        'description',
        'year_launched',
        'opened',
        'rating',
        'duration',
        'video_file_url',
        'thumb_file_url',
        'banner_file_url',
        'trailer_file_url',
        'created_at',
        'updated_at',
        'deleted_at',
        'categories' => [
            '*' => [
                'id',
                'name',
                'description',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at'
            ]
        ],
        'genders' =>  [
            '*' => [
                'id',
                'name',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at'
            ]
        ]
    ];

    use TestValidations, TestSaves, TestResources;

    public function testIndex()
    {
        $response = $this->get(route('videos.index'));

        $response   
            ->assertStatus(200)
            ->assertJson([
                'meta' => ['per_page' => 15]
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => $this->serializedFields
                ],
                'links' => [],
                'meta' => []
            ]);

        $this->assertResource(
            $response, 
            VideoResource::collection(collect([$this->video]))
        ); 

        $this->assertIfFilesUrlExists($this->video, $response);
    }

    public function testShow()
    {
        $response = $this->get(route('videos.show', ['video' => $this->video->id]));

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => $this->serializedFields
            ]);

        $id = $this->getIdFromResponse($response);
        $this->assertResource($response, new VideoResource(Video::find($id)));
        $this->assertIfFilesUrlExists($this->video, $response);
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

    public function testInvalidationCategoriesField(){
        $category = factory(Category::class)->create();
        $category->delete();
        $dataDeleted = [
            'categories_id' => [$category->id]
        ];
        $this->IsInvalidationIfArrayAndExists('categories_id',$dataDeleted);

    }

    public function testInvalidationGendersField(){
        $gender = factory(Gender::class)->create();
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
        $gender = factory(Gender::class)->create();
        
        $data = [  
            'genders_id' => [$gender->id]
        ];

        $this->assertInvalidationInStoreAction($data, 'ExistsRelationsBetween');
        $this->assertInvalidationInUpdateAction($data, 'ExistsRelationsBetween');    
    }

    public function testSaveWithoutFiles(){
        $testData = Arr::except($this->sendData, ['categories_id', 'genders_id']);
      
        $data = [
            [
                'send_data' => $this->sendData + ['opened' => false],
                'test_data' => $testData + ['opened' => false],
            ],
            [
                'send_data' => $this->sendData + [ 'opened' => true],
                'test_data' => $testData +  ['opened' => true],
            ],
            [
                'send_data' => $this->sendData + [ 'rating' => Video::RATING_LIST[1]],
                'test_data' => $testData + ['rating' => Video::RATING_LIST[1]],
            ]
        ];

        foreach ($data as $key => $value) {
            $response = $this->assertStore(
                $value['send_data'], 
                $value['test_data'] + ['deleted_at' => null]
            );
            $response->assertJsonStructure([
                'data' => $this->serializedFields
            ]);
            $id = $this->getIdFromResponse($response);
            $this->assertResource($response, new VideoResource(Video::find($id)));
            $this->assertHasCategory($id, $this->sendData['categories_id']);
            $this->assertHasGender($id, $this->sendData['genders_id']);

            $response = $this->assertUpdate(
                $value['send_data'], 
                $value['test_data'] + ['deleted_at' => null]
            );
            $response->assertJsonStructure([
                'data' => $this->serializedFields
            ]);
            $id = $this->getIdFromResponse($response);
            $this->assertResource($response, new VideoResource(Video::find($id)));
            $this->assertHasCategory($id, $this->sendData['categories_id']);
            $this->assertHasGender($id, $this->sendData['genders_id']);
        }
    }

    public function testDelete()
    {
        $video = factory(Video::class)->create();
 
        $response = $this->json('DELETE',route('videos.destroy', ['video' => $video->id]));
        $response->assertNoContent(204);

        $response = $this->get(route('videos.show', ['video' => $video->id]));
        $response->assertNotFound();
        
        $response = $this->get(route('videos.index'));
        $resource = VideoResource::collection(collect([$this->video]));
        $this->assertResource($response, $resource);

        $this->assertNotNull(Video::withTrashed()->find($this->video->id));
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
