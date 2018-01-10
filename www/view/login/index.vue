<template>
    <div class="login-box">
        <!-- /.login-logo -->
        <div class="login-box-body">
            <p class="login-box-msg">登录开始您的会话</p>
            <Button type="text" icon="close" class="close" @click="close"></Button>
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
                <Form-item>
                    <Button type="primary" @click="handleLogin" :loading="isLogin">登录</Button>
                </Form-item>
            </Form>
        </div>
        <!-- /.login-box-body -->
    </div>
    <!-- /.login-box -->
</template>
<script>
    import {ipcRenderer, remote} from 'electron';
    import Common from "../../js/common";
    export default {
        data () {
            return {
                user: null,
                isLogin: false,
                loginVo: {
                    username: '',
                    password: '',
                    desktop: true
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
        mounted() {
            let lastLogin = Common.db().get('lastLogin').value();
            if (lastLogin) {
                Reflect.ownKeys(this.loginVo).forEach(key => Reflect.has(lastLogin, key) && (this.loginVo[key] = lastLogin[key]));
            }
        },
        methods: {
            handleLogin() {
                this.$refs['loginVo'].validate(async valid => {
                    if (valid) {
                        this.isLogin = true;
                        let loginResult = await this.login();
                        if (loginResult) {
                            this.user = loginResult.user;
                            Common.db().set('lastLogin', this.loginVo).write();
                            Common.db('mem').set('user', this.user).write();
                            this.selectClass();
                        } else {
                            this.isLogin = false;
                        }
                    } else {
                        this.$Message.error('校验失败!');
                    }
                });
            },
            selectClass() {
                Common.openDialog('select-class.html', {
                    title: '选择班级',
                    width: 600,
                    height: 300,
                    show: true
                });
                remote.getCurrentWindow().hide();
            },
            async login() {
                return await this.fetch('user/login', {
                    method: 'post',
                    data: Common.JSON2URLForm(this.loginVo),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });
            },
            close() {
                remote.getCurrentWindow().destroy();
            }
        }
    }
</script>

<style scoped>
    .close {
        position: absolute;
        right: 10px;
        top: 10px;
        -webkit-app-region: no-drag;
    }
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