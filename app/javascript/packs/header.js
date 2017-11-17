import Vue from 'vue/dist/vue.min.js'
import getData from "./getData.js"
import tools from "./tools.js"

document.addEventListener('DOMContentLoaded', () => {

  var body = document.body
  var load_bar = document.querySelector("#load-bar")
  body.style.display = "none"
  window.setTimeout(function() {
    body.style.display = "block"
    load_bar.style.display = "none"
  }, 400)

  var user = {id: null, name: "", description: "", members: [], subscriber: []}

  var header = new Vue({
    el: '#header',
    data: {
      "header_search_text" : "",
      "user": user
    },
    methods: {
      search: function() {
        location.href = `/search/notes/${this.header_search_text}`
      },
      redirectTo: function(url) {
        location.href = url
      },
    }
  })

  var header_drawer = new Vue({
    el: '#header_drawer',
    data: {
      "user": user
    },
    methods: {
      parseHTML: function(src) {
        return tools.parseMarkDown(src)
      },
      search: function() {
        location.href = `/search/notes/${this.search_text}`
      },
      redirectTo: function(url) {
        location.href = url
      },
    }
  })

  getData.getUserInfo(gon.user_id).then((data) => {
    header.user = data
    header_drawer.user = data
  })
})