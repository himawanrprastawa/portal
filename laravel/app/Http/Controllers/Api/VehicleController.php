<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleLog;
use App\Models\Employee;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    private function jsonResponse(bool $success, string $message, $data = null, int $statusCode = 200)
    {
        return response()->json([
            'success' => $success,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    private function formatVehicle($v)
    {
        $veh = $v->toArray();
        $veh['plateNumber'] = $veh['plate_number'] ?? '';
        $veh['driverName'] = $veh['driver_name'] ?? '';
        $veh['driverWhatsapp'] = $veh['driver_whatsapp'] ?? '';
        $veh['teamType'] = $veh['team_type'] ?? 'Internal';
        $veh['docBeritaAcara'] = $veh['doc_berita_acara'] ?? '';
        $veh['barcodeBbm'] = $veh['barcode_bbm'] ?? '';
        $veh['barcodeId'] = $veh['barcode'] ?? '';
        $veh['barcodeImage'] = $veh['barcode_bbm'] ?? '';
        $veh['barcode_image'] = $veh['barcode_bbm'] ?? '';
        return $veh;
    }

    public function index(Request $request)
    {
        $id = $request->query('id');
        if ($id) {
            $vehicle = Vehicle::find($id);
            if (!$vehicle) {
                return $this->jsonResponse(false, 'Armada mobil tidak ditemukan.', null, 404);
            }
            return $this->jsonResponse(true, 'Data armada mobil berhasil dimuat.', $this->formatVehicle($vehicle));
        }

        $vehicles = Vehicle::orderBy('id', 'asc')->get();
        $formatted = $vehicles->map(fn($v) => $this->formatVehicle($v));

        return $this->jsonResponse(true, 'Daftar armada mobil berhasil dimuat.', $formatted);
    }

    public function getLogs(Request $request)
    {
        $vehicleId = $request->query('vehicle_id');
        $plateNumber = $request->query('plate_number');

        $query = VehicleLog::orderBy('id', 'desc');
        if ($vehicleId) {
            $query->where('vehicle_id', $vehicleId);
        } elseif ($plateNumber) {
            $query->where('plate_number', $plateNumber);
        }

        $logs = $query->get();
        return $this->jsonResponse(true, 'Log riwayat penggunaan kendaraan berhasil dimuat.', $logs);
    }

    public function addLog(Request $request)
    {
        $plateNumber = trim($request->input('plate_number', ''));
        $driverName = trim($request->input('driver_name', ''));

        if (empty($plateNumber) || empty($driverName)) {
            return $this->jsonResponse(false, 'Nomor polisi dan nama driver wajib diisi.', null, 400);
        }

        $log = VehicleLog::create([
            'vehicle_id' => (int)$request->input('vehicle_id', 0),
            'plate_number' => $plateNumber,
            'driver_name' => $driverName,
            'driver_whatsapp' => $request->input('driver_whatsapp', '-'),
            'action' => $request->input('action', 'Penugasan Unit'),
            'start_date' => $request->input('start_date', now()),
            'end_date' => $request->input('end_date'),
            'notes' => $request->input('notes', ''),
        ]);

        return $this->jsonResponse(true, 'Log riwayat penggunaan kendaraan berhasil dicatat.', $log, 201);
    }

    public function create(Request $request)
    {
        $plateNumber = strtoupper(trim($request->input('plate_number', $request->input('plateNumber', ''))));
        if (empty($plateNumber)) {
            return $this->jsonResponse(false, 'Nomor polisi (plat nomor) wajib diisi.', null, 400);
        }

        $barcode = trim($request->input('barcode', ''));
        if (empty($barcode)) {
            $barcode = 'BAR-' . strtoupper(str_replace(' ', '', $plateNumber));
        }

        $vehicle = Vehicle::create([
            'barcode' => $barcode,
            'barcode_bbm' => $request->input('barcode_bbm', $request->input('barcodeImage')),
            'plate_number' => $plateNumber,
            'model' => $request->input('model', 'Toyota Avanza'),
            'vendor' => $request->input('vendor', 'BSM Internal'),
            'driver_name' => $request->input('driver_name', $request->input('driverName')),
            'driver_whatsapp' => $request->input('driver_whatsapp', $request->input('driverWhatsapp', '-')),
            'team_type' => $request->input('team_type', $request->input('teamType', 'Internal')),
            'tool_spare_tire' => (int)$request->input('tool_spare_tire', 1),
            'tool_jack' => (int)$request->input('tool_jack', 1),
            'tool_wrench' => (int)$request->input('tool_wrench', 1),
            'tool_first_aid' => (int)$request->input('tool_first_aid', 1),
            'doc_berita_acara' => $request->input('doc_berita_acara', $request->input('docBeritaAcara')),
            'status' => $request->input('status', 'Tersedia'),
        ]);

        return $this->jsonResponse(true, 'Unit armada baru berhasil didaftarkan.', $this->formatVehicle($vehicle), 201);
    }

    public function update(Request $request)
    {
        $id = $request->input('id');
        $vehicle = Vehicle::find($id);
        if (!$vehicle) {
            return $this->jsonResponse(false, 'Armada mobil tidak ditemukan.', null, 404);
        }

        $fields = [];
        if ($request->has('plate_number') || $request->has('plateNumber')) $fields['plate_number'] = strtoupper(trim($request->input('plate_number', $request->input('plateNumber'))));
        if ($request->has('barcode')) $fields['barcode'] = $request->input('barcode');
        if ($request->has('barcode_bbm') || $request->has('barcodeImage')) $fields['barcode_bbm'] = $request->input('barcode_bbm', $request->input('barcodeImage'));
        if ($request->has('model')) $fields['model'] = $request->input('model');
        if ($request->has('vendor')) $fields['vendor'] = $request->input('vendor');
        if ($request->has('driver_name') || $request->has('driverName')) $fields['driver_name'] = $request->input('driver_name', $request->input('driverName'));
        if ($request->has('driver_whatsapp') || $request->has('driverWhatsapp')) $fields['driver_whatsapp'] = $request->input('driver_whatsapp', $request->input('driverWhatsapp'));
        if ($request->has('team_type') || $request->has('teamType')) $fields['team_type'] = $request->input('team_type', $request->input('teamType'));
        if ($request->has('tool_spare_tire')) $fields['tool_spare_tire'] = (int)$request->input('tool_spare_tire');
        if ($request->has('tool_jack')) $fields['tool_jack'] = (int)$request->input('tool_jack');
        if ($request->has('tool_wrench')) $fields['tool_wrench'] = (int)$request->input('tool_wrench');
        if ($request->has('tool_first_aid')) $fields['tool_first_aid'] = (int)$request->input('tool_first_aid');
        if ($request->has('doc_berita_acara') || $request->has('docBeritaAcara')) $fields['doc_berita_acara'] = $request->input('doc_berita_acara', $request->input('docBeritaAcara'));
        if ($request->has('status')) $fields['status'] = $request->input('status');

        $vehicle->update($fields);
        return $this->jsonResponse(true, 'Data armada mobil berhasil diperbarui.', $this->formatVehicle($vehicle));
    }

    public function assign(Request $request)
    {
        $vehicleId = $request->input('vehicle_id');
        $employeeId = $request->input('employee_id');
        $notes = $request->input('notes', '');

        $vehicle = Vehicle::find($vehicleId);
        $employee = Employee::find($employeeId);

        if (!$vehicle || !$employee) {
            return $this->jsonResponse(false, 'Unit armada atau karyawan tidak valid.', null, 400);
        }

        $employee->vehicle_id = $vehicle->id;
        $employee->save();

        $vehicle->status = 'Dipakai';
        $vehicle->driver_name = $employee->name;
        $vehicle->save();

        VehicleLog::create([
            'vehicle_id' => $vehicle->id,
            'plate_number' => $vehicle->plate_number,
            'driver_name' => $employee->name,
            'driver_whatsapp' => '-',
            'action' => 'Penugasan Unit',
            'start_date' => now(),
            'notes' => $notes ?: 'Penugasan unit kepada ' . $employee->name,
        ]);

        return $this->jsonResponse(true, 'Penugasan unit armada berhasil diproses.', [
            'vehicle' => $this->formatVehicle($vehicle),
            'employee' => $employee,
        ]);
    }

    public function uploadBbm(Request $request)
    {
        $id = $request->input('id');
        $barcodeBbm = $request->input('barcode_bbm', $request->input('barcodeImage'));

        $vehicle = Vehicle::find($id);
        if (!$vehicle) {
            return $this->jsonResponse(false, 'Armada mobil tidak ditemukan.', null, 404);
        }

        $vehicle->barcode_bbm = $barcodeBbm;
        $vehicle->save();

        return $this->jsonResponse(true, 'Foto barcode BBM berhasil diunggah.', $this->formatVehicle($vehicle));
    }

    public function delete(Request $request)
    {
        $id = $request->input('id');
        $vehicle = Vehicle::find($id);
        if (!$vehicle) {
            return $this->jsonResponse(false, 'Armada mobil tidak ditemukan.', null, 404);
        }

        $vehicle->delete();
        return $this->jsonResponse(true, 'Unit armada berhasil dihapus dari sistem.');
    }
}

