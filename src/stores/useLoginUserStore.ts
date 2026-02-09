import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * 存储登陆用户信息的状态
 */
// 一个状态就存储一类要共享的数据（存一类常量)
export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser: Ref<any, any> = ref<any>({
    userName: '未登陆',
  })

  async function fetchLoginUser() {
    // todo 由于后端还没提供接口，暂时注释
    // const res = await getCurrentUser();
    // if (res.data.code === 0 && res.data.data) {
    //   loginUser.value = res.data.data;
    // }

    // 测试用户登陆，3秒后自动登陆
    setTimeout(() => {
      loginUser.value = { userName: '测试用户', id: 1 }
    }, 3000)
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
