<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $table = 'vehicles';

    protected $guarded = ['id'];

    public function employees()
    {
        return $this->hasMany(Employee::class, 'vehicle_id');
    }

    public function logs()
    {
        return $this->hasMany(VehicleLog::class, 'vehicle_id');
    }
}

