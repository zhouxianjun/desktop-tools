<template>
    <div class="login-box">
        <!-- /.login-logo -->
        <div class="login-box-body">
            <p class="login-box-msg">登录开始您的会话</p>

            <Form ref="loginVo" :model="loginVo" :label-width="80" :rules="loginValidate">
                <Form-item label="用户名" prop="username">
                    <Input v-model="loginVo.username" placeholder="请输入用户名" :disabled="isLogin">
                        <Icon type="ios-person-outline" slot="prepend"></Icon>
                    </Input>
                </Form-item>
                <Form-item label="密码" prop="password">
                    <Input type="password" v-model="loginVo.password" placeholder="请输入密码" :disabled="isLogin">
                        <Icon type="ios-locked-outline" slot="prepend"></Icon>
                    </Input>
                </Form-item>
                <Form-item label="班级">
                    <Select v-model="classes" style="width:200px" :disabled="!isLogin" placement="top">
                        <Option v-for="item in classesList" :value="item.class_id" :key="item.class_id">{{ item.className }}</Option>
                    </Select>
                </Form-item>
                <Form-item>
                    <Button v-show="!isLogin" type="primary" @click="handleLogin">登录</Button>
                    <Button v-show="isLogin" type="primary" @click="handleIn">进入</Button>
                </Form-item>
            </Form>
        </div>
        <!-- /.login-box-body -->
    </div>
    <!-- /.login-box -->
</template>
<script>
    import {ipcRenderer} from 'electron';
    import Common from "../../js/common";
    export default {
        data () {
            return {
                user: null,
                classes: null,
                classesList: [],
                classesMap: new Map(),
                isLogin: false,
                loginVo: {
                    username: 'T17708463939',
                    password: ''
                },
                loginValidate: {
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            handleLogin() {
                this.$refs['loginVo'].validate(async valid => {
                    if (valid) {
                        let loginResult = await this.login();
                        if (loginResult) {
                            this.isLogin = true;
                            this.user = loginResult.user;
                            await this.pullClasses(loginResult.user.id);
                        }
                    } else {
                        this.$Message.error('校验失败!');
                    }
                });
            },
            async handleIn() {
                if (!this.classes) {
                    this.$Notice.error({title: '请选择班级'});
                    return;
                }
                Common.db('mem').set('user', Object.assign({
                    classes: this.classesMap.get(this.classes)
                }, this.user)).write();
                await Common.loadScore(this);
                this.showFloat();
            },
            async login() {
                return await this.fetch('user/login', {
                    method: 'post',
                    data: Common.JSON2URLForm(this.loginVo),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });
            },
            async pullClasses(id) {
                let result = await this.fetch('newTeacher/teachingList', {
                    method: 'post',
                    data: Common.JSON2URLForm({teacherId: id}),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });
                if (!result) return result;
                for (let subject of result) {
                    let textbook = subject['textbook'];
                    if (textbook) {
                        for (let book of textbook) {
                            book.class.forEach(value => {
                                value.classId = value.class_id;
                                value.className = `${subject.subjectName} - ${value.className}`;
                                value.class_id = `${subject.id},${value.class_id}`;
                                value.subject = subject.id;
                                value.textbook = book['textbook_id'];
                                this.classesMap.set(value.class_id, value);
                            });
                            this.classesList.push(...book.class);
                        }
                    }
                }
            },
            showFloat() {
                ipcRenderer.send('showFloat');
            }
        }
    }
</script>

<style scoped>
    .login-box {
        width: 360px;
    }
    .login-box-body {
        background: #fff;
        padding: 20px 20px 5px 20px;
        border-top: 0;
        color: #666;
    }
    .login-box-msg {
        -webkit-app-region: drag;
        margin: 0;
        text-align: center;
        padding: 0 20px 20px 20px;
    }
</style>