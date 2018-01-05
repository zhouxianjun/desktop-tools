<template>
    <div :class="['float-menu', 'draggable', show ? 'open' : '']">
        <div class="plus" @click="toggle"></div>
        <div class="menu-list">
            <a class="score" @click="score">加分</a>
            <a class="draw" @click="draw">抽签</a>
            <a class="timer" @click="timer">计时器</a>
            <a class="select-class" @click="selectClass">班级</a>
        </div>
    </div>
</template>
<script>
    import {ipcRenderer, remote, screen} from 'electron';
    import Common from '../../js/common';
    import $ from 'jquery';

    export default {
        data() {
            return {
                show: false,
                dragging: false,
                isMove: false,
                x: null,
                y: null
            }
        },
        async mounted() {
            $('.draggable').mousedown(e => {
                this.dragging = true;
                this.x = e.pageX;
                this.y = e.pageY;
            });

            $(window).mousemove(e => {
                e.stopPropagation();
                e.preventDefault();
                if (this.dragging) {
                    this.isMove = true;
                    let xLoc = e.screenX - this.x;
                    let yLoc = e.screenY - this.y;

                    try {
                        remote.BrowserWindow.getFocusedWindow().setPosition(xLoc, yLoc);
                    } catch (err) {
                        console.log(err);
                    }
                }
            });

            $(window).mouseup(() => {
                this.dragging = false;
                this.isMove = false;
            });
        },
        methods: {
            toggle() {
                this.show = !this.show;
            },
            score() {
                this.show = false;
                let win = Common.openDialog('score.html', {
                    title: '加分'
                });
                this.toggleDialog(win);
            },
            draw() {
                this.show = false;
                let win = Common.openDialog('draw.html', {
                    title: '抽签',
                    width: screen.getPrimaryDisplay().workAreaSize.width,
                    height: screen.getPrimaryDisplay().workAreaSize.height,
                    alwaysOnTop: true
                });
                win.on('show', () => {
                    ipcRenderer.send('rpc', 'draw');
                });
                this.toggleDialog(win);
            },
            timer() {
                this.show = false;
                let win = Common.openDialog('countdown.html', {
                    title: '倒计时',
                    width: 678,
                    height: 150,
                    x: screen.getPrimaryDisplay().workAreaSize.width / 2 - 678 / 2,
                    y: 60,
                    alwaysOnTop: true
                });
                this.toggleDialog(win);
            },
            selectClass() {
                this.show = false;
                ipcRenderer.sendSync('clearDialog');
                Common.openDialog('select-class.html', {
                    title: '选择班级',
                    width: 600,
                    height: 300,
                    show: true
                });
                remote.getCurrentWindow().hide();
            },
            toggleDialog(dialog) {
                if (dialog.isVisible()) {
                    dialog.hide();
                } else {
                    dialog.show();
                }
            }
        }
    }
</script>
<style scoped>
    * {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .float-menu {
        width: 50px;
        height: 50px;
        position: fixed;
        -webkit-app-region: no-drag;
        z-index: 99999;
        left: 50px;
        top: 50px;
    }

    .float-menu div {
        transition: all 0.2s linear;
    }

    .float-menu .plus {
        width: 100%;
        height: 100%;
        background: url(../../img/logo96.png) no-repeat center center;
        background-size: 100%;
        z-index: 2;
        position: absolute;
    }

    .float-menu .menu-list {
        opacity: 0;
        width: 100%;
        height: 100%;
        border-radius: 100%;
        z-index: 1;
        left: 0;
        top: 0;
        position: absolute;
    }

    .float-menu .menu-list a {
        width: 33%;
        height: 16%;
        display: block;
        text-align: center;
        padding-top: 17%;
        opacity: 0;
        color: #333;
        font-size: 12px;
        text-decoration: none;
        position: absolute;
        cursor: pointer;
    }

    .float-menu .menu-list a.score {
        left: 50%;
        top: 0;
        transform: translate(-50%, 0);
        /*background: url(../images/icon_home.png) no-repeat center 5px;*/
        background-size: 50%;
    }

    .float-menu .menu-list a.draw {
        transform: translate(0%, -50%);
        /*background: url(../images/icon_me.png) no-repeat center top;*/
        background-size: 50%;
        left: 0;
        top: 50%;
    }

    .float-menu .menu-list a.timer {
        left: 50%;
        bottom: 0;
        transform: translate(-50%, 0);
        /*background: url(../images/icon_cart.png) no-repeat center top;*/
        background-size: 50%;
    }

    .float-menu .menu-list a.select-class {
        right: 0;
        top: 50%;
        transform: translate(0%, -50%);
        /*background: url(../images/icon_cart.png) no-repeat center top;*/
        background-size: 50%;
    }

    .float-menu.open .menu-list a {
        opacity: 1;
        font-size: 12px;
    }

    .float-menu.open .menu-list {
        opacity: 1;
        width: 300%;
        height: 300%;
        left: -100%;
        top: -100%;
        background-color: rgba(255, 232, 78, .7);
    }
</style>