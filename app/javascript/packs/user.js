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
      "timeline": [],
      "star_notes": [],
      "star_timeline": [],
      "show_user": {name: "none", description: "none", members: [], subscribers: [],member_requests: []},
    },
    methods: {
      parseMarkdown: function(src) {
        return marked(src)
      },
      parseNoteDescription: function(src) {
        return tools.parseNoteDescription(src)
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
      addStarTimeline: function() {
        var show_length = this.star_timeline + 100
        if(this.star_notes.length < 100) {
          show_length = this.star_notes.length
        }
        for(var i = 0; i < show_length; i++) {
          var note = this.star_notes[i]
          note["user"] = this.getUser(note)
          app.star_timeline.push(note)
        }
        return
      }
    },
  })

  Promise.all([
    getData.getUserInfo(gon.user_id).then((user) => {
      app.user = user
      return getData.getUserInfo(gon.show_user_id)
    }).then((user) => {
      app.show_user = user
      app.users.push(user)
    }),
    
    getData.getUserNotes(gon.show_user_id).then((notes) => {
      app.notes = notes
    }),

    getData.getUserStarNotes(gon.show_user_id).then((notes) => {
      app.star_notes = notes
      return getData.getNotesUsers(notes)
    }).then((users) => {
      app.users = app.users.concat(users)
    })
  ]).then(() => {
    app.addStarTimeline()
    app.addTimeline()
  })
})
