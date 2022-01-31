<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gender;
use Illuminate\Http\Request;

class GenderController extends Controller
{
    private $rules = [
        'name' => 'required|max:255',
        'is_active' => 'boolean'
    ];

    public function index()
    {
        return \App\Models\Gender::all();
    }

    public function store(Request $request)
    {
        $this->validate($request,$this->rules);
        $gender = Gender::create($request->all());
        $gender->refresh();
        return $gender;
    }

    public function show(Gender $gender)
    {
        return $gender;
    }

    public function update(Request $request, Gender $gender)
    {
        $this->validate($request, $this->rules );
        $gender->update($request->all());
        return $gender;
    }

    public function destroy(Gender $gender)
    {
        $gender->delete();
        return \response()->noContent();
    }
}
