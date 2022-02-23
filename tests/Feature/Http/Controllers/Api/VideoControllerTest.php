<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\VideoController;
use App\Models\Category;
use App\Models\Gender;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;
use illuminate\Http\Request;
use Tests\Exceptions\TestException;

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
        $this->IsInvalidationIfArrayAndExists('categories_id');
    }

    public function testInvalidationGendersField(){
        $this->IsInvalidationIfArrayAndExists('genders_id');
    }

    public function IsInvalidationIfArrayAndExists(string $dataField){
        $data = [ $dataField => 'a'];

        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');    
        
        $data = [ $dataField => [100] ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists'); 
    }

    public function testInvalidationExistsRelationsBetween(){
        $gender = \factory(Gender::class)->create();
        
        $data = [  
            'genders_id' => [$gender->id]
        ];

        $this->assertInvalidationInStoreAction($data, 'ExistsRelationsBetween');
        $this->assertInvalidationInUpdateAction($data, 'ExistsRelationsBetween');    
    }

    public function testRollbackStore(){
        $this->generalRollback('rulesStore');
    }

    public function testRollbackUpdate(){
        $this->generalRollback('rulesUpdate');
    }

    public function generalRollback($rules){
        $controller = \Mockery::mock(VideoController::class)
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();
        
        $controller
            ->shouldReceive('validate')
            ->withAnyArgs()
            ->andReturn($this->sendData + ['categories_id' => [], 'genders_id' => []] );

        $controller
            ->shouldReceive($rules)
            ->withAnyArgs()
            ->andReturn([]);
  
        $controller
            ->shouldReceive('handleRelations')
            ->once()
            ->andThrow(new TestException());

        $request = \Mockery::mock(Request::class);
        $request->categories_id = [];

        try {
            if( $rules === 'rulesUpdate' ){
                $controller->update($request, $this->video->id);
            } else {
                $controller->store($request);
            }
            
        } catch (TestException $exception) {
            if( $rules === 'rulesUpdate' ){
                $this->assertNotEquals($this->sendData['duration'],Video::find($this->video->id)->toArray()['duration'] );
            } else {
                $this->assertCount(1, Video::all());
            }  
        }
    }

    public function testSave(){
        $category = \factory(Category::class,2)->create();
        $gender = \factory(Gender::class)->create();
        \DB::insert(
            'insert into category_gender (category_id, gender_id) values (?, ?)', 
            [$category[0]->id, $gender->id]
        );
        \DB::insert(
            'insert into category_gender (category_id, gender_id) values (?, ?)', 
            [$category[1]->id, $gender->id]
        );

        $data = [
            [
                'send_data' => $this->sendData + [
                                    'opened' => false, 
                                    'categories_id' => [$category[0]->id, $category[1]->id], 
                                    'genders_id' => [$gender->id]
                                ],
                'test_data' => $this->sendData + ['opened' => false],
            ],
            [
                'send_data' => $this->sendData + [
                                    'opened' => true, 
                                    'categories_id' => [$category[0]->id, $category[1]->id], 
                                    'genders_id' => [$gender->id]
                                ],
                'test_data' => $this->sendData + ['opened' => true],
            ],
            [
                'send_data' => $this->sendData + [
                                    'rating' => Video::RATING_LIST[1], 
                                    'categories_id' => [$category[0]->id, $category[1]->id], 
                                    'genders_id' => [$gender->id]
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

            $response = $this->assertUpdate(
                $value['send_data'], 
                $value['test_data'] + ['deleted_at' => null]
            );
            $response->assertJsonStructure([
                'created_at', 'updated_at'
            ]);
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
