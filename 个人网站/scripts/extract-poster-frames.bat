@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
echo ========================================
echo 海报-2 逐帧提取
echo 将 海报-2.mp4 放入 imga 文件夹后运行
echo 需要 FFmpeg: https://ffmpeg.org/
echo ========================================
echo.

set "IMGA=..\imga"
set "VIDEO=%IMGA%\海报-2.mp4"
set "OUTPUT=%IMGA%\海报-2_frames"
set FPS=60

if not exist "%VIDEO%" (
    echo 未找到 %VIDEO%
    echo 请将海报动画视频命名为 海报-2.mp4 并放入 imga 文件夹
    pause
    exit /b 1
)

if not exist "%OUTPUT%" mkdir "%OUTPUT%"
echo 正在提取 海报-2 帧 (60fps)...
ffmpeg -y -i "%VIDEO%" -vf "fps=%FPS%" -q:v 5 "%OUTPUT%\frame_%%05d.jpg" 2>nul

set count=0
for %%f in ("%OUTPUT%\frame_*.jpg") do set /a count+=1
echo [完成] 海报-2: !count! 帧

echo.
echo 请运行 update-frame-counts.bat 或手动在 frame_counts.js 中添加:
echo   "海报-2_frames": !count!
echo ========================================
pause
