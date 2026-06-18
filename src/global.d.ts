export interface IElectronAPI {
  onClipboardChanged: (callback: (text: string) => void) => void
  writeToClipboard: (text: string) => void
  openPath: (path: string) => void
  getFilePath: (file: File) => string
  selectFile: () => Promise<string | null>
  startDrag: (filePath: string) => void
  clearStash: () => Promise<boolean>
  stashFile: (
    sourcePath: string,
    fileName: string
  ) => Promise<{
    success: boolean
    newPath: string
    isDirectory?: boolean
    error?: string
  }>
  stashData: (
    buffer: ArrayBuffer,
    fileName: string
  ) => Promise<{ success: boolean; newPath: string; error?: string }>
  stashUrl: (url: string) => Promise<{
    success: boolean
    newPath: string
    fileName: string
    size: number
    error?: string
  }>
  resizeWindow: (size: 'max' | 'middle' | 'min' | 'mini') => void 
declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
  interface File {
    path: string
  }
}
