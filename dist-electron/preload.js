let electron = require("electron");
//#region electron/preload.ts
electron.contextBridge.exposeInMainWorld("electronAPI", {
	onClipboardChanged: (callback) => {
		electron.ipcRenderer.on("clipboard-changed", (_event, text) => callback(text));
	},
	writeToClipboard: (text) => {
		electron.ipcRenderer.send("write-clipboard", text);
	},
	openPath: (path) => {
		electron.ipcRenderer.send("open-path", path);
	},
	getFilePath: (file) => electron.webUtils.getPathForFile(file),
	selectFile: () => electron.ipcRenderer.invoke("select-file"),
	stashFile: (sourcePath, fileName) => electron.ipcRenderer.invoke("stash-file", sourcePath, fileName),
	startDrag: (filePath) => electron.ipcRenderer.send("ondragstart", filePath),
	clearStash: () => electron.ipcRenderer.invoke("clear-stash"),
	stashData: (buffer, fileName) => electron.ipcRenderer.invoke("stash-data", buffer, fileName),
	stashUrl: (url) => electron.ipcRenderer.invoke("stash-url", url),
	resizeWindow: (size) => {
		electron.ipcRenderer.send("resize-window", size);
	},
	openExternal: (url) => electron.ipcRenderer.invoke("open-external", url),
	notifyReady: () => electron.ipcRenderer.invoke("renderer:ready"),
	onAuthCallback: (fn) => {
		const listener = (_event, data) => fn(data);
		electron.ipcRenderer.on("auth:callback", listener);
		return () => electron.ipcRenderer.removeListener("auth:callback", listener);
	},
	onAuthError: (fn) => {
		const listener = (_event, data) => fn(data);
		electron.ipcRenderer.on("auth:error", listener);
		return () => electron.ipcRenderer.removeListener("auth:error", listener);
	},
	saveRefreshToken: (token) => electron.ipcRenderer.invoke("auth:save-refresh-token", token),
	getRefreshToken: () => electron.ipcRenderer.invoke("auth:get-refresh-token"),
	clearRefreshToken: () => electron.ipcRenderer.invoke("auth:clear-refresh-token")
});
//#endregion
