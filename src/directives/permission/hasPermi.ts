import type { App, Directive, DirectiveBinding } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
// import { useUserStore } from '@/store/modules/user'
import { hasPermissions } from '@/utils/permission'

const { t } = useI18n()

const hasPermission = (value: string[]): boolean => {
  return hasPermissions(value)
  // // const permission = (router.currentRoute.value.meta.permission || []) as string[]
  // if (!userStore) {
  //   userStore = useUserStore()
  //   // permissions = toRaw(userStore.userInfo?.permissions) || []
  // }
  // permissions = userStore.userInfo?.permissions || []
  // if (!value) {
  //   // throw new Error(t('permission.hasPermission'))
  //   return true
  // }
  // if (permissions.length == 1 && permissions[0] == '*:*:*') {
  //   return true
  // }
  // if (typeof value === 'string' && permissions.includes(value)) {
  //   return true
  // }
  // if (value.length == 0) return true
  // for (const v of value as string[]) {
  //   if (permissions.includes(v)) {
  //     return true
  //   }
  // }
  // return false
}
function hasPermi(el: Element, binding: DirectiveBinding) {
  const value = binding.value

  const flag = hasPermission(value)
  if (!flag) {
    el.parentNode?.removeChild(el)
  }
}
const mounted = (el: Element, binding: DirectiveBinding<any>) => {
  hasPermi(el, binding)
}

const permiDirective: Directive = {
  mounted,
}

export const setupPermissionDirective = (app: App<Element>) => {
  app.directive('hasPermi', permiDirective)
}

export default permiDirective
