const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getMicrophones: () => ipcRenderer.invoke('get-microphones'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Statistics
  getBarkStats: (timeRange) => ipcRenderer.invoke('get-bark-stats', timeRange),
  
  // Event listeners
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  onToggleDetection: (callback) => ipcRenderer.on('toggle-detection', callback),
  onStopDetection: (callback) => ipcRenderer.on('stop-detection', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});