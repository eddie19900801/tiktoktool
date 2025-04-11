const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  start: () => ipcRenderer.invoke('start'),
  verify: (data) => ipcRenderer.invoke('verify',data),
  openF: (dataList) => ipcRenderer.invoke('openF',dataList),
  openVideoFolder: () => ipcRenderer.invoke('openVideoFolder'),
  updateFingerprint: (id) => ipcRenderer.invoke('update-fingerprint',id)
});
