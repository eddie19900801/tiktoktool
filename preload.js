const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  open: (data) => ipcRenderer.invoke('open', data),
  verify: (data) => ipcRenderer.invoke('verify',data),
  openF: (path, dataList) => ipcRenderer.invoke('openF', path, dataList),
  openVideoFolder: () => ipcRenderer.invoke('openVideoFolder'),
  updateFingerprint: (id) => ipcRenderer.invoke('update-fingerprint', id)
});
