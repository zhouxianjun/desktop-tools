<template>
    <Layout>
        <Header class="head">
            <Icon type="ribbon-b" class="icon"></Icon>
            <span>加分</span>
            <Button type="text" class="min-size" icon="minus-round" @click="hide"></Button>
        </Header>
        <Content class="content">
            <div class="group-item" v-for="(group, index) in groups" :key="group.id">
                <div class="group-index" @click="addGroupScore(group)" :style="{background: groupBgColor[index % 8]}" :class="clickGroup === group.id ? 'checked':''">
                    <span v-show="maxGroup === group.id" class="king"></span>
                    <span class="groupName">
                        {{group.name}}
                    </span>
                    <span @click.stop="subGroupScore(group)" class="minusSquare">-</span>
                </div>
                <transition-group enter-active-class="animated tada">
                    <div v-show="showHeart && isAdd && clickGroup === group.id" class="chip-heart c-r0" :key="`addGroup`">
                        <Icon type="heart" style="font-size: 10rem;" :style="{color: colors[Math.floor(Math.random() * 7)]}"></Icon>
                    </div>
                    <div v-show="showHeart && !isAdd && clickGroup === group.id" class="chip-heart c-r0" :key="`subGroup`" style="color:#e86c60;">
                        <Icon type="heart-broken" style="font-size: 8rem;"></Icon>
                    </div>
                </transition-group>
                <div class="group-score f-30 c-a"><p class="c-r0">{{groupScoreMap.get(group.id)}}</p></div>
                <div class="studentBox">
                    <student-chip
                            class="mid-student-chip f-20"
                            @add="addStudentScore"
                            @sub="subStudentScore"
                            v-for="student in group.student"
                            :key="student['student_id']"
                            :student="student"
                            :index='index'
                            :hasSelect="clickStudent['student_id'] !== student['student_id'] && draws.includes(student['student_id'])"
                            :isClicked="clickStudent && clickStudent['student_id'] === student['student_id']">
                    </student-chip>
                </div>
            </div>
        </Content>
        <audio :src='heartBrokenAudio' preload="auto" type="audio/mp3" id="heartBrokenAudio"></audio>
        <audio :src='loveAudio' preload="auto" type="audio/mp3" id="loveAudio"></audio>
    </Layout>
</template>
<script>
    import {ipcRenderer, remote} from 'electron';
    import Common from '../../js/common';
    import $ from 'jquery';
    import StudentChip from './studentChip.vue';
    import heartBrokenAudio from '../../audio/heart-broken.mp3';
    import loveAudio from '../../audio/love.mp3';
    export default {
        data () {
            return {
                heartBrokenAudio,
                loveAudio,
                showHeart: false,
                groups: [],
                groupScoreMap: new Map(),
                isAdd: true,//是否是增加 group
                clickStudent: {},
                clickGroup: -1,
                draws: {},//抽签选中的人
                classId: null,
                maxGroup: -1,
                colors: ['#ff2800', '#0016ff', '#ff81ca', '#ff5e7c', '#21ff00', '#ff004d', '#d049ff'],
                groupBgColor: ['#db7eee','#fe6f6f','#2dcc70','#5bbefe','#ff9e4b','#7ddfc6','#2d96cf','#145CB9','#FECD52']
            }
        },
        created() {
            ipcRenderer.on('score', () => this.load());
        },
        mounted() {
            this.load();
            let height = Common.getWindowHeight();
            $('div.ivu-layout-content').height(height - 72);
        },
        methods: {
            addGroupScore(group) {
                this.isAdd = true;
                this.clickHandle(group);
            },

            subGroupScore(group) {
                this.isAdd = false;
                this.clickHandle(group);
            },

            async addStudentScore(student) {
                this.clickStudent = student;
                await Common.postScoreSingle(this, student['student_id'], student['real_name']);
            },
            async subStudentScore(student) {
                this.clickStudent = student;
                await Common.postScoreSingle(this, student['student_id'], student['real_name'], 0);
            },

            async clickHandle(group) {
                this.clickGroup = group.id;
                this.showHeart = true;
                setTimeout(() => this.showHeart = false, 1000);
                await Common.postScoreGroup(this, group.id, this.isAdd ? 1 : 0);
            },

            async load() {
                let result = await Common.loadScore(this);
                this.groups = [];
                this.groups.push(...result['in_group']);
                this.groups.push(...result['un_group']);
                this.sumGroupScore();
                this.calcMaxGroup();
                this.reloadDraw();
            },

            sumGroupScore() {
                this.groupScoreMap.clear();
                for (let group of this.groups) {
                    for (let student of group.student) {
                        this.groupScoreMap.set(group.id, (this.groupScoreMap.get(group.id) || 0) + student.add + student.subtract);
                    }
                }
            },

            calcMaxGroup() {
                let max = 0;
                let maxId = -1;
                for (let [id, score] of this.groupScoreMap) {
                    if (max < score) {
                        max = score;
                        maxId = id;
                    }
                }
                this.maxGroup = maxId;
            },

            hide() {
                remote.getCurrentWindow().hide();
            },

            reloadDraw() {
                this.draws = Common.todayDraw().map('student').value();
            }
        },
        components: {
            StudentChip
        }
    }
