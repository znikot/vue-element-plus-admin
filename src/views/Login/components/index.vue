<template>
  <div class="dark:(border-1 border-[var(--el-border-color)] border-solid)">
    <el-form :model="state.data" @keyup.enter="sysLogin">
      <el-row>
        <el-col :span="24">
          <el-form-item>
            <el-input size="large" v-model="state.data.username" :placeholder="t('login.username')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item>
            <el-input size="large" v-model="state.data.password" type="password" :placeholder="t('login.password')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="state.captchaEnable">
        <el-col :span="17">
          <el-form-item>
            <el-input size="large" v-model="state.data.captcha" type="text"
              :placeholder="t('common.inputText') + t('login.code')" />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <img :src="state.captchaImg" class="captcha" @click="loadCaptcha" />
        </el-col>
      </el-row>
      <el-row class="flex justify-center">
        <el-button type="success" @click="sysLogin">{{ t('common.login') }}</el-button>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { onMounted, reactive, watch, ref } from 'vue'
import { ElForm, ElFormItem, ElRow, ElCol, ElButton, ElInput } from 'element-plus'
import { useRouter } from 'vue-router'
import { loginApi, getTestRoleApi, getAdminRoleApi, getCaptchaApi } from '@/api/login'
import { useI18n } from '@/hooks/web/useI18n'
import request from '@/axios'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'

const { currentRoute, addRoute, push } = useRouter()
const { t } = useI18n()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

const redirect = ref('')

const state = reactive({
  data: {
    userName: '',
    password: '',
    captcha: '',
    captchaId: ''
  },

  captchaEnable: false,
  captchaImg: ''
})

watch(
  () => currentRoute.value,
  (route) => {
    redirect.value = route.query.redirect
  },
  {
    immediate: true
  }
)

const sysLogin = async () => {
  const res = await request.post({ url: '/login', data: state.data })

  if (res) {
    userStore.setToken(res.data.token)

    // 获取用户信息
    const userInfo = await request.get({ url: '/userInfo' })
    userStore.setUserInfo(userInfo.data)
    // 获取菜单
    // const menuRes = await request.get({ url: '/routers' })

    // const routers = menuRes.data || []
    // userStore.setRoleRouters(routers)
    // await permissionStore.generateRoutes('server', routers).catch(() => { })

    // permissionStore.getAddRouters.forEach((route) => {
    //   addRoute(route) // 动态添加可访问路由表
    // })
    // permissionStore.setIsAddRouters(true)
    push({ path: redirect.value || '/' })
  }


  // login(state.data)
  //   .then((res) => {
  //     // 保存token
  //     // app.setToken(res.data.token)
  //     // 登录完成后，请求当前用户信息
  //     // api.get('/userInfo').then((res) => {
  //     //   app.setUserInfo(res.data)
  //     //   router.push({ path: '/', replace: true })
  //     // })
  //   })
  //   .catch(() => {
  //     loadCaptcha()
  //   })
}

const loadCaptcha = async () => {
  getCaptchaApi().then((res) => {
    state.captchaEnable = res.data.captchaEnable
    state.captchaImg = 'data:image/gif;base64,' + res.data.captcha
    state.data.captchaId = res.data.captchaId
  })
}

onMounted(() => {
  loadCaptcha()
})
</script>

<style scoped>
.captcha {
  width: auto;
  height: 38px;
  line-height: 38px;
  margin-left: 5px;
}
</style>
