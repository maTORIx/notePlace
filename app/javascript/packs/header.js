import Vue from 'vue/dist/vue.min.js'
import marked from 'marked/marked.min.js'
import getData from "./getData.js"

document.addEventListener('DOMContentLoaded', () => {

  var body = document.body
  var load_bar = document.querySelector("#load-bar")
  body.style.display = "none"
  window.setTimeout(function() {
    body.style.display = "block"
    load_bar.style.display = "none"
  }, 400)

  //marked settings
  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
  });

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
        return marked(src)
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

  if(gon.search_text) {
    header.header_search_text = search_text
  }
})