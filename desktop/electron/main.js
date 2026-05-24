const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("node:path");

const PART_HUNT_URL = "https://parthunt.vercel.app";
const ALLOWED_ORIGINS = new Set([
  "https://parthunt.vercel.app",
  "https://parthunt.firebaseapp.com",
  "https://accounts.google.com",
]);

let mainWindow;

function isInternalUrl(url) {
  try {
    const parsed = new URL(url);
    return ALLOWED_ORIGINS.has(parsed.origin) || parsed.hostname.endsWith(".firebaseapp.com");
  } catch {
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1040,
    minHeight: 720,
    title: "PartHunt AI",
    backgroundColor: "#F7FAFC",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.loadURL(PART_HUNT_URL);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternalUrl(url)) {
      return { action: "allow" };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isInternalUrl(url)) return;
    event.preventDefault();
    shell.openExternal(url);
  });
}

function createMenu() {
  const template = [
    {
      label: "PartHunt AI",
      submenu: [
        { label: "Home", click: () => mainWindow?.loadURL(PART_HUNT_URL) },
        { label: "Search Vehicle", click: () => mainWindow?.loadURL(`${PART_HUNT_URL}/search/vehicle/`) },
        { label: "Search Part Number", click: () => mainWindow?.loadURL(`${PART_HUNT_URL}/search/part-number/`) },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        { label: "Open Web App", click: () => shell.openExternal(PART_HUNT_URL) },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  createMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
