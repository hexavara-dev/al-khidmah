<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SliderController extends Controller
{
    public function index(): Response
    {
        $sliders = Slider::orderBy('order')->orderBy('id')->get();

        return Inertia::render('Admin/Sliders', [
            'sliders' => $sliders,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'subtitle'    => 'nullable|string|max:500',
            'button_text' => 'nullable|string|max:100',
            'button_url'  => 'nullable|string|max:500',
            'bg_color'    => 'nullable|string|max:20',
            'is_active'   => 'boolean',
            'order'       => 'integer',
            'image'       => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('sliders', 'public');
        }

        Slider::create($data);

        return back()->with('success', 'Slider berhasil ditambahkan.');
    }

    public function update(Request $request, Slider $slider)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'subtitle'    => 'nullable|string|max:500',
            'button_text' => 'nullable|string|max:100',
            'button_url'  => 'nullable|string|max:500',
            'bg_color'    => 'nullable|string|max:20',
            'is_active'   => 'boolean',
            'order'       => 'integer',
            'image'       => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($slider->image) {
                Storage::disk('public')->delete($slider->image);
            }
            $data['image'] = $request->file('image')->store('sliders', 'public');
        }

        $slider->update($data);

        return back()->with('success', 'Slider berhasil diperbarui.');
    }

    public function destroy(Slider $slider)
    {
        if ($slider->image) {
            Storage::disk('public')->delete($slider->image);
        }
        $slider->delete();

        return back()->with('success', 'Slider berhasil dihapus.');
    }
}
