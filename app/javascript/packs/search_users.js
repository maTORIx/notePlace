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
      "user" : {name: "none", description: "none", members: [], subscribers: []},
      "users": [],
      "form": {search_text: ""},
      "search_text": gon.search_text,
    },
    methods: {
      parseHTML: function(src) {
        return marked(src)
      },
      redirectTo: function(url) {
        location.href = url
        return
      },
      isMember: function() {
        var organizations = this.user.members.filter(function(data) {
          return gon.organization_name == data.name
        })
        return organizations.length === 1
      },
      isSubscriber: function() {
        var organizations = this.user.subscribers.filter(function(data) {
          return gon.organization_name == data.name
        })
        return organizations.length === 1
      },
      subscribe: function(org) {
        sendData.subscribe(org, this.user).then((user) => {
          this.user.subscribers.push(org)
        })
      },
      unsubscribe: function(org) {
        sendData.unsubscribe(org, this.user).then(() => {
          this.user.subscribers.splice(this.user.indexOf(org), 1)
        })
      },
    },
    computed: {
    }
  })

  getData.getUserInfo(gon.user_id).then((user) => {
    app.user = user
  })

  function getTargetUsers() {
    if(gon.search_text) {
      fetch(`/search/users.json/${gon.search_text}`).then((resp) => {
        return resp.text()
      }).then((data) => {
        app.users = JSON.parse(data)
      })
    }
  }

  getTargetUsers()
})
