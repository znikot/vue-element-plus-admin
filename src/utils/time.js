import { DateTime } from 'luxon'

/**
 * 获取当前时间下, 下一天的0点
 * @param time
 * @returns {*}
 */
export function getCurrentDay(time) {
    time.setHours(0)
    time.setMinutes(0)
    time.setSeconds(0)
    time.setMilliseconds(0)
    time.setTime(time.getTime() + 24 * 60 * 60 * 1000)
    return time
}

/***
 * 获取该时间 日期下对应的 00:00:00
 * @param time
 * @returns {*}
 */
export function formatDate(time) {
    time.setHours(0)
    time.setMinutes(0)
    time.setSeconds(0)
    time.setMilliseconds(0)
    return time
}

/**
 * 时间戳转换为标准日期
 * @param time
 */
export function timestampFormat(timestamp, fmt) {
    if (timestamp < 0) return ''
    let dt = DateTime.fromMillis(timestamp)
    if (!fmt) {
        fmt = 'yyyy-MM-dd hh:mm:ss'
    }
    return dt.toFormat(fmt)
}

export function timestampParse(timeStr) {
    return new Date(timeStr).getTime()
}

Date.prototype.toLocalDate = function () {
    var time = this.getFullYear() + '-'
    if (this.getMonth() < 9) {
        time += '0' + (this.getMonth() + 1) + '-'
    } else {
        time += this.getMonth() + 1 + '-'
    }
    if (this.getDate() < 10) {
        time = time + '0' + this.getDate()
    } else {
        time = time + this.getDate()
    }
    return time
}

Date.prototype.toLocalTimeString = function () {
    var time = ''
    if (this.getHours() < 10) {
        time = time + '0' + this.getHours() + ':'
    } else {
        time = time + this.getHours() + ':'
    }
    if (this.getMinutes() < 10) {
        time += '0' + this.getMinutes() + ':'
    } else {
        time += this.getMinutes() + ':'
    }
    if (this.getSeconds() < 10) {
        time = time + '0' + this.getSeconds()
    } else {
        time = time + this.getSeconds()
    }
    return time
}

Date.prototype.toLocaleString = function () {
    return this.toLocaleDateString() + ' ' + this.toLocaleTimeString()
}
