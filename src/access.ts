import router from '@/router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'

// 是否位首次获取登陆用户
let firstFetchLoginUser: boolean = true

/**
 * 全局权限校验，每次切换页面时都会执行
 */
router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()
  let loginUser = loginUserStore.loginUser
  // 确保页面刷新时，首次加载时，能等待后端返回用户信息后再校验权限
  // 获取登陆用户信息
  if (firstFetchLoginUser) {
    try {
      await loginUserStore.fetchLoginUser()
      loginUser = loginUserStore.loginUser
      // 获取到登陆用户信息后，将其改为不是首次获取，防止每次刷新都重复获取登陆用户信息
      firstFetchLoginUser = false
    } catch (error) {
      console.error('获取登录用户信息失败:', error)
      // 获取失败时也继续，避免页面无法加载
      firstFetchLoginUser = false
    }
  }

  const toUrl = to.fullPath
  // 可以自己定义权限校验逻辑，比如管理员才能访问 /admin 开头的页面
  if (toUrl.startsWith('/admin')) {
    if (!loginUser || loginUser.userRole !== 'admin') {
      message.error('没有权限')
      // 重定向到 /user/login?redirect=
      next(`/user/login?redirect=${to.fullPath}`)
      return
    }
  }
  // 通过校验，放行
  next()
})
