<template>
    <div style="position:relative">
        <div class="h-student f-20 c-b" :class="[selfClass ? selfClass : hasSelect ? 'select' : isClicked ? 'clicked':'', 'borderBlue']"
                @click.stop="add">
            <span class="name">{{student['real_name']}}</span>
            <span @click.stop="sub" class="minusSquare">-</span>
        </div>
        <transition-group enter-active-class="animated tada">
            <div v-show="heartShow === student['student_id'] && isAdd" class="chip-heart c-r0" :key="`addHeart`">
                <Icon type="heart" style="font-size: 8rem;" :style="{color: colors[Math.floor(Math.random() * 7)]}"></Icon>
            </div>
            <div v-show="heartShow === student['student_id'] && !isAdd" class="chip-heart c-r0" :key="`subHeart`" style="color:#e86c60;">
                <Icon type="heart-broken" style="font-size: 7rem;"></Icon>
            </div>
        </transition-group>
    </div>
</template>

<script>
    import Common from '../../js/common';
    export default {
        name: 'student-chip',
        props: {
            selfClass: {type: String, default: ''},
            /** 之前选中过 */
            hasSelect: {
                type: Boolean,
                default: false
            },
            /** 当前被选中 */
            isClicked: {   // 被抽中
                type: Boolean,
                default: false
            },
            student: {
                type: Object
            },
            index: {
                type: Number
            }
        },
        data() {
            return {
                colors: ['#ff2800', '#0016ff', '#ff81ca', '#ff5e7c', '#21ff00', '#ff004d', '#d049ff'],
                heartShow: false,
                isAdd: true
            }
        },
        methods: {
            async add() {
                this.isAdd = true;
                this.clickHandle();
            },
            async sub() {
                this.isAdd = false;
                this.clickHandle();
            },
            async clickHandle() {
                this.$emit(this.isAdd ? 'add' : 'sub', this.student);
                this.heartShow = this.student['student_id'];
                setTimeout(() => this.heartShow = null, 1000);
            }
        }
    }
</script>

<style scoped>

    .h-student .borderBlue {
        border: 3px solid #5CA7CF
    }

    .h-student {
        position: relative;
        width: 4.5rem;
        height: 4.5rem;
        cursor: pointer;
        font-size: 1.2rem;
        text-align: center;
        border-radius: 50%;
        color: #000;
        border: 3px solid #7f7f7f;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 1rem 0.2rem 0rem;
        white-space: nowrap;
    }

    .minusSquare {
        overflow: hidden;
        border: 1px solid #7f7f7f;
        color: #e64d30;
        width: 3rem;
        height: 1.2rem;
        line-height: 0.4rem;
        font-size: 60px;
        background: white;
        border-radius: 10px;
        position: absolute;
        bottom: -0.8rem;
        left: 50%;
        transform: translateX(-50%);
        display: inline-block;
    }

    .select {
        border: 3px solid #5CA7CF
    }

    .clicked {
        border: 5px solid #017f40;
        background: rgb(1, 127, 64);
        color: white !important;
    }

    .h-student-check {
        font-size: 0.7rem;
        position: absolute;
        left: 0rem;
        border-right: 1rem solid transparent;
        top: 0;
    }

    .chip-heart {
        position: absolute;
        color: #dd1d1d;
        width: 6rem;
        height: 6rem;
        line-height: 7.5rem;
        left: -0.6rem;
        top: -1rem;
    }
</style>
