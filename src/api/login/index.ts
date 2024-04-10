import request from '@/axios'
import type { UserLoginType, UserType, CaptchaType } from './types'

interface RoleParams {
  roleName: string
}

export const loginApi = (data: UserLoginType): Promise<IResponse<UserType>> => {
  return request.post({ url: '/login', data })
}

export const loginOutApi = (): Promise<IResponse> => {
  return request.get({ url: '/loginOut' })
}

export const getCaptchaApi = (): Promise<IResponse<CaptchaType>> => {
  return request.get({ url: '/captcha' })
}

export const getUserListApi = ({ params }: AxiosConfig) => {
  return request.get<{
    code: string
    data: {
      list: UserType[]
      total: number
    }
  }>({ url: '/mock/user/list', params })
}

export const getRoutersApi = (): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
  return request.get({ url: '/routers' })
}

export const getAdminRoleApi = (params: RoleParams): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
  return request.get({ url: '/routers', params })
}

export const getTestRoleApi = (params: RoleParams): Promise<IResponse<string[]>> => {
  return request.get({ url: '/mock/role/list2', params })
}
