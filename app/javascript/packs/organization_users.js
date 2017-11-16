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
      "organization": {name: "none", description: "none", members: [], subscribers: [], member_requests:[]},
      "form": {user_email: ""},
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
          app.user.subscribers.push(org)
        })
      },
      unsubscribe: function(org) {
        sendData.unsubscribe(org, this.user).then(() => {
          app.user.subscribers.splice(app.user.subscribers.indexOf(org), 1)
        })
      },
      sendMemberRequest: function(event) {
        event.preventDefault();
        this.addMemberRequest(this.form.user_email)
      },
      addMemberRequest: function(user_email) {
        sendData.sendMemberRequest(this.organization, user_email).then((user) => {
          this.user.push(user)
        })
      },
      deleteMemberRequest: function(user) {
        sendData.deleteMemberRequest(this.organization, user).then((user) => {
          this.users.slice(this.users.indexOf(user), 1)
        })
      },
      deleteMember: function(user) {
        sendData.deleteMember(this.organization, user).then((user) => {
          this.users.slice(this.users.indexOf(user), 1)
        })
      }
    },
  })

  getData.getUserInfo(gon.user_id).then((data) => {
    app.user = data
    return getData.getOrganizationInfo(gon.organization_name)
  }).then((org) => {
    app.organization = org
    app.users = org[gon.type]
    console.log(gon.type)
    console.log(org)
  })
})
