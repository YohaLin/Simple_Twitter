import Vue from 'vue'
import VueRouter from 'vue-router'
import NotFound from '../views/NotFound'
import Register from '../views/Register'
import Login from '../views/Login'
import Main from '../views/Main'
import AdminTweets from '../views/AdminTweets'
import store from '../store'

Vue.use(VueRouter)

const authorizeIsAdmin = (to, from, next) => {
  const currentUser = store.state.currentUser
  if (currentUser && currentUser.role !== 'admin') {
    next('/not-found')
    return
  }
  next()
}
const authorizeIsUser = (to, from, next) => {
  const currentUser = store.state.currentUser
  if (currentUser && currentUser.role !== 'user') {
    next('/not-found')
    return
  }
  next()
}

const routes = [
  {
    path: '/',
    name: 'root',
    redirect: '/main',
    beforeEnter: authorizeIsUser
  },
  {
    path: '/main',
    name: 'main-page',
    component: Main,
    beforeEnter: authorizeIsUser
  },
  {
    path: '/reply/new',
    name: 'reply-new',
    redirect: '/main',
    beforeEnter: authorizeIsUser
  },
  {
    path: '/tweets/new',
    name: 'tweet-new',
    component: () => import('../views/Main.vue'),
    beforeEnter: authorizeIsUser
  },
  {
    path: '/tweets/:id',
    name: 'tweet-detail',
    component: () => import('../views/TweetDetail.vue'),
    beforeEnter: authorizeIsUser
  },
  {
    path: '/users/edit',
    name: 'user-edit',
    component: () => import('../views/UserDetail.vue'),
    beforeEnter: authorizeIsUser
  },
  {
    path: '/users/:id/follower',
    name: 'user-follower',
    component: () => import('../views/Follow.vue'),
    beforeEnter: authorizeIsUser
  },
  {
    path: '/users/:id/following',
    name: 'user-following',
    component: () => import('../views/Follow.vue'),
    beforeEnter: authorizeIsUser
  },
  {
    path: '/users/:id',
    name: 'user-detail',
    component: () => import('../views/UserDetail.vue'),
    beforeEnter: authorizeIsUser
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/Setting.vue'),
    beforeEnter: authorizeIsUser
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../views/AdminLogin.vue')
  },
  {
    path: '/admin/tweets',
    name: 'admin-tweet',
    component: AdminTweets,
    beforeEnter: authorizeIsAdmin
  },
  {
    path: '/admin/users',
    name: 'admin-user',
    component: () => import('../views/AdminUsers.vue'),
    beforeEnter: authorizeIsAdmin
  },
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin/tweets',
    beforeEnter: authorizeIsAdmin
  },
  {
    path: '*',
    name: 'not-found',
    component: NotFound
  },
]

const router = new VueRouter({
  routes
})

router.beforeEach(async (to, from, next) => {
  const tokenInLocalStorage = localStorage.getItem('token')
  const tokenInStore = store.state.token
  let isAuthenticated = store.state.isAuthenticated

  if (tokenInLocalStorage && tokenInLocalStorage !== tokenInStore){
    console.log('我發現你 token 有變喔')
    isAuthenticated = await store.dispatch('fetchCurrentUser')
  }

  //依據登入狀態決定轉址
  const pathsWithoutAuthentication = ['register', 'login', 'admin-login']

  if (!isAuthenticated && !pathsWithoutAuthentication.includes(to.name)) {
    next('/login')
    return
  }

  if (isAuthenticated && pathsWithoutAuthentication.includes(to.name)) {
    next('/main')
    return
  }
  next()
})

export default router
