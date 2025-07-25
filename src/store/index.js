import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loading: false,
    applications: [],
    submissionUnits: []
  },
  mutations: {
    SET_LOADING (state, loading) {
      state.loading = loading
    },
    SET_APPLICATIONS (state, applications) {
      state.applications = applications
    },
    SET_SUBMISSION_UNITS (state, submissionUnits) {
      state.submissionUnits = submissionUnits
    },
    ADD_APPLICATION (state, application) {
      state.applications.unshift(application)
    },
    UPDATE_APPLICATION (state, updatedApplication) {
      const index = state.applications.findIndex(app => app.appId === updatedApplication.appId)
      if (index !== -1) {
        Vue.set(state.applications, index, updatedApplication)
      }
    },
    REMOVE_APPLICATION (state, appId) {
      state.applications = state.applications.filter(app => app.appId !== appId)
    },
    ADD_SUBMISSION_UNIT (state, submissionUnit) {
      state.submissionUnits.unshift(submissionUnit)
    },
    UPDATE_SUBMISSION_UNIT (state, updatedSubmissionUnit) {
      const index = state.submissionUnits.findIndex(su => su.suId === updatedSubmissionUnit.suId)
      if (index !== -1) {
        Vue.set(state.submissionUnits, index, updatedSubmissionUnit)
      }
    },
    REMOVE_SUBMISSION_UNIT (state, suId) {
      state.submissionUnits = state.submissionUnits.filter(su => su.suId !== suId)
    }
  },
  actions: {
    setLoading ({ commit }, loading) {
      commit('SET_LOADING', loading)
    },
    setApplications ({ commit }, applications) {
      commit('SET_APPLICATIONS', applications)
    },
    setSubmissionUnits ({ commit }, submissionUnits) {
      commit('SET_SUBMISSION_UNITS', submissionUnits)
    },
    addApplication ({ commit }, application) {
      commit('ADD_APPLICATION', application)
    },
    updateApplication ({ commit }, application) {
      commit('UPDATE_APPLICATION', application)
    },
    removeApplication ({ commit }, appId) {
      commit('REMOVE_APPLICATION', appId)
    },
    addSubmissionUnit ({ commit }, submissionUnit) {
      commit('ADD_SUBMISSION_UNIT', submissionUnit)
    },
    updateSubmissionUnit ({ commit }, submissionUnit) {
      commit('UPDATE_SUBMISSION_UNIT', submissionUnit)
    },
    removeSubmissionUnit ({ commit }, suId) {
      commit('REMOVE_SUBMISSION_UNIT', suId)
    }
  },
  getters: {
    isLoading: state => state.loading,
    allApplications: state => state.applications,
    allSubmissionUnits: state => state.submissionUnits,
    getApplicationById: state => id => {
      return state.applications.find(app => app.appId === id)
    },
    getSubmissionUnitsByAppId: state => appId => {
      return state.submissionUnits.filter(su => su.appId === appId)
    }
  }
})
