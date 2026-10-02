import subprocess
import imageio_ffmpeg
import os

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
src_video = r"d:\Detai12_QLCH\frontend\public\videos\ozar-clean-delogo.mp4"
out_video = r"d:\Detai12_QLCH\frontend\public\videos\ozar-widescreen-1080p.mp4"

print("Rendering 1920x1080 Widescreen Full HD video with ambient background...")
filter_complex = (
    "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=25:5[bg];"
    "[0:v]scale=-1:1080,unsharp=5:5:1.2:5:5:0.0[fg];"
    "[bg][fg]overlay=(W-w)/2:(H-h)/2"
)

cmd = [
    ffmpeg,
    "-y",
    "-i", src_video,
    "-filter_complex", filter_complex,
    "-c:v", "libx264",
    "-crf", "18",
    "-preset", "fast",
    "-c:a", "copy",
    out_video
]

res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    size_mb = os.path.getsize(out_video) / (1024 * 1024)
    print(f"Success! 16:9 Widescreen 1080p video saved to {out_video} ({size_mb:.1f} MB)")
else:
    print("FFmpeg error:", res.stderr)
