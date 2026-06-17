import { BrowserWindow, app, clipboard, dialog, ipcMain, nativeImage, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import fs from "fs";
//#region electron/main.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var clipboardListener = createRequire(import.meta.url)("clipboard-event");
var mainWindow = null;
var lastCopiedText = clipboard.readText();
var isWatcherStarted = false;
function startClipboardWatcher(win) {
	if (isWatcherStarted) return;
	isWatcherStarted = true;
	clipboardListener.startListening();
	clipboardListener.on("change", () => {
		const currentText = clipboard.readText();
		if (currentText && currentText.trim() !== "" && currentText !== lastCopiedText) {
			lastCopiedText = currentText;
			win.webContents.send("clipboard-changed", currentText);
		}
	});
}
function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1440,
		height: 900,
		minWidth: 1024,
		minHeight: 768,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
			webSecurity: app.isPackaged ? true : false
		}
	});
	if (app.isPackaged) mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
	else mainWindow.loadURL("http://localhost:5173");
	mainWindow.webContents.on("did-finish-load", () => {
		startClipboardWatcher(mainWindow);
	});
}
app.whenReady().then(createWindow);
ipcMain.on("resize-window", (_event, size) => {
	if (!mainWindow) return;
	if (size === "max") {
		mainWindow.setMinimumSize(1024, 768);
		if (mainWindow.isMaximized()) mainWindow.unmaximize();
		else mainWindow.maximize();
	} else if (size === "mini") {
		if (mainWindow.isMaximized()) mainWindow.unmaximize();
		mainWindow.setMinimumSize(400, 600);
		mainWindow.setSize(420, 700);
		mainWindow.setAlwaysOnTop(true);
		mainWindow.center();
	} else {
		if (mainWindow.isMaximized()) mainWindow.unmaximize();
		mainWindow.setAlwaysOnTop(false);
		mainWindow.setMinimumSize(1024, 768);
		const width = size === "middle" ? 1440 : 1024;
		const height = size === "middle" ? 900 : 768;
		mainWindow.setSize(width, height);
		mainWindow.center();
	}
});
ipcMain.on("write-clipboard", (_event, text) => {
	lastCopiedText = text;
	clipboard.writeText(text);
});
ipcMain.handle("select-file", async () => {
	const result = await dialog.showOpenDialog({ properties: ["openFile", "openDirectory"] });
	if (result.canceled) return null;
	return result.filePaths[0];
});
ipcMain.on("open-path", async (_event, filePath) => {
	try {
		await shell.openPath(filePath);
	} catch (error) {
		console.error("파일을 열 수 없습니다:", error);
	}
});
ipcMain.handle("stash-file", async (_event, sourcePath, fileName) => {
	const stashDir = path.join(app.getPath("userData"), "MyStash");
	if (!fs.existsSync(stashDir)) fs.mkdirSync(stashDir, { recursive: true });
	const safeFileName = `${Date.now()}_${fileName}`;
	const targetPath = path.join(stashDir, safeFileName);
	try {
		const isDirectory = (await fs.promises.stat(sourcePath)).isDirectory();
		await new Promise((resolve) => setTimeout(resolve, 200));
		try {
			await fs.promises.rename(sourcePath, targetPath);
		} catch (renameError) {
			if (isDirectory) {
				await fs.promises.cp(sourcePath, targetPath, { recursive: true });
				await fs.promises.rm(sourcePath, {
					recursive: true,
					force: true
				});
			} else {
				await fs.promises.copyFile(sourcePath, targetPath);
				await fs.promises.unlink(sourcePath);
			}
		}
		return {
			success: true,
			newPath: targetPath,
			isDirectory
		};
	} catch (error) {
		console.error("보관함 저장 실패:", error);
		return {
			success: false,
			error: error.message
		};
	}
});
ipcMain.handle("stash-data", async (_event, buffer, fileName) => {
	const stashDir = path.join(app.getPath("userData"), "MyStash");
	if (!fs.existsSync(stashDir)) fs.mkdirSync(stashDir, { recursive: true });
	const safeFileName = `${Date.now()}_${fileName || "image.png"}`;
	const targetPath = path.join(stashDir, safeFileName);
	try {
		await fs.promises.writeFile(targetPath, Buffer.from(buffer));
		return {
			success: true,
			newPath: targetPath
		};
	} catch (error) {
		return {
			success: false,
			error: error.message
		};
	}
});
ipcMain.handle("stash-url", async (_event, urlString) => {
	const stashDir = path.join(app.getPath("userData"), "MyStash");
	if (!fs.existsSync(stashDir)) fs.mkdirSync(stashDir, { recursive: true });
	try {
		const arrayBuffer = await (await fetch(urlString)).arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const urlObj = new URL(urlString);
		let fileName = path.basename(urlObj.pathname);
		if (!fileName || !fileName.includes(".")) fileName = "downloaded_image.png";
		const safeFileName = `${Date.now()}_${fileName}`;
		const targetPath = path.join(stashDir, safeFileName);
		await fs.promises.writeFile(targetPath, buffer);
		return {
			success: true,
			newPath: targetPath,
			fileName: safeFileName,
			size: buffer.length
		};
	} catch (error) {
		return {
			success: false,
			error: error.message
		};
	}
});
ipcMain.on("ondragstart", (event, filePath) => {
	try {
		let dragIcon = nativeImage.createFromPath(filePath);
		if (dragIcon.isEmpty()) dragIcon = nativeImage.createFromDataURL("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=");
		else dragIcon = dragIcon.resize({
			width: 64,
			height: 64
		});
		event.sender.startDrag({
			file: filePath,
			icon: dragIcon
		});
	} catch (error) {
		console.error("네이티브 드래그 아웃 실패:", error);
	}
});
ipcMain.handle("clear-stash", async () => {
	const stashDir = path.join(app.getPath("userData"), "MyStash");
	try {
		if (fs.existsSync(stashDir)) {
			const files = await fs.promises.readdir(stashDir);
			for (const file of files) await fs.promises.unlink(path.join(stashDir, file));
		}
		return true;
	} catch (error) {
		return false;
	}
});
app.on("will-quit", () => {
	clipboardListener.stopListening();
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
	if (mainWindow === null) createWindow();
});
//#endregion
export {};
