import { ElMessageBox, ElNotification } from 'element-plus'

export function WarningConfirm(msg) {
    return ElMessageBox.confirm(msg, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
}

export function Warn(msg) {
    ElNotification({
        title: '警告',
        message: msg,
        dangerouslyUseHTMLString: true,
        type: 'warning',
        duration: 2000,
    })
}

export function Info(msg) {
    ElNotification({
        title: '提示',
        message: msg,
        dangerouslyUseHTMLString: true,
        type: 'info',
        duration: 2000,
    })
}

export function Error(msg) {
    ElNotification({
        title: '错误',
        message: msg,
        dangerouslyUseHTMLString: true,
        type: 'error',
        duration: 2000,
    })
}

export function Success(msg) {
    ElNotification({
        title: '成功',
        message: msg,
        dangerouslyUseHTMLString: true,
        type: 'success',
        duration: 2000,
    })
}
