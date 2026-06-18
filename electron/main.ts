import {
  app,
  BrowserWindow,
  ipcMain,
  clipboard,
  shell,
  dialog,
  nativeImage
} from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

const clipboardListener = require('clipboard-event')

let mainWindow: BrowserWindow | null = null
let lastCopiedText = clipboard.readText()
let isWatcherStarted = false

function startClipboardWatcher(win: BrowserWindow) {
  if (isWatcherStarted) return
  isWatcherStarted = true

  clipboardListener.startListening()
  clipboardListener.on('change', () => {
    const currentText = clipboard.readText()
    if (
      currentText &&
      currentText.trim() !== '' &&
      currentText !== lastCopiedText
    ) {
      lastCopiedText = currentText
      win.webContents.send('clipboard-changed', currentText)
    }
  })
}

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js')
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      webSecurity: app.isPackaged ? true : false
    }
  })

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  } else {
    mainWindow.loadURL('http://localhost:5173')
  }

  //개발도구 계속 켜지는거
  //mainWindow.webContents.openDevTools()

  mainWindow.webContents.on('did-finish-load', () => {
    startClipboardWatcher(mainWindow!)
  })
}

app.whenReady().then(createWindow)
ipcMain.on(
  'resize-window',
  (_event, size: 'max' | 'middle' | 'min' | 'mini') => {
    if (!mainWindow) return

    if (size === 'max') {
      // 🌟 1. 최대화 시 원래 최소 크기 제한 복구
      mainWindow.setMinimumSize(1024, 768)
      if (mainWindow.isMaximized()) mainWindow.unmaximize()
      else mainWindow.maximize()
    } else if (size === 'mini') {
      // 🌟 2. 미니 모드: 최소 크기 제한을 먼저 400x600으로 확 낮춰서 작아질 수 있게 허락함
      if (mainWindow.isMaximized()) mainWindow.unmaximize()
      mainWindow.setMinimumSize(400, 600)

      // 이제 안심하고 미니 위젯 사이즈로 축소!
      mainWindow.setSize(420, 700)
      mainWindow.setAlwaysOnTop(true) // 다른 창 위에 항상 띄워두기
      mainWindow.center()
    } else {
      // 🌟 3. 일반 모드 복귀: 화면을 원래대로 키우고, 최소 크기 제한(1024x768)도 다시 걸어줌
      if (mainWindow.isMaximized()) mainWindow.unmaximize()
      mainWindow.setAlwaysOnTop(false)

      // 크기를 키우기 전에 제한 먼저 복구
      mainWindow.setMinimumSize(1024, 768)

      const width = size === 'middle' ? 1440 : 1024
      const height = size === 'middle' ? 900 : 768
      mainWindow.setSize(width, height)
      mainWindow.center()
    }
  }
)
ipcMain.on('write-clipboard', (_event, text: string) => {
  lastCopiedText = text
  clipboard.writeText(text)
})

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory']
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

ipcMain.on('open-path', async (_event, filePath: string) => {
  try {
    await shell.openPath(filePath)
  } catch (error) {
    console.error('파일을 열 수 없습니다:', error)
  }
})

// 🌟 [파일/폴더 넣기] 대형 폴더 및 드라이브 간 이동까지 완벽 지원하는 철벽 로직
ipcMain.handle(
  'stash-file',
  async (_event, sourcePath: string, fileName: string) => {
    const stashDir = path.join(app.getPath('userData'), 'MyStash')

    if (!fs.existsSync(stashDir)) {
      fs.mkdirSync(stashDir, { recursive: true })
    }

    const safeFileName = `${Date.now()}_${fileName}`
    const targetPath = path.join(stashDir, safeFileName)

    try {
      const stat = await fs.promises.stat(sourcePath)
      const isDirectory = stat.isDirectory()

      // OS 드롭 세션 정리를 위해 200ms 살짝 대기 (잠금 해제 우회)
      await new Promise((resolve) => setTimeout(resolve, 200))

      try {
        // 1. 가장 빠른 이름 변경(이동) 시도
        await fs.promises.rename(sourcePath, targetPath)
      } catch (renameError: any) {
        // 2. 다른 드라이브 분기 처리 (C드라이브에서 D드라이브 등으로 이동할 때)
        if (isDirectory) {
          await fs.promises.cp(sourcePath, targetPath, { recursive: true })
          await fs.promises.rm(sourcePath, { recursive: true, force: true })
        } else {
          await fs.promises.copyFile(sourcePath, targetPath)
          await fs.promises.unlink(sourcePath)
        }
      }

      return { success: true, newPath: targetPath, isDirectory }
    } catch (error: any) {
      console.error('보관함 저장 실패:', error)
      return { success: false, error: error.message }
    }
  }
)

// 웹 데이터 비동기 저장
ipcMain.handle(
  'stash-data',
  async (_event, buffer: ArrayBuffer, fileName: string) => {
    const stashDir = path.join(app.getPath('userData'), 'MyStash')
    if (!fs.existsSync(stashDir)) fs.mkdirSync(stashDir, { recursive: true })

    const safeFileName = `${Date.now()}_${fileName || 'image.png'}`
    const targetPath = path.join(stashDir, safeFileName)

    try {
      await fs.promises.writeFile(targetPath, Buffer.from(buffer))
      return { success: true, newPath: targetPath }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
)

// 웹 URL 비동기 다운로드
ipcMain.handle('stash-url', async (_event, urlString: string) => {
  const stashDir = path.join(app.getPath('userData'), 'MyStash')
  if (!fs.existsSync(stashDir)) fs.mkdirSync(stashDir, { recursive: true })

  try {
    const response = await fetch(urlString)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const urlObj = new URL(urlString)
    let fileName = path.basename(urlObj.pathname)
    if (!fileName || !fileName.includes('.')) fileName = 'downloaded_image.png'

    const safeFileName = `${Date.now()}_${fileName}`
    const targetPath = path.join(stashDir, safeFileName)

    await fs.promises.writeFile(targetPath, buffer)
    return {
      success: true,
      newPath: targetPath,
      fileName: safeFileName,
      size: buffer.length
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// 🌟 [파일/폴더 꺼내기] 드래그 아웃 버그를 100% 해결하는 완벽한 동기식 핸들러
ipcMain.on('ondragstart', (event, filePath: string) => {
  try {
    // startDrag는 무조건 동기식(Sync) 스레드 내에서 즉시 호출되어야 끊기지 않습니다.
    let dragIcon = nativeImage.createFromPath(filePath)

    // 폴더나 썸네일 생성이 불가능한 파일인 경우 에러 방지용 1x1 투명 픽셀 주입
    // (OS 단에서 실제 드래그 시 마우스 포인터 모양을 알아서 제어해 줍니다.)
    if (dragIcon.isEmpty()) {
      dragIcon = nativeImage.createFromDataURL(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
      )
    } else {
      dragIcon = dragIcon.resize({ width: 64, height: 64 })
    }

    event.sender.startDrag({
      file: filePath,
      icon: dragIcon
    })
  } catch (error) {
    console.error('네이티브 드래그 아웃 실패:', error)
  }
})

// 보관함 비동기 비우기
ipcMain.handle('clear-stash', async () => {
  const stashDir = path.join(app.getPath('userData'), 'MyStash')
  try {
    if (fs.existsSync(stashDir)) {
      const files = await fs.promises.readdir(stashDir)
      for (const file of files) {
        await fs.promises.unlink(path.join(stashDir, file))
      }
    }
    return true
  } catch (error) {
    return false
  }
})

app.on('will-quit', () => {
  clipboardListener.stopListening()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
