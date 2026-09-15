<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comcase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ComcaseController extends Controller
{
    private function jsonResponse(bool $success, string $message, $data = null, int $statusCode = 200)
    {
        return response()->json([
            'success' => $success,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    public function index(Request $request)
    {
        $action = $request->query('action');

        if ($action === 'employee-summary') {
            $summary = DB::table('comcases')
                ->select(
                    'team_leader',
                    DB::raw('COUNT(*) as total_comcases'),
                    DB::raw('SUM(amount) as total_amount'),
                    DB::raw('SUM(CASE WHEN status LIKE "%Menunggu%" THEN 1 ELSE 0 END) as count_pending'),
                    DB::raw('SUM(CASE WHEN status = "Disetujui Manager" THEN 1 ELSE 0 END) as count_approved'),
                    DB::raw('SUM(CASE WHEN status LIKE "%Ditolak%" THEN 1 ELSE 0 END) as count_rejected'),
                    DB::raw('SUM(CASE WHEN status = "Sudah Dibayar" THEN 1 ELSE 0 END) as count_paid'),
                    DB::raw('SUM(CASE WHEN status = "Sudah Dibayar" THEN amount ELSE 0 END) as paid_amount')
                )
                ->groupBy('team_leader')
                ->orderByDesc('total_comcases')
                ->get();

            return $this->jsonResponse(true, 'Rekapitulasi comcase per pegawai berhasil dimuat.', $summary);
        }

        $comcases = Comcase::orderBy('date', 'desc')->get();
        return $this->jsonResponse(true, 'Daftar comcase berhasil dimuat.', $comcases);
    }

    public function create(Request $request)
    {
        $id = trim($request->input('id', ''));
        if (empty($id)) {
            $id = 'CC-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        }

        $comcase = Comcase::create([
            'id' => $id,
            'date' => $request->input('date', date('Y-m-d')),
            'project' => $request->input('project', ''),
            'team_leader' => $request->input('team_leader', ''),
            'activity' => $request->input('activity', ''),
            'site_id' => $request->input('site_id', ''),
            'amount' => (float)$request->input('amount', 0),
            'account_number' => $request->input('account_number', ''),
            'bank_name' => $request->input('bank_name', ''),
            'recipient_name' => $request->input('recipient_name', ''),
            'doc_berita_acara' => $request->input('doc_berita_acara', ''),
            'doc_kwitansi' => $request->input('doc_kwitansi', ''),
            'doc_foto' => $request->input('doc_foto', ''),
            'doc_patwal' => $request->input('doc_patwal', ''),
            'status' => 'Menunggu Review Zone Manager',
            'submitted_by' => $request->input('submitted_by', 'Supervisor'),
            'submitted_at' => now(),
            'revision_count' => (int)$request->input('revision_count', 0),
        ]);

        return $this->jsonResponse(true, 'Pengajuan comcase berhasil dikirim.', $comcase, 201);
    }

    public function reviewZone(Request $request)
    {
        $id = trim($request->input('id', ''));
        $approved = (bool)$request->input('approved', false);
        $notes = trim($request->input('notes', ''));
        $zmName = trim($request->input('zone_manager_name', 'Zone Manager'));

        $comcase = Comcase::find($id);
        if (!$comcase) {
            return $this->jsonResponse(false, 'Comcase tidak ditemukan.', null, 404);
        }

        $comcase->status = $approved ? 'Menunggu Approval Manager Operasional' : 'Ditolak Zone Manager';
        $comcase->zone_manager_by = $zmName;
        $comcase->zone_manager_at = now();
        $comcase->zone_manager_status = $approved ? 'Disetujui' : 'Ditolak';
        $comcase->zone_manager_notes = $notes;
        $comcase->save();

        return $this->jsonResponse(true, $approved ? 'Comcase disetujui Zone Manager.' : 'Comcase ditolak Zone Manager.', $comcase);
    }

    public function updateStatus(Request $request)
    {
        $id = trim($request->input('id', ''));
        $approved = (bool)$request->input('approved', false);
        $notes = trim($request->input('notes', ''));
        $managerName = trim($request->input('manager_name', 'Manager Operasional'));

        $comcase = Comcase::find($id);
        if (!$comcase) {
            return $this->jsonResponse(false, 'Comcase tidak ditemukan.', null, 404);
        }

        $comcase->status = $approved ? 'Disetujui Manager' : 'Ditolak Manager Operasional';
        $comcase->manager_approval_by = $managerName;
        $comcase->manager_approval_at = now();
        $comcase->manager_approval_status = $approved ? 'Disetujui' : 'Ditolak';
        $comcase->manager_approval_notes = $notes;
        $comcase->save();

        return $this->jsonResponse(true, $approved ? 'Comcase berhasil disetujui Manager.' : 'Comcase ditolak Manager.', $comcase);
    }

    public function payment(Request $request)
    {
        $id = trim($request->input('id', ''));
        $paidBy = trim($request->input('paid_by', 'Finance'));
        $paymentProof = trim($request->input('payment_proof', ''));

        $comcase = Comcase::find($id);
        if (!$comcase) {
            return $this->jsonResponse(false, 'Comcase tidak ditemukan.', null, 404);
        }

        $comcase->status = 'Sudah Dibayar';
        $comcase->finance_payment_by = $paidBy;
        $comcase->finance_payment_at = now();
        $comcase->finance_payment_proof = $paymentProof;
        $comcase->save();

        return $this->jsonResponse(true, 'Pembayaran comcase berhasil dicatat.', $comcase);
    }

    public function delete(Request $request)
    {
        $id = trim($request->input('id', ''));
        $comcase = Comcase::find($id);
        if (!$comcase) {
            return $this->jsonResponse(false, 'Comcase tidak ditemukan.', null, 404);
        }

        $comcase->delete();
        return $this->jsonResponse(true, 'Pengajuan comcase berhasil dihapus.');
    }
}

