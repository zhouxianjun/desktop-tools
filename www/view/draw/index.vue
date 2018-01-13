<template>
    <div id="main" :style="{height: `${windowHeight}px`, background: 'rgba(0, 0, 0, 0.5)'}">
        <div id="draw" class="dl-box">
            <div class="name f-300">{{student['real_name']}}</div>
        </div>
        <audio :src="loopAudio" preload="auto" type="audio/mp3" id="loopAudio"></audio>
        <audio :src='loveAudio' preload="auto" type="audio/mp3" id="loveAudio"></audio>
    </div>
</template>

<script>
    import {ipcRenderer, remote} from 'electron';
    import Common from '../../js/common';
    import loopAudio from '../../audio/loop.mp3';
    import loveAudio from '../../audio/love.mp3';
    import $ from 'jquery';
    export default {
        data() {
            return {
                loopAudio,
                loveAudio,
                student: {},
                timer: null,
                windowHeight: 0
            }
        },
        mounted() {
            this.windowHeight = Common.getWindowHeight();
            $(window).on('click', async e => {
                if (this.timer) return;
                if (e.target.id !== 'main') {
                    await Common.postScoreSingle(this, this.student['student_id'], this.student['real_name']);
                }
                remote.getCurrentWindow().hide();
                this.timer = null;
            });
        },
        created() {
            ipcRenderer.on('draw', () => this.draw());
        },
        methods: {
            draw() {
                if (this.timer) return;
                Common.playAudio('loopAudio').then();
                let draws = Common.todayDraw().map('student').value();
                let students = Common.db('mem').get('students').filter(item => {
                    return !draws.includes(item['student_id']);
                }).value();
                if (!students || students.length < 1) {
                    let user = Common.db('mem').get('user').value();
                    students = Common.db('mem').get('students').value();
                    Common.db().get('draw').remove({class_id: user.classes.classId}).write();
                }
                if (!students || students.length < 1) {
                    remote.dialog.showErrorBox('', '该班级没有学生');
                    remote.getCurrentWindow().hide();
                    return;
                }
                this.timer = setInterval(() => {
                    if (!this.timer) return;
                    this.student = students[Math.floor(Math.random() * students.length + 1) - 1];
                }, 100);
                setTimeout(() => {
                    clearInterval(this.timer);
                    this.timer = null;
                    Common.playAudio('loopAudio', true).then();
                    Common.draw(this.student['student_id'], this.student['real_name']);
                }, 3000);
            }
        }
    }
</script>
<style>
    body {
        background: none;
    }
</style>
<style scoped>
    .dl-box {
        position: absolute;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
        margin: auto;
        width: 100%;
        height: 50%;
        background-color: rgba(3,169,244,0.8);
        color: #fafafa;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .dl-box .name {
        text-align: center;
        font-size: 15rem;
        letter-spacing: 0.25rem;
        font-weight: 600;
    }

    .dl-box p {
        margin-top: 0.5rem;
        text-align: center;
        font-size: 2.4rem;
        letter-spacing: 0.15rem;
    }
</style>