</script>

<style>
    body {
        background: none;
    }
</style>
<style scoped>
    .head {
        -webkit-app-region: drag;
        color: white;
        height: 38px;
        line-height: 38px;
        padding: 0 20px 0 5px;
        font-size: 20px;
    }
    .head span {
        width: auto;
    }
    .icon {
        float: left;
        line-height: 38px;
        margin-right: 10px;
    }
    .content {
        overflow: auto;
        border: 1px solid #dddee1;
    }
    .min-size {
        float: right;
        -webkit-app-region: no-drag;
        font-size: 16px;
        color: white;
    }
    .mid-student-chip {
        display: inline-flex;
        line-height: 3.2rem;
        border-radius: 0.25rem;
        cursor: pointer;
        margin: 0.5rem;
        font-size: 1.2rem;
    }

    .content {
        padding: 1rem;
        width: 100%;
        height: 100%;
    }

    .studentBox {
        width: 100%;
        padding-left: 10rem;
    }

    .group-item {
        width: 100%;
        margin-top: 1.5rem;
    }

    .group-index {
        position: relative;
        float: left;
        width: 5rem;
        height: 5rem;
        cursor: pointer;
        font-size: 1.2rem;
        text-align: center;
        border-radius: 50%;
        color: #000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .group-index span.groupName {
        border-top: 1px solid #7f7f7f;
        border-bottom: 1px solid #7f7f7f;
        width: 95%;
        color: white;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .group-index .king {
        width: 4.5rem;
        height: 2.5rem;
        position: absolute;
        top: -1.4rem;
        background: url("../../img/king.png");
        background-size: 100% 100%;
    }


    .group-index i {
        text-align: center;
        height: 3rem;
        line-height: 1.5rem;
    }

    .checked {
        background: rgba(126, 211, 33, 0.15);
        border: 0.05rem solid #7ED321;
    }


    .group-score {
        float: left;
        height: 3rem;
        width: 2.5rem;
        font-size: 2.2rem;
        font-weight: bold;
        text-align: center;
        color: #AAAAAA;
        margin-top: 1.5rem;
    }

    .minusSquare {
        overflow: hidden;
        border: 1px solid #7f7f7f;
        color: #e64d30;
        position: absolute;
        bottom: -0.6rem;
        left: 50%;
        transform: translateX(-50%);
        width: 3rem;
        height: 1.2rem;
        line-height: 0.4rem;
        font-size: 60px;
        background: white;
        border-radius: 10px;
    }


    .group-score p {
        color: #D0011B;
        margin-left: 0.5rem;
    }

    .chip-heart {
        position: absolute;
        color: #dd1d1d;
        width: 7.5rem;
        height: 7.5rem;
        line-height: 7.5rem;
        margin-top: -2rem;
        z-index: 10;
    }
</style>