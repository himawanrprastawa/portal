<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ZoneRequest;
use Illuminate\Http\Request;

class ZoneRequestController extends Controller
{
    private function jsonResponse(bool $success, string $message, $data = null, int $statusCode = 200)
    {
        return response()->json([
            'success' => $success,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    public function index()
    {
        $requests = ZoneRequest::orderBy('id', 'desc')->get();
        return $this->jsonResponse(true, 'Data permohonan external berhasil dimuat.', $requests);
    }

    public function create(Request $request)
    {
        $reqNum = trim($request->input('request_number', ''));
        if (empty($reqNum)) {
            $reqNum = 'REQ-EXT-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        }

        $zoneReq = ZoneRequest::create([
            'request_number' => $reqNum,
            'zone_name' => $request->input('zone_name', 'Zone 1'),
            'requester_name' => $request->input('requester_name', 'Zone Manager'),
            'title' => $request->input('title', 'Permohonan Biaya Operasional'),
            'category' => $request->input('category', 'Permohonan Operasional'),
            'estimated_cost' => (float)$request->input('estimated_cost', 0),
            'description' => $request->input('description', ''),
            'pdf_filename' => $request->input('pdf_filename', ''),
            'pdf_url' => $request->input('pdf_url', ''),
            'status' => 'Menunggu TTD Manager',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->jsonResponse(true, 'Dokumen permohonan external berhasil diunggah.', $zoneReq, 201);
    }

    public function sign(Request $request)
    {
        $id = $request->input('id');
        $signerRole = strtolower(trim($request->input('signer_role', '')));
        $signerName = trim($request->input('signer_name', ''));
        $signature = trim($request->input('signature', ''));
        $notes = trim($request->input('notes', ''));

        $zoneReq = ZoneRequest::find($id);
        if (!$zoneReq) {
            return $this->jsonResponse(false, 'Data permohonan tidak ditemukan.', null, 404);
        }

        if (in_array($signerRole, ['requester', 'zone', 'zone_manager', 'spv'])) {
            $zoneReq->requester_signed_at = now();
            $zoneReq->requester_signature = $signature;
            $zoneReq->requester_notes = $notes;
            $zoneReq->status = 'Menunggu TTD Manager';
        } elseif (in_array($signerRole, ['manager', 'manager_ops', 'ops_manager'])) {
            $zoneReq->manager_name = $signerName ?: 'Manager Operasional';
            $zoneReq->manager_signed_at = now();
            $zoneReq->manager_signature = $signature;
            $zoneReq->manager_notes = $notes;
            $zoneReq->status = 'Menunggu TTD GM';
        } elseif (in_array($signerRole, ['gm', 'general manager', 'general_manager'])) {
            $zoneReq->gm_name = $signerName ?: 'General Manager';
            $zoneReq->gm_signed_at = now();
            $zoneReq->gm_signature = $signature;
            $zoneReq->gm_notes = $notes;
            $zoneReq->status = 'Menunggu TTD Owner';
        } elseif (in_array($signerRole, ['finance_checker'])) {
            $zoneReq->finance_checker_name = $signerName ?: 'Finance Verifier';
            $zoneReq->finance_checker_signed_at = now();
            $zoneReq->finance_checker_signature = $signature;
            $zoneReq->finance_checker_notes = $notes;
        } elseif (in_array($signerRole, ['owner', 'direksi', 'direktur'])) {
            $zoneReq->owner_name = $signerName ?: 'Direksi / Owner';
            $zoneReq->owner_signed_at = now();
            $zoneReq->owner_signature = $signature;
            $zoneReq->owner_notes = $notes;
            $zoneReq->status = 'Menunggu Pencairan Finance';
        } elseif (in_array($signerRole, ['finance_pay', 'finance', 'pencairan'])) {
            $zoneReq->finance_paid_by = $signerName ?: 'Finance Kasir';
            $zoneReq->finance_paid_at = now();
            $zoneReq->finance_receipt = $signature;
            $zoneReq->finance_notes = $notes;
            $zoneReq->finance_amount = (float)$request->input('amount', $zoneReq->estimated_cost);
            $zoneReq->status = 'Selesai (Sudah Dicairkan)';
        }

        $zoneReq->save();
        return $this->jsonResponse(true, 'Tanda tangan otorisasi berhasil disimpan.', $zoneReq);
    }

    public function reject(Request $request)
    {
        $id = $request->input('id');
        $reason = trim($request->input('rejection_reason', ''));

        $zoneReq = ZoneRequest::find($id);
        if (!$zoneReq) {
            return $this->jsonResponse(false, 'Data permohonan tidak ditemukan.', null, 404);
        }

        $zoneReq->status = 'Ditolak';
        $zoneReq->rejection_reason = $reason;
        $zoneReq->save();

        return $this->jsonResponse(true, 'Permohonan berhasil ditolak.', $zoneReq);
    }

    public function delete(Request $request)
    {
        $id = $request->input('id');
        $zoneReq = ZoneRequest::find($id);
        if (!$zoneReq) {
            return $this->jsonResponse(false, 'Data permohonan tidak ditemukan.', null, 404);
        }

        $zoneReq->delete();
        return $this->jsonResponse(true, 'Permohonan external berhasil dihapus.');
    }
}

