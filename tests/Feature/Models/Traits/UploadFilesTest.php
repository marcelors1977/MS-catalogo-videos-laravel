<?php

namespace Tests\Feature\Models\Traits;

use Tests\TestCase;
use Tests\Stubs\Models\UploadFilesStub;

class UploadFilesTest extends TestCase
{

    private $obj;

    protected function setUp(): void
    {
        parent::setUp();
        $this->obj = new UploadFilesStub();
        UploadFilesStub::makeTable();
    }

    public function testCheckOldFilesOnSaving(){
        $this->obj->fill([
            'name' => 'test',
            'file1' => 'test.mp4',
            'file2' => 'test2.mp4'
        ]);
        $this->obj->save();
        $this->assertCount(0, $this->obj->oldFiles);

        $this->obj->update([
            'name' => 'test_update',
            'file2' => 'test3.mp4'
        ]);
        $this->assertEqualsCanonicalizing(['test2.mp4'], $this->obj->oldFiles);
    }

    public function testCheckNullOldFilesOnSaving(){
        $this->obj->fill(['name' => 'test']);
        $this->obj->save();

        $this->obj->update([
            'name' => 'test_update',
            'file2' => 'test3.mp4'
        ]);
        $this->assertEqualsCanonicalizing([], $this->obj->oldFiles);
    }
}
