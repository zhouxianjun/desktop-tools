//引入electron
const electron = require('electron');
const path = require('path');
const {app, BrowserWindow, Tray, Menu} = electron;
const ipc = electron.ipcMain;

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const dbs = {
    db: {
        defaults: {
            draw: [],
            lastLogin: {
                username: '',
                password: ''
            }
        }
    },
    mem: {defaults: {user: {}, students: []}}
};
// 启用CPU渲染（有些机器GPU渲染对悬浮窗不支持）
app.disableHardwareAcceleration();

global.dbs = new Map();

//保持一个全局的窗口对象，可以不显示，如果没有这个对象，窗口点击关闭的时候，js对象会被gc干掉
global.windows = {};

function createMainWindow(){
    global.windows.login = new BrowserWindow({
        width: 370,
        height: 235,
        frame: false,
        resizable: false,
        minimizable: false,
        icon: path.join(__dirname, 'icon', 'logo72x7x.png')
    });
    //加载静态资源
    global.windows.login.loadURL(path.join(__dirname, 'html', 'login.html'));
    global.windows.login.on('closed', () => {
        app.exit();
    });
}
function createFloatWindow() {
    global.windows.float = new BrowserWindow({
        width: 250,
        height: 250,
        maxWidth: 250,
        maxHeight: 250,
        x: electron.screen.getPrimaryDisplay().workAreaSize.width - 300,
        y: electron.screen.getPrimaryDisplay().workAreaSize.height - 350,
        transparent: true,
        // alwaysOnTop: true,
        frame: false,
        resizable: false,
        titleBarStyle: 'hidden',
        skipTaskbar: true,
        show: false,
        minimizable: false,
        closable: false
    });
    global.windows.float.loadURL(path.join(__dirname, 'html', 'float.html'));
    global.windows.float.on('close', (e) => {
        app.quit();
    });
    // 太快设置顶层在某些机器上会导致无法显示
    global.windows.float.once('show', (e) => {
        setTimeout(() => global.windows.float.setAlwaysOnTop(true), 1000);
    });
}
function createTray() {
    global.tray = new Tray(path.join(__dirname, 'icon', 'logo72x7x.png'));
    let contextMenu = Menu.buildFromTemplate([{
        label: '退出',
        click() {
            app.exit();
        }
    }]);
    global.tray.setToolTip('好学区');
    global.tray.setContextMenu(contextMenu);
}

//生命周期的函数定义
//这里好好看api http://electron.atom.io/docs/api/app/
app.on('ready', async () => {
    createTray();
    await initDB();
    createMainWindow();
    createFloatWindow();

    ipc.on('showFloat', async () => {
        global.windows.float.show();
    });
    ipc.on('dialog', async (event, config, url, force = false) => {
        global.windows.dialog = global.windows.dialog || new Map();
        url = require('url').format({
            protocol: 'file',
            slashes: true,
            pathname: path.join(__dirname, 'html', url)
        });
        let dialog;
        if (config.id && global.windows.dialog.has(config.id)) {
            dialog = global.windows.dialog.get(config.id);
        } else {
            if (force === false) {
                for (let d of global.windows.dialog.values()) {
                    if (d.getURL().substring(d.getURL().lastIndexOf('/') + 1) === url.substring(url.lastIndexOf(path.sep) + 1)) {
                        dialog = d;
                        break;
                    }
                }
            }
            if (!dialog) {
                let alwaysOnTop = config.alwaysOnTop || false;
                config.alwaysOnTop = false;
                dialog = new BrowserWindow(Object.assign({
                    frame: false,
                    transparent: true,
                    resizable: false,
                    show: false,
                    closable: false,
                    icon: path.join(__dirname, 'icon', 'logo72x7x.png'),
                    backgroundColor: '#802e2c29'
                }, config));
                dialog.on('closed', () => {
                    global.windows.dialog.delete(dialog._id);
                });
                if (alwaysOnTop === true) {
                    dialog.once('show', (e) => {
                        setTimeout(() => dialog.setAlwaysOnTop(alwaysOnTop), 1000);
                    });
                }
                dialog._id = dialog.id;
                dialog.webContents.on('did-finish-load', () => {
                    dialog.setBackgroundColor('#00000000');
                    dialog.blur();
                    dialog.focus();
                });
                dialog.loadURL(url);
            }
        }
        global.windows.dialog.set(dialog.id, dialog);
        event.returnValue = dialog.id;
        console.log(`display dialog: ${url}`);
    });
    ipc.on('rpc', (event, channel, ...args) => {
        for (let win of global.windows.dialog.values()) {
            win.webContents.send(channel, args);
        }
    });
    ipc.on('toLogin', () => {
        clearDialog();
        global.windows.float.hide();
        global.windows.login.reload();
        global.windows.login.show();
    });
    ipc.on('clearDialog', (e) => {
        clearDialog();
        e.returnValue = true;
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (global.windows.login === null) {
        createMainWindow();
    }
    global.windows.float.show();
});

async function initDB() {
    for(let name in dbs) {
        let file = path.join(app.getPath('userData'), `${name}.json`);
        let adapter = dbs[name].adapter ? dbs[name].adapter(file) : new FileSync(file);
        let value = await low(adapter);
        value.defaults(dbs[name].defaults).write();
        global.dbs.set(name, {file, value, adapter: dbs[name].adapter});
    }
}
function clearDialog() {
    for (let win of global.windows.dialog.values()) {
        win.destroy();
    }
    global.windows.dialog.clear();
}