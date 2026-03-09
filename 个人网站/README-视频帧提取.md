使用说明

本页面参考 [Apple](https://www.apple.com/airpods-pro/)、[VITURE](https://neckband.viture.com/)、[南孚电池](https://www.nanfu.global) 等官网的实现方式，使用 **图片序列 + Canvas** 实现 60fps 级丝滑滚动效果。

## 为什么用图片序列？

- 视频的 `currentTime` 拖动（seek）受编码关键帧限制，容易卡顿
- 图片序列直接按帧绘制到 Canvas，无 seek 开销，与 Apple / VITURE 方案一致
- 详见：[CSS-Tricks - Apple 滚动动画](https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/)

## 使用步骤

### 1. 安装 FFmpeg

- 下载：https://ffmpeg.org/download.html
- Windows：解压后将 `bin` 目录加入系统 PATH

### 2. 提取帧

双击运行：

```
scripts/extract-frames.bat
```

会在 `Chawke视频组/` 下生成帧图，**按各视频实际时长**提取（60fps）：

- `风扇动画_frames/` 
- `切割刀_frames/`
- `焊接动画_frames/`

时长不同则帧数不同，不再出现「播完后长时间定格同一画面」的问题。脚本会生成 `frame_counts.js` 供页面使用。

**若之前提取过**：请先删除旧的 `*_frames` 文件夹，再重新运行脚本（帧命名已改为 5 位）。

### 3. 刷新页面

提取完成后刷新 `index.html`，即可看到丝滑效果。

---

**未提取帧时**：页面会自动使用原视频作为降级方案，效果会略逊于图片序列。
