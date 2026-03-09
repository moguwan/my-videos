@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
echo ========================================
echo 根据实际帧图数量更新 frame_counts.js
echo （用于手动删减帧图后同步帧数）
echo ========================================
echo.

set "BASE=..\Chawke视频组"
set "OUT=..\frame_counts.js"

set count1=0
for %%f in ("%BASE%\风扇动画_frames\frame_*.jpg") do set /a count1+=1
echo 风扇动画_frames: !count1! 帧

set count2=0
for %%f in ("%BASE%\切割刀_frames\frame_*.jpg") do set /a count2+=1
echo 切割刀_frames: !count2! 帧

set count3=0
for %%f in ("%BASE%\焊接动画_frames\frame_*.jpg") do set /a count3+=1
echo 焊接动画_frames: !count3! 帧

set count4=0
if exist "..\imga\海报-2_frames" (
    for %%f in ("..\imga\海报-2_frames\frame_*.jpg") do set /a count4+=1
    echo 海报-2_frames: !count4! 帧
)

echo.
echo 正在更新 frame_counts.js ...
(
echo // 由 update-frame-counts.bat 根据实际帧图数量生成
echo window.FRAME_COUNTS = {
echo   "风扇动画_frames": !count1!,
echo   "切割刀_frames": !count2!,
echo   "焊接动画_frames": !count3!,
echo   "海报-2_frames": !count4!
echo };
) > "%OUT%"

echo.
echo 完成！切割刀当前 !count2! 帧
echo 刷新页面即可生效
echo ========================================
pause
