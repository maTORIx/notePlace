import Vue from 'vue/dist/vue.min.js'
import marked from 'marked/marked.min.js'

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
    watch: {
      notes: {
        handler: function(val) {
          this.$nextTick(function() {
            console.log("update")
          })
        },
        deep: true
      },
    }
  })

  function getUserInfo() {
    if(gon.user_id) {
      fetch("/users/" + gon.user_id + ".json").then((resp) => {
        return resp.text();
      }).then((data) => {
        app.user = JSON.parse(data)
      })
      fetch("/users/" + gon.user_id + "/info/timeline.json").then((resp) => {
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
        console.log(texts)
        var users = texts.map(function(data) {
          return JSON.parse(data)
        })
        app.users = users
        app.notes = app.notes.sort(function(note1, note2) {
          return note2.id > note1.id
        })
        app.timeline = []
        app.addTimeline()
      })
    }
  }
  getUserInfo()
})
