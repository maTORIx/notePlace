import Vue from 'vue/dist/vue.min.js'
import getData from "./getData.js"
import sendData from "./sendData.js"
import tools from "./tools.js"

document.addEventListener('DOMContentLoaded', () => {
  var app = new Vue({
    el: '#app',
    data: {
      "user" : {name: "none", description: "none", members: [], subscribers: []},
      "users": [],
      "form": {search_text: ""},
      "search_text": encodeURIComponent(gon.search_text),
    },
    methods: {
      parseHTML: function(src) {
        return tools.parseHTML(src)
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
      var text = encodeURIComponent(gon.search_text)
      fetch(`/search/users.json/${text}`).then((resp) => {
        return resp.text()
      }).then((data) => {
        app.users = JSON.parse(data).reverse()
      })
    }
  }

  getTargetUsers()
})
