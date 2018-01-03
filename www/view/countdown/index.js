/**
 * Created by alone on 17-5-11.
 */
"use strict";
import 'iview/dist/styles/iview.css'; // 使用 CSS
import Vue from 'vue';
import Index from './index.vue';

import Button from 'iview/src/components/button';
import Icon from 'iview/src/components/icon';
Vue.component('Button', Button);
Vue.component('Icon', Icon);

new Vue({
    el: '#app',
    render: h => h(Index)
});