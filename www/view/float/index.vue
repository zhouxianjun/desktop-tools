<template>
    <div :class="['float-menu', 'draggable', show ? 'open' : '']">
        <div class="plus" @click="toggle"></div>
        <transition name="fade">
            <div class="menu-list" v-show="this.show">
                <span class="draw" @click="draw"></span>
                <span class="score" @click="score"></span>
                <span class="timer" @click="timer"></span>
                <span class="select-class" @click="selectClass"></span>
            </div>
        </transition>
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
            $('.plus').mousedown(e => {
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
                    height: 165,
                    x: screen.getPrimaryDisplay().workAreaSize.width / 2 - 678 / 2,
                    y: 80,
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
<style>
    body {
        margin: 0;
        padding: 0;
    }
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s
    }
    .fade-enter, .fade-leave-to {
        opacity: 0
    }
</style>
<style scoped>
    * {
        margin: 0;
        padding: 0;
    }

    .float-menu {
        width: 250px;
        height: 250px;
        position: fixed;
        -webkit-app-region: no-drag;
        z-index: 99999;
    }

    .float-menu .plus {
        width: 30%;
        height: 30%;
        left: 35%;
        top: 35%;
        background: url(../../img/l1.png) no-repeat center center;
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

    .float-menu .menu-list span {
        width: 48px;
        height: 48px;
        display: block;
        position: absolute;
        cursor: pointer;
    }
    .float-menu .menu-list span.score {
        left: 15px;
        top: 50%;
        transform: translate(0%, -50%);
        background: url(../../img/score.png) no-repeat;
        background-size: 100%;
    }

    .float-menu .menu-list span.draw {
        background: url(../../img/draw.png) no-repeat;
        background-size: 100%;
        left: 50%;
        top: 15px;
        transform: translate(-50%, 0);
    }
    .float-menu .menu-list span.timer {
        left: 50%;
        bottom: 15px;
        transform: translate(-50%, 0);
        background: url(../../img/timer.png) no-repeat;
        background-size: 100%;
    }
    .float-menu .menu-list span.select-class {
        top: 50%;
        right: 15px;
        background: url(../../img/class.png) no-repeat;
        background-size: 100%;
        transform: translate(0%, -50%);
    }

    .float-menu.open .menu-list span {
        opacity: 1;
    }

    .float-menu.open .menu-list {
        opacity: 1;
        width: 100%;
        height: 100%;
        background-color: #003366;
    }
    .float-menu.open .plus {
        background: url(../../img/l2.png) no-repeat center center;
        background-size: 100%;
    }
    .draggable {
        -webkit-app-region: drag;
    }
    .plus, .float-menu .menu-list span {
        -webkit-app-region: no-drag;
    }
</style>