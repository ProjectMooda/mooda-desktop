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
	getFilePath: (file) => {
		return electron.webUtils.getPathForFile(file);
	},
	selectFile: () => {
		return electron.ipcRenderer.invoke("select-file");
	},
	stashFile: (sourcePath, fileName) => {
		return electron.ipcRenderer.invoke("stash-file", sourcePath, fileName);
	},
	startDrag: (filePath) => {
		electron.ipcRenderer.send("ondragstart", filePath);
	},
	clearStash: () => {
		return electron.ipcRenderer.invoke("clear-stash");
	},
	stashData: (buffer, fileName) => {
		return electron.ipcRenderer.invoke("stash-data", buffer, fileName);
	},
	stashUrl: (url) => {
		return electron.ipcRenderer.invoke("stash-url", url);
	},
	resizeWindow: (size) => electron.ipcRenderer.send("resize-window", size)
});
//#endregion
