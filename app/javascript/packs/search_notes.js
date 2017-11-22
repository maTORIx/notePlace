import Vue from 'vue/dist/vue.min.js'
import marked from 'marked/marked.min.js'
import tools from './tools.js'

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
      "notes" : [],
      "users": [],
      "timeline": [],
      "search_text": encodeURIComponent(gon.search_text),
    },
    methods: {
      parseHTML: function(src) {
        return tools.parseHTML(src)
      },
      isCurrentUser: function() {
        return this.user.id == this.show_user.id
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
      }
    },
  })

  function getUserInfo() {
    var user = {}
    if(gon.user_id) {
      fetch("/users/" + gon.user_id + ".json").then((resp) => {
        return resp.text();
      }).then((data) => {
        user = JSON.parse(data)
        return fetch(`/users/${gon.user_id}/info/member_organizations`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        user["members"] = JSON.parse(data)
        return fetch(`/users/${gon.user_id}/info/subscriber_organizations`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        user["subscribers"] = JSON.parse(data)
        return fetch(`/users/${gon.user_id}/info/member_request_organizations`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        user["member_requests"] = JSON.parse(data)
      }).then(() => {
        app.user = user
      })
    }
  }

  function getNote() {
    fetch("/search/notes.json/" + encodeURIComponent(gon.search_text)).then((resp) => {
      return resp.text();
    }).then((data) => {
      var notes = JSON.parse(data)
      app.notes = notes

      var user_ids = notes.map(function(data){
        return data.user_id
      })
          
      user_ids = user_ids.filter(function(x, i, self) {
        return self.indexOf(x) === i
      })

      var urls = user_ids.map(function(user_id) {
        return `/users/${user_id}.json`
      })

      return Promise.all(urls.map((url) => {
        return fetch(url).then((resp) => {
          return resp.text()
        })
      }))

    }).then((texts) => {
      var users = texts.map(function(data) {
        return JSON.parse(data)
      })
      app.users = users
      app.timeline = []
      app.addTimeline()
    })
  }
  getUserInfo()
  getNote()
})
