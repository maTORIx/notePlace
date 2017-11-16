import Vue from 'vue/dist/vue.min.js'
import marked from 'marked/marked.min.js'
import getData from "./getData.js"

document.addEventListener('DOMContentLoaded', () => {
  //marked settings
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
      "user" : {},
      "notes" : [],
      "users": [],
      "timeline": [],
    },
    methods: {
      parseHTML: function(src) {
        var result = marked(src)
        return result
      },
      getUser: function(note) {
        var note_users = this.users.filter(function(user, idx, users) {
          console.log(user, idx, users)
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

  getData.getNoteData(gon.user_id).then((user) => {
    app.user = user
    return getData.getTimelineNotes(gon.user_id)
  }).then((notes) => {
    app.notes = notes
    return getData.getNotesUsers(notes)
  }).then((users) => {
    app.users = users
  }).then(() => {
    app.addTimeline()
  })
  
})
