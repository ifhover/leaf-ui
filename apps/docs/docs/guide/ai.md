# AI 与 Skills

安装 Leaf UI skill，让 AI 在编写组件时按需查阅当前项目安装版本的 API、类型与示例。

## 安装

在使用 Leaf UI 的项目目录执行：

```bash
npx skills add ifhover/leaf-ui --skill leaf-ui
```

按照提示选择你的 AI 编程工具。支持 Codex、Claude Code、Cursor 等兼容 Agent Skills 的工具。默认安装到当前项目，可与团队一起维护。

也可以直接指定工具：

```bash
# Codex
npx skills add ifhover/leaf-ui --skill leaf-ui --agent codex

# Claude Code
npx skills add ifhover/leaf-ui --skill leaf-ui --agent claude-code

# Cursor
npx skills add ifhover/leaf-ui --skill leaf-ui --agent cursor
```

希望所有项目共用时添加 `--global`。skill 安装后，在新会话或下一轮对话中使用。

## 使用

先在项目中安装 `@sudden3/leaf-ui`，然后告诉 AI 要完成的界面。例如：

> 使用 leaf-ui skill 为这个项目编写登录表单，支持密码输入、校验反馈和提交状态。

skill 从目标应用目录解析实际安装的包版本。项目使用 `0.2.0` 时，查询的就是 `0.2.0` 文档；不会因为站点更新而改用新 API。在 monorepo 中，应明确要修改哪个应用目录。

查询只读取所需组件或指南，不会把整站文档加入上下文。如果该版本没有某个组件、项目尚未安装包，或版本文档暂时无法访问，AI 会明确说明，并可核对已安装包的类型声明。

## 更新与移除

```bash
npx skills update leaf-ui
npx skills remove leaf-ui
```

更新 skill 不会升级项目中的 Leaf UI。组件版本仍由你的项目依赖决定。

## 文档版本

默认地址展示最新已发布版本，顶部菜单可切换旧版本。每个版本有独立的组件演示、API 与 Markdown 页面，旧版本内容保留。

AI 查询入口包括版本根目录的 `llm.txt`、`llms.txt` 和 `api/index.json`。组件页面也提供 Markdown 链接。skill 的源码与查询工具见 [GitHub](https://github.com/ifhover/leaf-ui/tree/main/skills/leaf-ui)。
