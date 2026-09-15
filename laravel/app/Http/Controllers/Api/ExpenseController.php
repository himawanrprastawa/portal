<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
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
        $query = Expense::orderBy('date', 'desc')->orderBy('id', 'desc');

        if ($request->filled('date_from')) {
            $query->where('date', '>=', $request->query('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->where('date', '<=', $request->query('date_to'));
        }
        if ($request->filled('category') && $request->query('category') !== 'All') {
            $query->where('category', $request->query('category'));
        }
        if ($request->filled('status') && $request->query('status') !== 'All') {
            $query->where('status', $request->query('status'));
        }
        if ($request->filled('recipient')) {
            $query->where('recipient_name', 'LIKE', '%' . $request->query('recipient') . '%');
        }

        $expenses = $query->get();
        return $this->jsonResponse(true, 'Daftar transaksi berhasil dimuat.', $expenses);
    }

    public function create(Request $request)
    {
        $amount = (float)$request->input('amount', 0);
        $recipient = trim($request->input('recipient_name', $request->input('driver_name', $request->input('pic_name', ''))));

        if ($amount <= 0 || empty($recipient)) {
            return $this->jsonResponse(false, 'Nominal dan nama PIC/penyetor wajib diisi.', null, 400);
        }

        $type = strtolower($request->input('type', 'out'));
        $rawCategory = $request->input('category', 'BBM');

        if ($type === 'in' || strtolower($rawCategory) === 'deposit' || str_contains(strtolower($rawCategory), 'kas masuk') || str_contains(strtolower($rawCategory), 'deposit')) {
            $type = 'in';
            $category = 'Deposit';
            $status = 'Tervalidasi';
        } else {
            $type = 'out';
            $category = 'Lainnya';
            if (str_contains($rawCategory, 'BBM')) {
                $category = 'BBM';
            } elseif (str_contains($rawCategory, 'Tol')) {
                $category = 'Tol';
            } elseif (str_contains($rawCategory, 'Lalamove')) {
                $category = 'Lalamove';
            } elseif (str_contains($rawCategory, 'Tools') || str_contains($rawCategory, 'Peralatan')) {
                $category = 'Tools';
            } elseif (str_contains($rawCategory, 'Makan') || str_contains($rawCategory, 'Inap')) {
                $category = 'Makan Inap';
            }
            $status = $request->input('status', ($category === 'BBM' ? 'Belum Divalidasi' : 'Tervalidasi'));
        }

        $code = trim($request->input('code', ''));
        if (empty($code)) {
            $prefix = ($type === 'in') ? 'DEP-' : 'EXP-';
            $code = $prefix . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        }

        $plate = trim($request->input('plate_number', $request->input('plateNumber', '')));
        $desc = trim($request->input('description', ''));
        if ($plate && !str_contains($desc, $plate)) {
            $desc = "[{$plate}] {$desc}";
        }

        $expense = Expense::create([
            'code' => $code,
            'type' => $type,
            'date' => $request->input('date', date('Y-m-d')),
            'category' => $category,
            'amount' => $amount,
            'recipient_name' => $recipient,
            'pic_name' => $request->input('pic_name', $recipient),
            'plate_number' => $plate ?: null,
            'description' => $desc ?: ($type === 'in' ? 'Deposit Kas Operasional' : ($category === 'BBM' ? 'Pengisian BBM Operasional Unit ' . $plate : 'Pengeluaran Kas Operasional')),
            'status' => $status,
        ]);

        return $this->jsonResponse(true, 'Transaksi ' . ($type === 'in' ? 'deposit' : 'pengeluaran') . ' berhasil dicatat.', $expense, 201);
    }

    public function validateBbm(Request $request)
    {
        $id = $request->input('id');
        $expense = Expense::find($id);
        if (!$expense) {
            return $this->jsonResponse(false, 'Transaksi tidak ditemukan.', null, 404);
        }

        $expense->status = 'Sudah Divalidasi';
        $expense->validation_date = $request->input('validation_date', $request->input('date', date('Y-m-d')));
        $expense->validation_amount = (float)$request->input('validation_amount', $request->input('amount', $expense->amount));
        $expense->validation_photo_before = $request->input('validation_photo_before', $request->input('photoOdometer', $request->input('photo_odometer')));
        $expense->validation_photo_after = $request->input('validation_photo_after', $request->input('photoDispenser', $request->input('photo_dispenser')));
        $expense->validation_photo_struk = $request->input('validation_photo_struk', $request->input('photoStruk', $request->input('photo_struk')));
        $expense->validation_notes = $request->input('validation_notes', $request->input('notes', ''));
        $expense->validated_by = $request->input('validated_by', $request->input('driverName', $request->input('driver_name', 'Driver Lapangan')));
        $expense->validated_at = now();
        $expense->save();

        return $this->jsonResponse(true, 'Validasi nota BBM berhasil disimpan.', $expense);
    }

    public function update(Request $request)
    {
        $id = $request->input('id');
        $expense = Expense::find($id);
        if (!$expense) {
            return $this->jsonResponse(false, 'Transaksi tidak ditemukan.', null, 404);
        }

        $fields = $request->only([
            'type', 'date', 'category', 'amount', 'recipient_name', 'pic_name', 'plate_number', 'description', 'status',
            'validation_date', 'validation_amount', 'validation_notes', 'validated_by'
        ]);
        $expense->update($fields);

        return $this->jsonResponse(true, 'Transaksi berhasil diperbarui.', $expense);
    }

    public function delete(Request $request)
    {
        $id = $request->input('id', $request->query('id'));
        $expense = Expense::find($id);
        if (!$expense) {
            return $this->jsonResponse(false, 'Transaksi tidak ditemukan.', null, 404);
        }

        $expense->delete();
        return $this->jsonResponse(true, 'Transaksi berhasil dihapus.');
    }
}

