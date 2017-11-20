import Vue from 'vue/dist/vue.min.js'
import marked from 'marked/marked.min.js'
import getData from "./getData.js"
import sendData from "./sendData.js"

document.addEventListener('DOMContentLoaded', () => {
  // marked settings
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

  var app = new Vue({
    el: '#app',
    data: {
      "user" : {id: undefined, name: "none", icon: ""},
      "organizations": [],
      "search_text": encodeURIComponent(gon.search_text),
    },
    methods: {
      parseHTML: function(src) {
        return marked(src)
      },
      redirectTo: function(url) {
        location.href = url
        return
      },
    },
  })

  getData.getUserInfo(gon.user_id).then((user) => {
    app.user = user
  })

  function getOrganizations() {
    if(gon.search_text) {
      var text = encodeURIComponent(gon.search_text)
      fetch(`/search/organizations.json/${text}`).then((resp) => {
        return resp.text()
      }).then((data) => {
        app.organizations = JSON.parse(data).reverse();
      })
    }
  }

  getOrganizations()
})
