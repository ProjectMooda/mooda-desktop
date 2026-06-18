import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
// ESM 환경에서 __dirname을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mainWindow = null;
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1024, // 창의 최소 너비 제한
        minHeight: 768, // 창의 최소 높이 제한
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    if (app.isPackaged) {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
    else {
        mainWindow.loadURL('http://localhost:5173');
    }
    // 디버깅을 위해 개발자 도구 열기 (선택 사항)
    // mainWindow.webContents.openDevTools();
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
app.whenReady().then(createWindow);
// IPC 통신 리스너 (창 크기 조절)
ipcMain.on('resize-window', (_event, size) => {
    if (!mainWindow)
        return;
    if (size === 'max') {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        }
        else {
            mainWindow.maximize();
        }
    }
    else {
        if (mainWindow.isMaximized())
            mainWindow.unmaximize();
        const width = size === 'middle' ? 1440 : 1024;
        const height = size === 'middle' ? 900 : 768;
        mainWindow.setSize(width, height);
        mainWindow.center();
    }
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
