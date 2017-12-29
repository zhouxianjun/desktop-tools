'use strict';
import Vue from 'vue';
import axios from 'axios';
import 'iview/dist/styles/iview.css'; // 使用 CSS
import Notice from 'iview/src/components/notice';
import LoadingBar from 'iview/src/components/loading-bar';
import {ipcRenderer, remote} from 'electron';
const HOST = config.baseURL;
/**
 * 拉取服务器信息
 * @param url
 * @param error
 * @param showError
 * @param config
 * @returns {Promise.<*>}
 */
Vue.prototype.fetch = async (url, config, showError = true, error) => {
    LoadingBar.start();
    let response = null, result = null;
    try {
        response = await axios(url, Object.assign({
            baseURL: HOST
        }, config));
        result = response ? response.data : null;
        if (!response || response.status !== 200 || !result || result.code !== 200) {
            throw new Error(`fetch ${url} data ${JSON.stringify(config)} error`);
        }
        LoadingBar.finish();
        return result.data;
    } catch (err) {
        LoadingBar.error();
        if (result && result.code && result.code === 402) {
            ipcRenderer.send('toLogin');
            return false;
        }
        showError && Notice.error({title: result ? result.msg : '操作失败'});
        console.log(err.stack);
        if (typeof error === 'function') {
            Reflect.apply(error, response, result);
        }
        return false;
    }
};