import { useUserStore } from '@/store/modules/user'
import { toRaw } from 'vue'

let userStore: any
let permissions: string[] | undefined

export function hasPermissions(value: string | string[]): boolean {
  // const permission = (router.currentRoute.value.meta.permission || []) as string[]
  if (!userStore) {
    userStore = useUserStore()
    // permissions = toRaw(userStore.userInfo?.permissions) || []
  }
  if (!permissions) {
    permissions = userStore.userInfo?.permissions || []
  }
  if (!value) {
    return true
  }
  if (value.length == 0 || (permissions?.length == 1 && permissions[0] == '*:*:*')) {
    return true
  }
  if (typeof value === 'string' && permissions?.includes(value)) {
    return true
  }
  if (value.length == 0) return true
  for (const v of value as string[]) {
    if (permissions?.includes(v)) {
      return true
    }
  }
  return false
}

export function clearPermissions() {
  permissions = undefined
}
