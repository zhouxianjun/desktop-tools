<template>
    <div class="main">
        <div class="countdown"></div>
        <div class="control">
            <Button class="btn" type="text" icon="minus-round" @click="min"></Button>
            <Icon class="drag" type="arrow-move"></Icon>
            <Button class="btn" v-show="!start" type="text" icon="play" @click="play"></Button>
            <Button class="btn" v-show="start" type="text" icon="stop" @click="stop"></Button>
        </div>
        <audio :src='timerAudio' preload="auto" type="audio/mp3" id="timerAudio"></audio>
    </div>
</template>
<script>
    import {ipcRenderer, remote, screen} from 'electron';
    import Common from '../../js/common';
    import $ from 'jquery';
    import '../../jcountdown/jcountdown.css';
    import '../../jcountdown/jquery.jcountdown.min';
    import timerAudio from '../../audio/timer.mp3';
    const NUMBER_POSITION = 60;

    export default {
        data() {
            return {
                timerAudio,
                start: false,
                timer: {
                    minute: {max: 59, value: 0},
                    second: {max: 59, value: 0}
                },
                audioTimer: null,
                config: {
                    color: "black",
                    dayTextNumber: 3,
                    displayDay: false,
                    displayHour: false,
                    displayLabel: false,
                    displayMinute: true,
                    displaySecond: true,
                    reflection: false,
                    reflectionBlur: 0,
                    reflectionOpacity: 10,
                    style: "metal",
                    textGroupSpace: 15,
                    textSpace: 0,
                    timeText: null,
                    timeZone: 8,
                    width: 600,
                    onFinish: this.stop
                }
            }
        },
        async mounted() {
            this.reset();
            $('.countdown').jCountdown('stop');
            this.listener();
        },
        methods: {
            min() {
                remote.getCurrentWindow().hide();
            },
            play() {
                this.start = true;
                this.reset();
                let timeout = (this.timer.minute.value * 60 + this.timer.second.value - 10) * 1000;
                this.audioTimer = setTimeout(() => {
                    Common.playAudio('timerAudio').then();
                }, timeout > 0 ? timeout : 0);
                $('.countdown').jCountdown('start');
            },
            stop() {
                clearTimeout(this.audioTimer);
                Common.playAudio('timerAudio', true).then();
                $('.countdown').jCountdown('stop');
                this.clear();
                if (!this.start) return;
                this.start = false;
                this.reset();
                this.listener();
            },
            check($2, parent, num) {
                for (let key in this.timer) {
                    if (parent.hasClass(key)) {
                        let str = `${this.timer[key].value}`;
                        str = str.length === 1 ? `0${str}` : str;
                        let value = parseInt($2.parent().hasClass('lastItem') ? `${str[0]}${num}` : `${num}${str[1]}`);
                        if (value <= this.timer[key].max) {
                            this.timer[key].value = value;
                            return true;
                        }
                        return false;
                    }
                }
                return false;
            },
            reset() {
                for (let key in this.timer) {
                    if (this.timer[key].value > this.timer[key].max) {
                        return false;
                    }
                }
                let time = Date.now() + (this.timer.minute.value * 60 + this.timer.second.value) * 1000;
                this.config.timeText = new Date(time).Format('yyyy/MM/dd hh:mm:ss');
                console.log(this.config.timeText);
                $('.countdown').jCountdown(this.config);
            },
            clear() {
                for (let key in this.timer) {
                    this.timer[key].value = 0;
                }
                for (let dom of $('.countdown .group .container .text')) {
                    $(dom).data('num', 0);
                }
            },
            listener() {
                $('.container').on('click', (e) => {
                    console.log(e);
                    if (this.start) return;
                    let $2 = $(e.target);
                    if ($2.hasClass('text')) {
                        let num = $2.data('num') || 0;
                        num++;
                        if (num > 9) num = 0;
                        let parent = $2.parents('.group');
                        let check = this.check($2, parent, num);
                        if (!check) num = 0;
                        $2.data('num', num);
                        $2.css('background-position', `0px -${num * NUMBER_POSITION}px`);
                    }
                });
            }
        }
    }
</script>

<style>
    body {
        background: none;
    }
    .container {
        -webkit-app-region: no-drag;
        box-sizing: content-box;
    }
    .control .btn .ivu-icon {
        font-size: 3em;
    }
</style>
<style scoped>
    .countdown {
        float: left;
    }
    .control {
        float: right;
        background: #2c2c2c;
        padding: 10px;
        border-radius: 10px;
        height: 140px;
        margin-top: 5px;
        width: 60px;
    }
    .control .drag {
        -webkit-app-region: drag;
        font-size: 3em;
        padding-left: 3px;
    }
    .control .btn {
        vertical-align: inherit;
        padding: 0 5px;
    }
</style>