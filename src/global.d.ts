export interface AuthCallbackPayload {
  accessToken: string | null
  refreshToken: string | null // 🌟 [추가]
  userId: string | null
  email: string | null
}

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
  stashUrl: (
    url: string
  ) => Promise<{
    success: boolean
    newPath: string
    fileName: string
    size: number
    error?: string
  }>
  resizeWindow: (size: 'max' | 'middle' | 'min' | 'mini') => void

  openExternal: (url: string) => Promise<void>
  notifyReady: () => Promise<void>
  onAuthCallback: (fn: (data: AuthCallbackPayload) => void) => () => void
  onAuthError: (fn: (data: { message: string }) => void) => () => void

  // 🌟 [추가] 타입 선언
  saveRefreshToken: (token: string) => Promise<void>
  getRefreshToken: () => Promise<string | null>
  clearRefreshToken: () => Promise<void>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
  interface File {
    path: string
  }
}
