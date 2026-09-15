<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleLog extends Model
{
    protected $table = 'vehicle_logs';

    public $timestamps = false;

    protected $guarded = ['id'];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }
}

