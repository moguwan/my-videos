# A 页图片资源 (imga)

本文件夹存放 A 页（Chawke 焊接头产品介绍）所需的图片与视频。

## 建议的文件结构

| 文件路径 | 用途 |
|---------|------|
| `logo.png` | 第一屏 Logo（已使用） |
| `海报-1.png` | 第二屏背景/产品图（滑动时渐现） |
| `海报-2.png` | 第二屏产品图（无逐帧时静态显示） |
| `海报-2.mp4` | 海报动画视频，用于提取逐帧 |
| `海报-2_frames/` | 由 scripts/extract-poster-frames.bat 生成 |
| `module-wave.png` | 第三屏波形/频率图 |
| `module-chart.png` | 第三屏圆形分段图 |

**若已添加图片但文件名不同**（如 产品-1.png、产品-2.png），可重命名为：
- `overview-bg.png` - 第二屏背景
- `overview-product.png` - 第二屏产品图
| `module-cutting.png` | 第三屏 Ultrasonic Cutting 配图 |
| `diagram-wave.png` | 技术波形图 |
| `diagram-chart.png` | 技术图表 |

## 逐帧动画（可选）

若希望使用 imga 内的帧序列，可创建：

- `cutting_frames/` - 刀头切割逐帧图（frame_00001.jpg, frame_00002.jpg...）
- `fan_frames/` - 风扇逐帧图

当前 A 页默认使用 `Chawke视频组/` 下的现有帧序列，可在 `pages/a.html` 中修改 `data-frames-path` 切换。
