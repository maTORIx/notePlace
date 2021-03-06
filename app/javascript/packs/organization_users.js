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
      "organization": {name: "none", description: "none", members: [], subscribers: [], member_requests:[]},
      "form": {user_email: ""},
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
          this.users.push(user)
        }).catch((err) => {
          window.alert(err)
        })
      },
      deleteMemberRequest: function(user) {
        sendData.destroyMemberRequest(this.organization, user).then((resp) => {
          console.log(this.users.indexOf(user))
          this.users.splice(this.users.indexOf(user), 1)
        })
      },
      deleteMember: function(user) {
        sendData.destroyMember(this.organization, user).then((user) => {
          this.users.splice(this.users.indexOf(user), 1)
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
  })
})
