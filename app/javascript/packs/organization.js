import Vue from 'vue/dist/vue.min.js'
import getData from "./getData.js"
import sendData from "./sendData.js"
import tools from "./tools.js"

document.addEventListener('DOMContentLoaded', () => {
  var app = new Vue({
    el: '#app',
    data: {
      "user" : {name: "none", description: "none", members: [], subscribers: []},
      "notes" : [],
      "users": [],
      "timeline": [],
      "organization": {name: "none", description: "none", members: [],member_requests: [], subscribers: []},
    },
    methods: {
      parseHTML: function(src) {
        return tools.parseHTML(src)
      },
      getUser: function(note) {
        var note_users = this.users.filter(function(user, idx, users) {
          return user.id === note.user_id
        })
        if (note_users.length < 1) {
          return {"user_icon": "http://matorixx.com.home.png", "name": "John Doe"}
        } else {
          return note_users[0]
        }
      },
      redirectTo: function(url) {
        location.href = url
        return
      },
      addTimeline: function() {
        var show_length = this.timeline.length + 100
        if (this.notes.length < 100) {
          show_length = this.notes.length
        }
        for(var i = this.timeline.length; i < show_length; i++) {
          var note = this.notes[i]
          note["user"] = this.getUser(app.notes[i])
          app.timeline.push(note)
        }
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
        return organizations.length != 0
      },
      subscribe: function(org) {
        sendData.subscribe(org, this.user).then((resp) => {
          app.user.subscribers.push(org)
        })
      },
      unsubscribe: function(org) {
        sendData.unsubscribe(org, this.user).then(() => {
          app.user.subscribers.splice(app.user.subscribers.indexOf(org), 1)
        })
      },
    }
  })

  getData.getUserInfo(gon.user_id).then((user) => {
    app.user = user
    return getData.getOrganizationInfo(gon.organization_name)
  }).then((org) => {
    app.organization = org
    return getData.getOrgNotes(gon.organization_name)
  }).then((notes) => {
    app.notes = notes
    return getData.getNotesUsers(notes)
  }).then((users) => {
    app.users = users
  }).then(() => {
    app.addTimeline()
  })
})
