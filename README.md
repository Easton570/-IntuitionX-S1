<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1q2JDxerpm8sKOLo4UusFnbt9B_BgihVY

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# CineMind AI

> 将抖音中长视频从"线性观看"升级为"更好理解、更好交互的内容结构"。

---

## 项目简介

本项目是一个面向抖音精选当中的中长视频内容（旅游 Vlog、电影 / 电视剧解说、长播客等，时长约为10分钟左右，通常在5分钟以上，15分钟以下）的 AI 理解与交互应用原型。

在抖音精选平台中，中长类视频往往信息密集、结构隐含、理解成本高。本项目通过 **AI 对视频内容的语义理解、结构化拆解与上下文交互**，帮助用户：

* 快速理解视频整体结构与关键内容
* 按需跳转到感兴趣的剧情 / 信息片段
* 基于已播放内容进行提问、总结与实际使用（如旅行规划）

本项目尝试让 AI **真正参与到内容的理解、讲述与使用过程中**。

---

## 核心功能

### 1. AI 视频内容切片（Structure-aware Navigation）

* 对中长视频进行语义理解
* 自动生成**可点击的内容片段**，与视频时间轴联动

**支持的切片逻辑：**

* 电影 / 电视剧 / 小说解说：

  * 剧情阶段（开端 / 推进 / 转折 / 高潮 / 结局）
  * 主要人物行动与关键事件
* 旅游 Vlog：

  * 景点 / 地点
  * 时间段（上午 / 下午 / 某一天）

用户可通过切片快速跳转到目标内容，显著降低观看与回看成本。

---

### 2. 基于视频上下文的聊天式 AI 交互

* 提供独立聊天窗口，不打断视频播放
* AI 回答严格基于：

  * 当前视频整体结构
  * 当前播放片段
  * 已播放字幕内容

**支持的交互类型：**

* 剧情与逻辑理解（Why / How）
* 已播放内容总结与复盘
* 角色 / 事件查询
* 场景化应用（如基于旅游 Vlog 的行程规划）

聊天系统的目标是**帮助用户理解模糊概念和提供遗漏信息**。

---

## 使用流程（Quick Start）

1. 打开一个中长视频
2. 点击「AI 理解」按钮
3. 等待 AI 生成视频内容切片
4. 通过切片列表跳转观看
5. 随时打开聊天窗口进行提问或总结

---

## 技术实现概览

### 整体流程

```
Video Input
   ↓
ASR（字幕 + 时间戳）
   ↓
LLM 语义理解与结构化切片
   ↓
结构化切片索引（JSON）
   ↓
视频跳转 + 上下文聊天
```

### 关键模块

* **视频解析模块**：

  * 音视频转字幕（带时间戳）

* **内容理解与切片 Agent**：

  * 判断视频类型
  * 基于语义生成结构化片段

* **播放与导航模块**：

  * 切片与视频时间轴联动

* **聊天交互模块**：

  * 基于当前播放状态的上下文问答

---

**潜在扩展方向：**

* 多语言视频主题理解
* 收藏和 highlight 视频具体过程内容
* 生成具体片段的可分享图文总结

---

## Hackathon 场景说明

本项目为黑客松原型，重点展示：

* AI 对真实视频内容的理解能力
* AI 对于用户提问和具体片段的定位与信息提取能力

系统复杂度可控，Demo 导向明确，适合快速验证与展示。

---

## License

This project is for hackathon / research demonstration purposes only.
