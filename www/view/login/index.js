/**
 * Created by alone on 17-5-11.
 */
"use strict";
import Vue from 'vue';
import Index from './index.vue';
import '../../js/base';

import Form from 'iview/src/components/form';
import FormItem from 'iview/src/components/form-item';
import Icon from 'iview/src/components/icon';
import Input from 'iview/src/components/input';
import Select from 'iview/src/components/select';
import Option from 'iview/src/components/option';
import Button from 'iview/src/components/button';

Vue.component('Form', Form);
Vue.component('FormItem', FormItem);
Vue.component('Icon', Icon);
Vue.component('Input', Input);
Vue.component('Select', Select);
Vue.component('Option', Option);
Vue.component('Button', Button);

new Vue({
    el: '#app',
    render: h => h(Index)
});