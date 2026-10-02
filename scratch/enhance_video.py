import subprocess
import imageio_ffmpeg
import os

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
src_video = r"d:\Detai12_QLCH\frontend\public\videos\ozar-clean-delogo.mp4"
out_video = r"d:\Detai12_QLCH\frontend\public\videos\ozar-clean-1080p.mp4"

print("Enhancing video with ffmpeg lanczos upscaling and unsharp filter...")
cmd = [
    ffmpeg,
    "-y",
    "-i", src_video,
    "-vf", "scale=1080:1920:flags=lanczos,unsharp=5:5:1.2:5:5:0.0",
    "-c:v", "libx264",
    "-crf", "17",
    "-preset", "slow",
    "-c:a", "copy",
    out_video
]

res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    size_mb = os.path.getsize(out_video) / (1024 * 1024)
    print(f"Success! Enhanced video saved to {out_video} ({size_mb:.1f} MB)")
else:
    print("FFmpeg error:", res.stderr)
