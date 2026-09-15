<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comcase extends Model
{
    protected $table = 'comcases';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $guarded = [];
}

