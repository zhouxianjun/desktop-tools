<template>
    <Layout>
        <Header class="head">
            <Icon type="ribbon-b" class="icon"></Icon>
            <span>选择班级</span>
        </Header>
        <Content class="content">
            <Table stripe :columns="columns" :data="data" height="225"></Table>
        </Content>
    </Layout>
</template>
<script>
    import {ipcRenderer, remote} from 'electron';
    import Common from '../../js/common';
    import $ from 'jquery';
    export default {
        data () {
            return {
                loading: false,
                columns: [{
                    title: '科目',
                    key: 'subjectName'
                }, {
                    title: '班级',
                    key: 'className'
                }, {
                    title: '课程',
                    key: 'bookName'
                }, {
                    title: '年级',
                    key: 'gradeName'
                }, {
                    title: '选择',
                    key: 'action',
                    width: 80,
                    align: 'center',
                    render: (h, params) => {
                        return h('div', [
                            h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                on: {
                                    click: async () => {
                                        await this.selected(params);
                                    }
                                }
                            }, '确定')
                        ]);
                    }
                }],
                data: []
            }
        },
        created() {

        },
        mounted() {
            this.load();
            let height = Common.getWindowHeight();
            $('div.ivu-layout-content').height(height - 72);
        },
        methods: {
            async load() {
                let user = Common.db('mem').get('user').value();
                let result = await this.fetch('newTeacher/teachingList', {
                    method: 'post',
                    data: Common.JSON2URLForm({teacherId: user.id}),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });
                if (!result) return result;
                for (let subject of result) {
                    let textbook = subject['textbook'];
                    if (textbook) {
                        for (let book of textbook) {
                            book.class.forEach(value => {
                                this.data.push({
                                    classId: value.class_id,
                                    className: value.className,
                                    subject: subject.id,
                                    subjectName: subject.subjectName,
                                    bookName: book['textbookName'],
                                    textbook: book['textbook_id'],
                                    gradeName: value.gradeName
                                });
                            });
                        }
                    }
                }
            },

            async selected(item) {
                try {
                    Common.db('mem').set('user.classes', item.row).write();
                    await Common.loadScore(this);
                    ipcRenderer.send('showFloat');
                    remote.getCurrentWindow().destroy();
                } catch (e) {
                    this.loading = false;
                }
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

    .content {
        padding: 1rem;
        width: 100%;
        height: 100%;
    }
</style>