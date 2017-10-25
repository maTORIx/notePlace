import Vue from 'vue/dist/vue.min.js'
import Masonry from "masonry-layout/dist/masonry.pkgd.js"

document.addEventListener('DOMContentLoaded', () => {
  console.log("hello")
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
        var result = src.replace(/[&'`"<>]/g, function(match) {
          return {
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
          }[match]
        });
        result = result.split("\n").join("<br>")
        console.log(result)
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
      redirectTo: function(note) {
        location.href = `/notes/${note.id}`
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
  if(gon.user_id) {
    fetch("/users/" + gon.user_id + ".json").then((resp) => {
      return resp.text();
    }).then((data) => {
      app.user = JSON.parse(data)
    })
    fetch("/users/" + gon.user_id + "/info/notes.json").then((resp) => {
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
      var timeline = app.notes
      for(var i = 0; i < app.notes.length; i++) {
        timeline[i]["user"] = app.getUser(app.notes[i])
      }
      app.timeline = timeline
    })
  }
})
