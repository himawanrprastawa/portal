<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
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
        $key = $request->query('key');

        if (!empty($key)) {
            $setting = Setting::where('setting_key', $key)->first();
            if (!$setting) {
                return $this->jsonResponse(true, 'Setting not found, returning null', null);
            }
            $val = $setting->setting_value;
            $decoded = json_decode((string)$val, true);
            return $this->jsonResponse(true, 'Setting loaded', $decoded !== null ? $decoded : $val);
        }

        $all = Setting::all();
        $result = [];
        foreach ($all as $s) {
            $decoded = json_decode((string)$s->setting_value, true);
            $result[$s->setting_key] = $decoded !== null ? $decoded : $s->setting_value;
        }

        return $this->jsonResponse(true, 'All settings loaded', $result);
    }

    public function save(Request $request)
    {
        $key = trim($request->input('setting_key', $request->query('key', '')));
        $value = $request->input('setting_value');

        if (empty($key)) {
            return $this->jsonResponse(false, 'setting_key is required.', null, 400);
        }

        $strValue = is_string($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE);

        $setting = Setting::updateOrCreate(
            ['setting_key' => $key],
            ['setting_value' => $strValue, 'updated_at' => now()]
        );

        return $this->jsonResponse(true, "Konfigurasi '{$key}' berhasil disimpan ke database.", [
            'setting_key' => $key,
            'setting_value' => $value,
        ]);
    }
}

