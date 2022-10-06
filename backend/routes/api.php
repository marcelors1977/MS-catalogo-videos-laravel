<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

// categories pois Laravel traduz para  o Model Category
Route::group(['namespace' =>  'Api'], function(){
    $exceptCreateAndEdit = [
        'except' => ['create','edit']
    ];
    Route::resource('categories', 'CategoryController', $exceptCreateAndEdit );
    Route::delete('categories', 'CategoryController@destroyCollection');
    Route::resource('genders', 'GenderController', $exceptCreateAndEdit );
    Route::delete('genders', 'GenderController@destroyCollection');
    Route::resource('cast_members', 'CastMemberController', $exceptCreateAndEdit );
    Route::delete('cast_members', 'CastMemberController@destroyCollection');
    Route::resource('videos', 'VideoController', $exceptCreateAndEdit );
    Route::delete('videos', 'VideoController@destroyCollection');
});