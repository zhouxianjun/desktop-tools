"use strict";
import '../../js/base';
import Vue from 'vue';
import Index from './index.vue';

import Icon from 'iview/src/components/icon';
import Layout from 'iview/src/components/layout';
import Content from 'iview/src/components/content';
import Button from 'iview/src/components/button';
import Header from 'iview/src/components/header';

Vue.component('Icon', Icon);
Vue.component('Layout', Layout);
Vue.component('Content', Content);
Vue.component('Button', Button);
Vue.component('Header', Header);

new Vue({
    el: '#app',
    render: h => h(Index)
});