import { BrowserWindow, app, clipboard, dialog, ipcMain, nativeImage, safeStorage, shell } from "electron";
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
var pendingDeepLink = null;
var rendererReady = false;
var isDev = !app.isPackaged;
if (isDev && process.platform === "win32") app.setAsDefaultProtocolClient("mooda", process.execPath, [path.resolve(process.argv[1])]);
else app.setAsDefaultProtocolClient("mooda");
if (!app.requestSingleInstanceLock()) {
	app.quit();
	process.exit(0);
}
app.on("second-instance", (_event, argv) => {
	const deepLink = argv.find((arg) => arg.startsWith("mooda://"));
	if (deepLink) handleDeepLink(deepLink);
	if (mainWindow) {
		if (mainWindow.isMinimized()) mainWindow.restore();
		mainWindow.focus();
	}
});
app.on("open-url", (event, url) => {
	event.preventDefault();
	handleDeepLink(url);
});
function handleDeepLink(url) {
	if (!mainWindow) return;
	try {
		const parsed = new URL(url);
		if (parsed.host === "auth" && parsed.pathname.includes("/callback")) {
			const payload = {
				accessToken: parsed.searchParams.get("accessToken"),
				refreshToken: parsed.searchParams.get("refreshToken"),
				userId: parsed.searchParams.get("userId"),
				email: parsed.searchParams.get("email")
			};
			if (rendererReady && mainWindow) mainWindow.webContents.send("auth:callback", payload);
			else pendingDeepLink = payload;
		}
		if (parsed.host === "auth" && parsed.pathname.includes("/error")) {
			const message = parsed.searchParams.get("message") ?? "알 수 없는 오류";
			mainWindow.webContents.send("auth:error", { message });
		}
	} catch (e) {
		console.error("URL 파싱 실패:", url, e);
	}
}
ipcMain.handle("renderer:ready", () => {
	rendererReady = true;
	if (pendingDeepLink && mainWindow) {
		mainWindow.webContents.send("auth:callback", pendingDeepLink);
		pendingDeepLink = null;
	}
});
var rtPath = path.join(app.getPath("userData"), "rt.bin");
ipcMain.handle("auth:save-refresh-token", (_event, token) => {
	if (safeStorage.isEncryptionAvailable()) {
		const encrypted = safeStorage.encryptString(token);
		fs.writeFileSync(rtPath, encrypted);
	}
});
ipcMain.handle("auth:get-refresh-token", () => {
	try {
		if (!fs.existsSync(rtPath) || !safeStorage.isEncryptionAvailable()) return null;
		const encrypted = fs.readFileSync(rtPath);
		return safeStorage.decryptString(Buffer.from(encrypted));
	} catch {
		return null;
	}
});
ipcMain.handle("auth:clear-refresh-token", () => {
	try {
		if (fs.existsSync(rtPath)) fs.unlinkSync(rtPath);
	} catch {}
});
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
	if (isDev) mainWindow.loadURL("http://localhost:5173");
	else mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
	mainWindow.webContents.on("did-finish-load", () => {
		startClipboardWatcher(mainWindow);
	});
	mainWindow.on("closed", () => {
		mainWindow = null;
		rendererReady = false;
	});
}
app.whenReady().then(() => {
	createWindow();
	const deepLink = process.argv.find((arg) => arg.startsWith("mooda://"));
	if (deepLink) mainWindow?.webContents.once("did-finish-load", () => handleDeepLink(deepLink));
});
ipcMain.handle("open-external", (_event, url) => shell.openExternal(url));
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
	} catch (error) {}
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
		} catch {
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
		const response = await fetch(urlString);
		const buffer = Buffer.from(await response.arrayBuffer());
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
	} catch {}
});
ipcMain.handle("clear-stash", async () => {
	const stashDir = path.join(app.getPath("userData"), "MyStash");
	try {
		if (fs.existsSync(stashDir)) {
			const files = await fs.promises.readdir(stashDir);
			for (const file of files) await fs.promises.unlink(path.join(stashDir, file));
		}
		return true;
	} catch {
		return false;
	}
});
app.on("will-quit", () => clipboardListener.stopListening());
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
	if (mainWindow === null) createWindow();
});
//#endregion
export {};
