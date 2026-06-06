const { app, Tray, Menu, Notification, BrowserWindow, ipcMain, nativeImage } = require('electron');
const path = require('path');

let tray = null;
let settingsWindow = null;
let intervalMinutes = 30;
let activeStart = 9;
let activeEnd = 19;
let remaining = 0;
let tickInterval = null;

function isActiveTime() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= activeStart && hour < activeEnd;
}

function updateTrayTitle() {
  if (!tray) return;
  if (!isActiveTime()) {
    tray.setTitle(' 비활성');
    return;
  }
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  tray.setTitle(` ${min}:${String(sec).padStart(2, '0')}`);
}

function sendNotification() {
  const notification = new Notification({
    title: '스트레칭 시간!',
    body: '일어나서 스트레칭하고 걸어오세요!',
    silent: true
  });
  notification.show();

  if (process.platform === 'darwin') {
    app.dock.bounce('critical');
  }
}

function startTimer() {
  stopTimer();
  remaining = intervalMinutes * 60;
  updateTrayTitle();

  tickInterval = setInterval(() => {
    if (!isActiveTime()) {
      updateTrayTitle();
      return;
    }
    remaining--;
    if (remaining <= 0) {
      sendNotification();
      remaining = intervalMinutes * 60;
    }
    updateTrayTitle();
  }, 1000);
}

function stopTimer() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

function buildContextMenu() {
  return Menu.buildFromTemplate([
    { label: `⏱ ${intervalMinutes}분 간격 | 활성 ${activeStart}시~${activeEnd}시`, enabled: false },
    { type: 'separator' },
    { label: '타이머 시작', click: () => startTimer() },
    {
      label: '타이머 정지',
      click: () => { stopTimer(); tray.setTitle(' 정지'); }
    },
    { label: '지금 리셋', click: () => startTimer() },
    { type: 'separator' },
    { label: '시간 설정', click: () => openSettings() },
    { type: 'separator' },
    {
      label: '종료',
      click: () => { stopTimer(); app.quit(); }
    }
  ]);
}

function openSettings() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 300,
    height: 300,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  settingsWindow.loadFile('settings.html');
  settingsWindow.webContents.on('did-finish-load', () => {
    settingsWindow.webContents.executeJavaScript('document.body.scrollHeight').then(h => {
      settingsWindow.setContentSize(300, h);
    });
  });
  settingsWindow.on('closed', () => { settingsWindow = null; });
}

ipcMain.on('timer-start', () => { startTimer(); });
ipcMain.on('timer-stop', () => { stopTimer(); tray.setTitle(' 정지'); });

ipcMain.on('set-settings', (event, settings) => {
  intervalMinutes = settings.interval;
  activeStart = settings.activeStart;
  activeEnd = settings.activeEnd;
  tray.setContextMenu(buildContextMenu());
});

ipcMain.handle('get-settings', () => {
  return { interval: intervalMinutes, activeStart, activeEnd };
});

ipcMain.handle('get-running', () => {
  return tickInterval !== null;
});

app.setName('Stretch Timer');

app.whenReady().then(() => {
  let icon = nativeImage.createFromNamedImage('NSImageNameTouchBarAlarmTemplate', [-1, 0, 1]);
  if (!icon.isEmpty()) {
    icon = icon.resize({ width: 16, height: 16 });
    icon.setTemplateImage(true);
  }
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setTitle(' 준비');
  tray.setContextMenu(buildContextMenu());

  app.dock.setIcon(path.join(__dirname, 'icon.png'));

  const dockMenu = Menu.buildFromTemplate([
    { label: '타이머 시작', click: () => startTimer() },
    { label: '타이머 정지', click: () => { stopTimer(); tray.setTitle(' 정지'); } },
    { label: '시간 설정', click: () => openSettings() }
  ]);
  app.dock.setMenu(dockMenu);

  startTimer();
});

app.on('activate', () => { openSettings(); });
app.on('window-all-closed', (e) => { e.preventDefault(); });
