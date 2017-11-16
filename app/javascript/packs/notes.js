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

  const getCsrfToken = () => {
    const metas = document.getElementsByTagName('meta');
    for (let meta of metas) {
      if (meta.getAttribute('name') === 'csrf-token') {
        // console.log(meta.getAttribute('content'));
        return meta.getAttribute('content');
      }
    }
    return '';
  }
  
  var app = new Vue({
    el: '#app',
    data: {
      "user" : {},
      "note" : {title: "", description: "", favorite: false},
      "author": {},
      "noteFile": "",
      "scopes" : [],
    },
    methods: {
      parseHTML: function(src) {
        var result = marked(src)
        return result
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
      star: function() {
        fetch("/stars", {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': getCsrfToken()
          },
          body: JSON.stringify({"star":{
                                  "user_id": this.user.id,
                                  "note_id": this.note.id
                                }
          })
        }).then((resp) => {
          if(resp.status >= 200 && resp.status <= 300) {
            var note = this.note
            note.favorite = true
            this.note = note
          } else {
            window.alert("Internal Server Error")
            throw resp.status
          }
        })
      },
      unStar: function() {
        fetch("/users/" + this.user.id + "/info/stars.json", {credentials: "same-origin"}).then((resp) => {
          return resp.text()
        }).then((data) => {
          var stars = JSON.parse(data);

          var star = stars.filter(function(data) {
            return data.note_id = app.note.id
          })

          if(star.length < 1) {
            throw "user not found"
          }
          star = star[0]

          return fetch(`/stars/${star.id}`, {
            method: "DELETE",
            credentials: "same-origin",
            headers: {
              "X-CSRF-Token": getCsrfToken()
            }
          })
        }).then((resp) => {
          if(resp.status <= 300 && resp.status >= 200) {
            var note = this.note
            note.favorite = false
            this.note = note
          }
        })
      },
    },
    computed: {
      note_extension : function() {
        return app.note.filename.split(".").pop();
      }
    },
  })
  
  function getUserInfo() {
    var user = {}
    if(gon.user_id) {
      return fetch("/users/" + gon.user_id + ".json").then((resp) => {
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
    if(gon.note_id) {
      return fetch("/notes/" + gon.note_id + ".json", {credentials: "same-origin"}).then((resp) => {
        return resp.text();
      }).then((data) => {
        var note = JSON.parse(data);
        app.note = note;
        return fetch(`/users/${note.user_id}.json`);
      }).then((resp) => {
        return resp.text();
      }).then((data) => {
        var author = JSON.parse(data);
        app.author = author;
        return fetch(`/notes/${gon.note_id}/info/organizations`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        app.scopes = JSON.parse(data);
        return fetch("/notes/" + gon.note_id + "/file", {credentials: "include"})
      }).then((resp) => {
        if (!(resp.status >= 200 && resp.status <= 300)) {
          if(resp.status == 403) {
            window.alert("このノートを見るには公開範囲の団体を登録する必要があります")
            throw "You don't have permission"
          }
          throw "Internal Server Error"
        }
        var extension = app.note_extension

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
      }).catch((error) => {
        console.error(error.toString())
      })
    }
  }
  
  getUserInfo();
  getNote();

})
