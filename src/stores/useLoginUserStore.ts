import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserUsingGet } from '@/api/userController.ts'

/**
 * 存储登陆用户信息的状态
 */
// 一个状态就存储一类要共享的数据（存一类常量)
export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVo>({
    userName: '未登陆',
  })

  /**
   * 远程获取登陆用户信息
   */
  async function fetchLoginUser() {
    try {
      const res = await getLoginUserUsingGet()
      if (res && res.data && res.data.code === 0 && res.data.data) {
        loginUser.value = res.data.data
      }
    } catch (error) {
      console.error('获取登录用户信息失败:', error)
      // 获取失败时保持默认状态，不影响页面加载
    }

    // 测试用户登陆，3秒后自动登陆
    // setTimeout(() => {
    //   loginUser.value = { userName: '测试用户', id: 1 }
    // }, 3000)
  }

  /**
   * 设置登陆用户
   * @param newLoginUser
   */
  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }

  // 返回
  return { loginUser, fetchLoginUser, setLoginUser }
})
