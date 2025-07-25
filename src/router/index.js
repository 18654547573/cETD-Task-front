import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/applications'
  },
  {
    path: '/applications',
    name: 'Applications',
    component: () => import('../views/ApplicationList.vue')
  },
  {
    path: '/applications/create',
    name: 'CreateApplication',
    component: () => import('../views/ApplicationForm.vue')
  },
  {
    path: '/applications/:id/edit',
    name: 'EditApplication',
    component: () => import('../views/ApplicationForm.vue'),
    props: true
  },
  {
    path: '/applications/:id/detail',
    name: 'ApplicationDetail',
    component: () => import('../views/ApplicationDetail.vue'),
    props: true
  },
  {
    path: '/submission-units',
    name: 'SubmissionUnits',
    component: () => import('../views/SubmissionUnitList.vue')
  },
  {
    path: '/submission-units/create',
    name: 'CreateSubmissionUnit',
    component: () => import('../views/SubmissionUnitForm.vue')
  },
  {
    path: '/submission-units/:id/edit',
    name: 'EditSubmissionUnit',
    component: () => import('../views/SubmissionUnitForm.vue'),
    props: true
  },
  {
    path: '/submission-units/:id/detail',
    name: 'SubmissionUnitDetail',
    component: () => import('../views/SubmissionUnitDetail.vue'),
    props: true
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
