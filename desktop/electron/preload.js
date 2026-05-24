const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("partHuntDesktop", {
  platform: process.platform,
  shell: "electron",
});
