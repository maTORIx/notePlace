import Vue from 'vue/dist/vue.min.js'
import marked from 'marked/marked.min.js'
import getData from "./getData.js"
import sendData from "./sendData.js"
import tools from "./tools.js"

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
      "show_notes": [],
      "show_user": {name: "none", description: "none", members: [], subscribers: [],member_requests: []},
      "search_text": gon.search_text
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
          return {"user_icon": "", "name": ""}
        } else {
          return note_users[0]
        }
      },
      redirectTo: function(url) {
        location.href = url
        return
      },
      search: function() {
        var text = encodeURIComponent(this.search_text)
        location.href = `/users/${gon.show_user_id}/search/notes/${text}`
        return
      },
      addShowNotes: function() {
        var show_length = this.show_notes.length + 100
        if (this.notes.length < 100) {
          show_length = this.notes.length
        }
        for(var i = this.show_notes.length; i < show_length; i++) {
          var note = this.notes[i]
          note["user"] = this.getUser(app.notes[i])
          app.show_notes.push(note)
        }
        return
      },
    },
  })

  getData.getUserInfo(gon.user_id).then((user) => {
    app.user = user
    return getData.getUserInfo(gon.show_user_id)
  }).then((user) => {
    app.show_user = user
  })

  function getNotes() {
    var text = encodeURIComponent(gon.search_text)
    fetch(`/users/${gon.show_user_id}/search/notes.json/${text}`).then((resp) => {
      return resp.text()
    }).then((data) => {
      var notes = JSON.parse(data)
      app.notes = notes
      return getData.getNotesUsers(notes)
    }).then((users) => {
      app.users = users
    }).then(() => {
      app.addShowNotes()
    })
  }

  getNotes()
})
