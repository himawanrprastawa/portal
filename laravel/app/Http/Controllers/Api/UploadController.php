<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    private function jsonResponse(bool $success, string $message, $data = null, int $statusCode = 200)
    {
        return response()->json([
            'success' => $success,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    public function upload(Request $request)
    {
        if (!$request->hasFile('file')) {
            return $this->jsonResponse(false, 'Tidak ada file yang diunggah.', null, 400);
        }

        $file = $request->file('file');
        if (!$file->isValid()) {
            return $this->jsonResponse(false, 'File upload tidak valid.', null, 400);
        }

        $ext = strtolower($file->getClientOriginalExtension());
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'];

        if (!in_array($ext, $allowedExtensions, true)) {
            return $this->jsonResponse(false, 'Format file tidak didukung. Format yang diizinkan: JPG, PNG, PDF, DOC.', null, 400);
        }

        $uploadDir = public_path('uploads');
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $originalName = $file->getClientOriginalName();
        $prefix = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($originalName, PATHINFO_FILENAME));
        $cleanFilename = substr($prefix, 0, 30) . '_' . uniqid() . '.' . $ext;

        $file->move($uploadDir, $cleanFilename);

        $url = url('uploads/' . $cleanFilename);

        return $this->jsonResponse(true, 'File berhasil diunggah.', [
            'original_name' => $originalName,
            'filename' => $cleanFilename,
            'url' => $url,
            'size' => filesize($uploadDir . '/' . $cleanFilename),
        ]);
    }
}

