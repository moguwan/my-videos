@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ========================================
echo 视频转图片序列 - 按视频时长自动分割
echo 需要安装 FFmpeg: https://ffmpeg.org/
echo ========================================
echo.

set "VIDEO_DIR=..\Chawke视频组"
set "OUTPUT_BASE=..\Chawke视频组"
set "PROJECT_ROOT=.."
set FPS=60

echo 正在提取: 风扇动画 (按时长 60fps)...
if not exist "%OUTPUT_BASE%\风扇动画_frames" mkdir "%OUTPUT_BASE%\风扇动画_frames"
ffmpeg -y -i "%VIDEO_DIR%\风扇动画.m4v" -vf "fps=%FPS%" -q:v 5 "%OUTPUT_BASE%\风扇动画_frames\frame_%%05d.jpg" 2>nul
set count1=0
for %%f in ("%OUTPUT_BASE%\风扇动画_frames\frame_*.jpg") do set /a count1+=1
echo   [完成] 风扇动画: !count1! 帧

echo.
echo 正在提取: 切割刀 (按时长 60fps)...
if not exist "%OUTPUT_BASE%\切割刀_frames" mkdir "%OUTPUT_BASE%\切割刀_frames"
ffmpeg -y -i "%VIDEO_DIR%\切割刀.mp4" -vf "fps=%FPS%" -q:v 5 "%OUTPUT_BASE%\切割刀_frames\frame_%%05d.jpg" 2>nul
set count2=0
for %%f in ("%OUTPUT_BASE%\切割刀_frames\frame_*.jpg") do set /a count2+=1
echo   [完成] 切割刀: !count2! 帧

echo.
echo 正在提取: 焊接动画 (按时长 60fps)...
if not exist "%OUTPUT_BASE%\焊接动画_frames" mkdir "%OUTPUT_BASE%\焊接动画_frames"
ffmpeg -y -i "%VIDEO_DIR%\焊接动画.m4v" -vf "fps=%FPS%" -q:v 5 "%OUTPUT_BASE%\焊接动画_frames\frame_%%05d.jpg" 2>nul
set count3=0
for %%f in ("%OUTPUT_BASE%\焊接动画_frames\frame_*.jpg") do set /a count3+=1
echo   [完成] 焊接动画: !count3! 帧

echo.
echo 正在生成 frame_counts.js ...
(
echo // 由 extract-frames.bat 自动生成，请勿手动修改
echo window.FRAME_COUNTS = {
echo   "风扇动画_frames": !count1!,
echo   "切割刀_frames": !count2!,
echo   "焊接动画_frames": !count3!
echo };
) > "%PROJECT_ROOT%\frame_counts.js"

echo.
echo ========================================
echo 全部完成！各视频按实际时长提取
echo 风扇:!count1! 切割刀:!count2! 焊接:!count3!
echo 刷新页面即可看到效果
echo ========================================
pause
