import Vue from 'vue/dist/vue.min.js'

document.addEventListener('DOMContentLoaded', () => {
  var app = new Vue({
    el: '#app',
    data: {
    },
    methods: {
      redirectTo: function(url) {
        location.href = url
        return
      },
    },
  })

  getUserInfo()
})
