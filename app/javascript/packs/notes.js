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
      "note" : {title: "John Doe", description: "none"},
      "author": {},
      "noteFile": "",
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
      redirectTo: function(note) {
        location.href = `/notes/${note.id}`
        return
      }
    },
    computed: {
      note_extension : function() {
        return app.note.filename.split(".").pop();
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
  }
  if(gon.note_id) {
    fetch("/notes/" + gon.note_id + ".json").then((resp) => {
      return resp.text();
    }).then((data) => {
      var note = JSON.parse(data);
      app.note = note;
      console.log(note)
      return fetch(`/users/${note.user_id}.json`);
    }).then((resp) => {
      return resp.text();
    }).then((data) => {
      var author = JSON.parse(data);
      app.author = author;
      return fetch("/notes/" + gon.note_id + "/file")
    }).then((resp) => {
      var extension = app.note.filename.split(".").pop();

      // check extension
      switch (extension) {
        case "pdf":
          return resp.blob();
        case "md":
          return resp.text();
        default:
          return null
      }
    }).then((data) => {
      console.log(data)
      app.noteFile = data;
    }).then(() => {
      var note_body = document.querySelector("#note_body")
      switch (app.note_extension) {
        case "pdf":
          var url = URL.createObjectURL(app.noteFile)
          var iframe = document.createElement("iframe")
          iframe.src = url + "#view=fit&toolbar=0&navpanes=0"
          iframe.height = String(window.parent.screen.height - 200) + "px"
          note_body.appendChild(iframe)
          return
        case "md":
          note_body.innerHTML = marked(app.noteFile)
          return
        default:
          return
      }
    })
  }
})
