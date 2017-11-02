import Vue from 'vue/dist/vue.min.js'
import marked from 'marked/marked.min.js'

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
      "user" : {name: "none", icon: ""},
      "organizations": [],
      "show_user": {name: "none", description: "none", members: [], subscribers: []},
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

  function getUserInfo() {
    if(gon.user_id) {
      fetch("/users/" + gon.user_id + ".json").then((resp) => {
        return resp.text();
      }).then((data) => {
        app.user = JSON.parse(data)
      })
    }
  }

  function getShowUserInfo() {
    var show_user = {}
    if(gon.show_user_id) {
      fetch("/users/" + gon.show_user_id + ".json").then((resp) => {
        return resp.text();
      }).then((data) => {
        show_user = JSON.parse(data)
        return fetch(`/users/${gon.show_user_id}/info/member_organizations`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        show_user["members"] = JSON.parse(data)
        return fetch(`/users/${gon.show_user_id}/info/subscriber_organizations`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        show_user["subscribers"] = JSON.parse(data)
      }).then(() => {
        app.show_user = show_user
      })
    }
  }

  function getShowUserOrgs() {
    if(gon.show_user_id) {
      fetch(`/users/${gon.show_user_id}/info/${gon.type}_organizations`).then((resp) => {
        return resp.text()
      }).then((data) => {
        app.organizations = JSON.parse(data);
      })
    }
  }
  getUserInfo()
  getShowUserInfo()
  getShowUserOrgs()
})
