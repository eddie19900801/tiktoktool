const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const logic = require('./logic'); // 外部业务逻辑模块

function createWindow () {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      // 指定预加载脚本，启用上下文隔离，安全暴露接口给渲染进程
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(path.join(__dirname, 'public', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  // 注册 IPC 接口

  ipcMain.handle('verify', async (event, data) => {
    return await logic.verify(data);
  });

  ipcMain.handle('openF', async (event, path, dataList) => {
    return await logic.openF(path, dataList);
  });

  ipcMain.handle('open', async (event, data) => {
    return await logic.open(data);
  });

  ipcMain.handle('openVideoFolder', async (event) => {
    return await logic.openVideoFolder();
  });

  ipcMain.handle('update-fingerprint', async (event, id) => {
    return await logic.updateFingerprint(id);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
