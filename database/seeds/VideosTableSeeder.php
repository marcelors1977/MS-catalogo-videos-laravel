<?php

use App\Models\Gender;
use App\Models\Video;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;

class VideosTableSeeder extends Seeder
{
    private $allGenders;
    private $relations = [
        'genders_id' => [],
        'categories_id' => []
    ];
    
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $dir = Storage::getDriver()->getAdapter()->getPathPrefix();
        File::deleteDirectory($dir, true);

        $self = $this;
        $this->allGenders = Gender::all();
        Model::reguard();

        factory(\App\Models\Video::class,100)
            ->make()
            ->each(function(Video $video) use($self) {
                $self->fecthRelations();
                \App\Models\Video::create(
                    array_merge(
                        $video->toArray(),
                        [
                            'thumb_file' => $self->getImageFile(),
                            'banner_file' => $self->getImageFile(),
                            'trailer_file' => $self->getVideoFile(),
                            'video_file' => $self->getVideoFile(),
                        ],
                        $this->relations
                    )
                    );
            });
            
        Model::unguard();
    }

    public function fecthRelations() {
        $subGenders = $this->allGenders->random(5)->load('categories');
        $categoriesId = [];
        foreach ($subGenders as $gender) {
            array_push($categoriesId, ...$gender->categories->pluck('id')->toArray());
        }
        $categoriesId = array_unique($categoriesId);
        $gendersId = $subGenders->pluck('id')->toArray();
        $this->relations['categories_id'] = $categoriesId;
        $this->relations['genders_id'] = $gendersId;
    }

    public function getImageFile() {
        return new UploadedFile(
            storage_path('faker/thumbs/foto1.jpg'),
            'foto1.jpg'
        );
    }

    public function getVideoFile() {
        return new UploadedFile(
            storage_path('faker/videos/trailer.mp4'),
            'trailer.mp4'
        );
    }
}
