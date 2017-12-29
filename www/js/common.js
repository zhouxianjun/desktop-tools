import {ipcRenderer, remote} from 'electron';
import $ from 'jquery';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

const DBS = new Map();

class Common {
    static getDialog(id) {
        let dialog = remote.getGlobal('windows').dialog;
        if (!dialog) return null;
        return dialog.get(id);
    }
    static getWindowHeight() {
        let winHeight = 0;
        if (window.innerHeight){
            winHeight = window.innerHeight;
        }else if ((document.body) && (document.body.clientHeight)){
            winHeight = document.body.clientHeight;
        }
        return winHeight;
    }
    static async playAudio(id, stop) {
        let $2 = $(`#${id}`);
        if (!$2) return;
        let el = $2[0];
        el.currentTime = 0;
        stop || await el.play();
        stop && await el.pause();
    }

    static db(name = 'db') {
        if (DBS.has(name)) return DBS.get(name);
        let dbs = remote.getGlobal('dbs');
        if (!dbs) return null;
        let value = dbs.get(name);
        let adapter = name === 'mem' ? null : new FileSync(value.file);
        let db = name === 'mem' ? value.value : low(adapter);
        DBS.set(name, db);
        return db;
    }

    static todayDraw() {
        let user = Common.db('mem').get('user').value();
        let today = new Date(new Date().toLocaleDateString()).getTime();
        return Common.db().get('draw').filter(item => {
            return item.date >= today && item.class_id === user.classes.classId;
        });
    }

    static draw(student, name) {
        let user = Common.db('mem').get('user').value();
        let draw = Common.db().get('draw');
        let has = draw.find({student}).value();
        if (!has) {
            draw.push({
                student,
                name,
                class_id: user.classes.classId,
                date: Date.now()
            }).write();
        }
    }

    static async postScoreSingle(vue, student, name, type = 1) {
        let user = Common.db('mem').get('user').value();
        await Common.playAudio(type === 1 ? 'loveAudio' : 'heartBrokenAudio');
        let result = await vue.fetch('score/give/single/system', {
            method: 'post',
            data: {
                user_id: student,
                item_id: 1,
                from_user_id: user.id,
                subject_id: user.classes.subject,
                class_id: user.classes.classId,
                type: type
            }
        });
        if (result) {
            Common.draw(student, name);
            ipcRenderer.send('rpc', 'score');
        }
    }

    static async postScoreGroup(vue, group, type = 1) {
        let user = Common.db('mem').get('user').value();
        await Common.playAudio(type === 1 ? 'loveAudio' : 'heartBrokenAudio');
        let result = await vue.fetch('score/give/group/system', {
            method: 'post',
            data: {
                group_id: group,
                item_id: 1,
                user_id: user.id,
                type: type
            }
        });
        if (result) {
            ipcRenderer.send('rpc', 'score');
        }
    }

    static JSON2URLForm(json) {
        let data = new URLSearchParams();
        Reflect.ownKeys(json).filter(key => {return !key.startsWith('_')}).forEach(key => data.append(key, json[key]));
        return data;
    }

    static makeScoreParams() {
        let user = Common.db('mem').get('user').value();
        return {
            class_id: user.classes.classId,
            teacher_id: user.id,
            subject_id: user.classes.subject,
            item_id: 1,
            today: true
        }
    }

    static async loadScore(vue) {
        let result = await vue.fetch('score/pull/list', {
            method: 'post',
            data: Common.JSON2URLForm(Common.makeScoreParams()),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
        Common.saveAllStudent(result);
        return result;
    }

    static saveAllStudent(groupData) {
        let array = [...groupData['in_group'], ...groupData['un_group']];
        let students = [];
        array.forEach(item => students.push(...item['student'] || []));
        Common.db('mem').set('students', students).write();
    }
}
export default Common;