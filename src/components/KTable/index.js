// import Events from '@/common/interface/events'
import { ElNotification } from 'element-plus'

export class EventListener {
    constructor(event, handler) {
        this.event = event
        this.handler = handler
    }
}

export function onEvent(events, name, param) {
    // console.log('on event', name, 'param', param)
    let ok = false
    if (events) {
        // 查找指定的事件
        for (const k in events) {
            if (k.toLowerCase() == `on${name}`.toLowerCase()) {
                events[k](param)
                ok = true
                break
            }
        }
    }
    if (!ok) {
        // 从接口中执行事件
        // ok = Events.on(name, param)
        // Events.$emit(name, param)
        ok = true
    }
    if (!ok) {
        ElNotification({
            title: '操作失败',
            message: `未绑定操作 ${name}`,
            type: 'error',
            position: 'top-right',
        })
    }
}

export { default as KTable } from './index.vue'
