export interface UserLoginType {
  username: string
  password: string
  captcha: string
  captchaId: string
}

export interface UserType {
  username: string
  password: string
  role: string
  roleId: string
  user: any
  permissions: string[]
  roles: string[]
}

export interface CaptchaType {
  captchaEnabled: boolean
  captcha: string
  captchaId: string
}
