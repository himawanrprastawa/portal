<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EmployeeController extends Controller
{
    private function jsonResponse(bool $success, string $message, $data = null, int $statusCode = 200)
    {
        return response()->json([
            'success' => $success,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    private function formatEmployee($emp)
    {
        $arr = $emp->toArray();

        $status = $arr['status'] ?? 'Aktif';
        $todayStr = date('Y-m-d');

        if ($status === 'Cuti' && !empty($arr['leave_end_date'])) {
            if ($todayStr > $arr['leave_end_date']) {
                $status = 'Aktif';
                $arr['status'] = 'Aktif';
                $emp->status = 'Aktif';
                $emp->save();
            }
        }

        $startDate = $arr['pkwt_date'] ?? date('Y-m-d');
        $duration = (int)($arr['pkwt_duration_months'] ?? 12);
        if (!in_array($duration, [3, 6, 9, 12], true)) {
            $duration = 12;
        }

        if (empty($arr['pkwt_end_date'])) {
            try {
                $startObj = Carbon::parse($startDate);
                $arr['pkwt_end_date'] = $startObj->addMonths($duration)->format('Y-m-d');
            } catch (\Exception $e) {
                $arr['pkwt_end_date'] = date('Y-m-d');
            }
        }

        try {
            $today = Carbon::today();
            $endDate = Carbon::parse($arr['pkwt_end_date']);
            $daysRemaining = (int)$today->diffInDays($endDate, false);
        } catch (\Exception $e) {
            $daysRemaining = 365;
        }

        $arr['pkwt_duration_months'] = $duration;
        $arr['pkwt_days_remaining'] = $daysRemaining;

        if ($daysRemaining < 0) {
            $arr['pkwt_status'] = 'Expired';
            $arr['pkwt_alert_label'] = '❌ Kontrak Berakhir (' . abs($daysRemaining) . ' hari lalu)';
            $arr['pkwt_badge_class'] = 'badge-soft-danger';
        } elseif ($daysRemaining <= 30) {
            $arr['pkwt_status'] = 'ExpiringSoon';
            $arr['pkwt_alert_label'] = '⚠️ H-' . $daysRemaining . ' Hari (Segera Berakhir)';
            $arr['pkwt_badge_class'] = 'badge-soft-warning';
        } else {
            $arr['pkwt_status'] = 'Active';
            $arr['pkwt_alert_label'] = '✓ Aktif (' . $daysRemaining . ' hari lagi)';
            $arr['pkwt_badge_class'] = 'badge-soft-success';
        }

        // CamelCase aliases
        $arr['position'] = $arr['role'] ?? 'Staff';
        $arr['employeeType'] = $arr['employee_type'] ?? 'Field Worker';
        $arr['department'] = $arr['department'] ?? ($arr['employeeType'] === 'Back Office' ? 'HRD' : 'Member');
        $arr['birthPlace'] = $arr['birth_place'] ?? '';
        $arr['birthDate'] = $arr['birth_date'] ?? '';
        $arr['ktpNik'] = $arr['nik'] ?? '';
        $arr['pkwtDate'] = $arr['pkwt_date'] ?? '';
        $arr['pkwtDurationMonths'] = $duration;
        $arr['pkwtEndDate'] = $arr['pkwt_end_date'] ?? '';
        $arr['leaveStartDate'] = $arr['leave_start_date'] ?? '';
        $arr['leaveEndDate'] = $arr['leave_end_date'] ?? '';
        $arr['leaveNotes'] = $arr['leave_notes'] ?? '';
        $arr['baseSalary'] = $arr['base_salary'] ?? 0;
        $arr['bankAccount'] = $arr['bank_account'] ?? '';
        $arr['emergencySpouse'] = $arr['emergency_spouse'] ?? '';
        $arr['emergencyFather'] = $arr['emergency_father'] ?? '';
        $arr['emergencyMother'] = $arr['emergency_mother'] ?? '';
        $arr['bpjsTk'] = $arr['bpjs_tk'] ?? '';
        $arr['bpjsKs'] = $arr['bpjs_ks'] ?? '';
        $arr['docKtp'] = $arr['doc_ktp'] ?? '';
        $arr['docKk'] = $arr['doc_kk'] ?? '';
        $arr['docCv'] = $arr['doc_cv'] ?? '';
        $arr['docTkpk1'] = $arr['doc_tkpk1'] ?? '';
        $arr['docFirstAid'] = $arr['doc_first_aid'] ?? '';
        $arr['docBasicElectric'] = $arr['doc_basic_electric'] ?? '';
        $arr['docPhoto'] = $arr['doc_photo'] ?? '';
        $arr['vehicleId'] = $arr['vehicle_id'] ?? null;

        return $arr;
    }

    public function index()
    {
        $employees = Employee::orderBy('id', 'asc')->get();
        $formatted = $employees->map(fn($e) => $this->formatEmployee($e));

        return $this->jsonResponse(true, 'Data karyawan berhasil dimuat.', $formatted);
    }

    public function create(Request $request)
    {
        $nip = trim($request->input('nip', ''));
        if (empty($nip)) {
            // Generate BST-XXXX
            $maxNip = Employee::where('nip', 'LIKE', 'BST-%')
                ->selectRaw('MAX(CAST(SUBSTRING(nip, 5) AS UNSIGNED)) as max_num')
                ->value('max_num');
            $nextNum = ($maxNip ? (int)$maxNip : 0) + 1;
            $nip = 'BST-' . str_pad((string)$nextNum, 4, '0', STR_PAD_LEFT);
        }

        $duration = (int)$request->input('pkwt_duration_months', $request->input('pkwtDurationMonths', 12));
        $startDate = $request->input('pkwt_date', $request->input('pkwtDate', date('Y-m-d')));
        $endDate = $request->input('pkwt_end_date', $request->input('pkwtEndDate'));

        if (empty($endDate)) {
            try {
                $endDate = Carbon::parse($startDate)->addMonths($duration)->format('Y-m-d');
            } catch (\Exception $e) {
                $endDate = date('Y-m-d');
            }
        }

        $employee = Employee::create([
            'nip' => $nip,
            'name' => $request->input('name', ''),
            'birth_place' => $request->input('birth_place', $request->input('birthPlace')),
            'birth_date' => $request->input('birth_date', $request->input('birthDate')),
            'role' => $request->input('role', $request->input('position', 'Staff Lapangan')),
            'employee_type' => $request->input('employee_type', $request->input('employeeType', 'Field Worker')),
            'department' => $request->input('department', 'Member'),
            'nik' => $request->input('nik', $request->input('ktpNik', '')),
            'status' => $request->input('status', 'Aktif'),
            'leave_start_date' => $request->input('leave_start_date', $request->input('leaveStartDate')),
            'leave_end_date' => $request->input('leave_end_date', $request->input('leaveEndDate')),
            'leave_notes' => $request->input('leave_notes', $request->input('leaveNotes')),
            'address' => $request->input('address', ''),
            'bank_account' => $request->input('bank_account', $request->input('bankAccount', '')),
            'base_salary' => (float)$request->input('base_salary', $request->input('baseSalary', 0)),
            'pkwt_date' => $startDate,
            'pkwt_duration_months' => $duration,
            'pkwt_end_date' => $endDate,
            'emergency_spouse' => $request->input('emergency_spouse', $request->input('emergencySpouse')),
            'emergency_father' => $request->input('emergency_father', $request->input('emergencyFather')),
            'emergency_mother' => $request->input('emergency_mother', $request->input('emergencyMother')),
            'bpjs_tk' => $request->input('bpjs_tk', $request->input('bpjsTk')),
            'bpjs_ks' => $request->input('bpjs_ks', $request->input('bpjsKs')),
            'doc_ktp' => $request->input('doc_ktp', $request->input('docKtp')),
            'doc_kk' => $request->input('doc_kk', $request->input('docKk')),
            'doc_cv' => $request->input('doc_cv', $request->input('docCv')),
            'doc_tkpk1' => $request->input('doc_tkpk1', $request->input('docTkpk1')),
            'doc_first_aid' => $request->input('doc_first_aid', $request->input('docFirstAid')),
            'doc_basic_electric' => $request->input('doc_basic_electric', $request->input('docBasicElectric')),
            'doc_photo' => $request->input('doc_photo', $request->input('docPhoto')),
            'vehicle_id' => $request->input('vehicle_id', $request->input('vehicleId')),
        ]);

        return $this->jsonResponse(true, 'Data karyawan baru berhasil ditambahkan.', $this->formatEmployee($employee), 201);
    }

    public function update(Request $request)
    {
        $id = $request->input('id');
        $nip = $request->input('nip');

        $employee = null;
        if (!empty($id)) {
            $employee = Employee::find($id);
        }
        if (!$employee && !empty($nip)) {
            $employee = Employee::where('nip', $nip)->first();
        }

        if (!$employee) {
            return $this->jsonResponse(false, 'Data karyawan tidak ditemukan.', null, 404);
        }

        $duration = (int)$request->input('pkwt_duration_months', $request->input('pkwtDurationMonths', $employee->pkwt_duration_months));
        $startDate = $request->input('pkwt_date', $request->input('pkwtDate', $employee->pkwt_date));
        $endDate = $request->input('pkwt_end_date', $request->input('pkwtEndDate'));

        if (empty($endDate)) {
            try {
                $endDate = Carbon::parse($startDate)->addMonths($duration)->format('Y-m-d');
            } catch (\Exception $e) {
                $endDate = $employee->pkwt_end_date;
            }
        }

        $fields = [
            'name' => $request->input('name', $employee->name),
            'birth_place' => $request->input('birth_place', $request->input('birthPlace', $employee->birth_place)),
            'birth_date' => $request->input('birth_date', $request->input('birthDate', $employee->birth_date)),
            'role' => $request->input('role', $request->input('position', $employee->role)),
            'employee_type' => $request->input('employee_type', $request->input('employeeType', $employee->employee_type)),
            'department' => $request->input('department', $employee->department),
            'nik' => $request->input('nik', $request->input('ktpNik', $employee->nik)),
            'status' => $request->input('status', $employee->status),
            'leave_start_date' => $request->input('leave_start_date', $request->input('leaveStartDate', $employee->leave_start_date)),
            'leave_end_date' => $request->input('leave_end_date', $request->input('leaveEndDate', $employee->leave_end_date)),
            'leave_notes' => $request->input('leave_notes', $request->input('leaveNotes', $employee->leave_notes)),
            'address' => $request->input('address', $employee->address),
            'bank_account' => $request->input('bank_account', $request->input('bankAccount', $employee->bank_account)),
            'base_salary' => (float)$request->input('base_salary', $request->input('baseSalary', $employee->base_salary)),
            'pkwt_date' => $startDate,
            'pkwt_duration_months' => $duration,
            'pkwt_end_date' => $endDate,
            'emergency_spouse' => $request->input('emergency_spouse', $request->input('emergencySpouse', $employee->emergency_spouse)),
            'emergency_father' => $request->input('emergency_father', $request->input('emergencyFather', $employee->emergency_father)),
            'emergency_mother' => $request->input('emergency_mother', $request->input('emergencyMother', $employee->emergency_mother)),
            'bpjs_tk' => $request->input('bpjs_tk', $request->input('bpjsTk', $employee->bpjs_tk)),
            'bpjs_ks' => $request->input('bpjs_ks', $request->input('bpjsKs', $employee->bpjs_ks)),
        ];

        if ($request->has('doc_ktp') || $request->has('docKtp')) $fields['doc_ktp'] = $request->input('doc_ktp', $request->input('docKtp'));
        if ($request->has('doc_kk') || $request->has('docKk')) $fields['doc_kk'] = $request->input('doc_kk', $request->input('docKk'));
        if ($request->has('doc_cv') || $request->has('docCv')) $fields['doc_cv'] = $request->input('doc_cv', $request->input('docCv'));
        if ($request->has('doc_tkpk1') || $request->has('docTkpk1')) $fields['doc_tkpk1'] = $request->input('doc_tkpk1', $request->input('docTkpk1'));
        if ($request->has('doc_first_aid') || $request->has('docFirstAid')) $fields['doc_first_aid'] = $request->input('doc_first_aid', $request->input('docFirstAid'));
        if ($request->has('doc_basic_electric') || $request->has('docBasicElectric')) $fields['doc_basic_electric'] = $request->input('doc_basic_electric', $request->input('docBasicElectric'));
        if ($request->has('doc_photo') || $request->has('docPhoto')) $fields['doc_photo'] = $request->input('doc_photo', $request->input('docPhoto'));
        if ($request->has('vehicle_id') || $request->has('vehicleId')) $fields['vehicle_id'] = $request->input('vehicle_id', $request->input('vehicleId'));

        $employee->update($fields);

        return $this->jsonResponse(true, 'Data profil karyawan berhasil diperbarui.', $this->formatEmployee($employee));
    }

    public function delete(Request $request)
    {
        $id = $request->input('id');
        $nip = $request->input('nip');

        $employee = null;
        if (!empty($id)) {
            $employee = Employee::find($id);
        }
        if (!$employee && !empty($nip)) {
            $employee = Employee::where('nip', $nip)->first();
        }

        if (!$employee) {
            return $this->jsonResponse(false, 'Data karyawan tidak ditemukan.', null, 404);
        }

        $employee->delete();
        return $this->jsonResponse(true, 'Data karyawan berhasil dihapus.');
    }
}

