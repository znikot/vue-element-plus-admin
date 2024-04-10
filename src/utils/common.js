import { timestampFormat, timestampParse } from '@/utils/time'

export function isExternal(path) {
    return /^(https?|ftp|mailto|tel):/.test(path)
}

const converters = {
    string2int: value => {
        return parseInt(value)
    },
    int2string: value => {
        return value.toString()
    },
    string2float: value => {
        return parseFloat(value)
    },
    float2string: value => {
        return value.toString()
    },
    string2boolean: value => {
        return value === 'true'
    },
    boolean2string: value => {
        return value ? 'true' : 'false'
    },
    date2timestamp: value => {
        return timestampParse(value)
    },
    timestamp2date: value => {
        return timestampFormat(value)
    },
    array2string: value => {
        return value.join(',')
    },
}

/**
 * 将 val 转换成 to 所指定的类型
 * @param {any} val 要转换的值
 * @param {string} to 要转换的类型，比如 string、date、int、float、boolean
 */
export function convert(val, to) {
    let tf = typeof val
    let from = ''
    if (tf === 'object') {
        if (val instanceof Date) {
            from = 'date'
        } else if (Array.isArray(val)) {
            from = 'array'
        }
    } else {
        switch (tf) {
            case 'string':
                from = 'string'
                break
            case 'number':
                from = Number.isInteger(val) ? 'int' : 'float'
                break
            case 'boolean':
                from = 'boolean'
                break
        }
    }

    if (from == '' || from == to) return val
    let converter = converters[`${from}2${to}`]
    if (converter) {
        // console.log(`convert from ${from} to ${to}:  ${val}`)
        return converter(val)
    }
}

/**
 * 从 obj 中获取指定key的属性
 * @param {object} obj 对象
 * @param {string} key 属性名，支持点运算符以获取下级属性
 * @param {any} defVal 默认值，如果没有找到，那么返回默认值
 */
export function getProp(obj, key, defVal) {
    if (!obj) return defVal
    if (key.indexOf('.') > -1) {
        const arr = key.split('.')
        let value = obj
        for (let i = 0; i < arr.length; i++) {
            value = value[arr[i]]
            if (value == undefined || value == null) {
                return defVal
            }
        }
        return value ?? defVal
    } else {
        return obj[key] ?? defVal
    }
}

/**
 * 从 obj 中找到 key 所指定的函数，并执行
 * @param {object} obj 对象
 * @param {string} key 属性名，支持点运算符以获取下级属性
 * @param {any} defVal 默认值，如果没有找到函数，那么返回默认值
 */
export function execProp(obj, key, defVal) {
    //先找属性
    let func = getProp(obj, key, null)
    if (func == null) return defVal

    // 判断是否函数
    if (typeof func === 'function') {
        // 处理参数，从 defVal 后面开始
        let args = []
        for (let i = 3; i < arguments.length; i++) {
            args.push(arguments[i])
        }
        let val = func.apply(this, args)

        return val ?? defVal
    } else {
        return defVal
    }
}

/**
 * 从 obj 中找到 key 所指定的属性（假设 V），并与 val 进行比较，0 : V==val，-1 V<val，1 V>val。当 V 为空时，返回 -1
 * @param {object} obj 对象
 * @param {string} key 属性名，支持点运算符以获取下级属性
 * @param {any} val 比较值
 */
export function compareProp(obj, key, val) {
    //首先获取到属性
    let v = getProp(obj, key, null)
    if (v == null) return -1

    // 判断类型
    // todo: 后面再实现
}
