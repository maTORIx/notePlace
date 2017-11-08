import Vue from 'vue/dist/vue.min.js'
import marked from 'marked/marked.min.js'

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

  const getCsrfToken = () => {
    const metas = document.getElementsByTagName('meta');
    for (let meta of metas) {
      if (meta.getAttribute('name') === 'csrf-token') {
        console.log(meta.getAttribute('content'));
        return meta.getAttribute('content');
      }
    }
    return '';
  }

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
        return marked(src)
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
        console.log(organizations)
        return organizations.length === 1
      },
      isSubscriber: function() {
        var organizations = this.user.subscribers.filter(function(data) {
          return gon.organization_name == data.name
        })
        return organizations.length === 1
      },
      subscribe: function(org) {
        fetch("/subscribers", {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': getCsrfToken()
          },
          body: JSON.stringify({"subscriber":{
                                  "user_id": this.user.id,
                                  "organization_id": org.id
                                }
          })
        }).then((resp) => {
          if (resp.status >= 200 && resp.status <= 300) {
            getUserInfo()
          } else {
            throw "Internal server error"
          }
        })
        getUserInfo()
      },
      unsubscribe: function(org) {
        fetch(`/users/${gon.user_id}/info/subscribers.json`).then((resp) => {
          return resp.text()
        }).then((data) => {
          var subscribers_data = JSON.parse(data)
          var subscriber_data = subscribers_data.filter(function(data) {
            return data.organization_id == org.id
          })

          if (subscriber_data.length !== 1) {
            throw "Not found"
          }
          subscriber_data = subscriber_data[0]

          return fetch(`/subscribers/${subscriber_data.id}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCsrfToken()
            },
          })
        }).then((resp) => {
          if (resp.status >= 200 && resp.status <= 300) {
            getUserInfo()
          } else {
            throw "Internal server error"
          }
        })
      }
    },
  })

  function getUserInfo() {
    var user = {}
    if(gon.user_id) {
      fetch("/users/" + gon.user_id + ".json").then((resp) => {
        return resp.text()
      }).then((data) => {
        console.log(data)
        user = JSON.parse(data)
        return fetch("/users/" + gon.user_id + "/info/member_organizations.json")
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        user["members"] = JSON.parse(data)
        return fetch("/users/" + gon.user_id + "/info/subscriber_organizations.json")
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        user["subscribers"] = JSON.parse(data)
      }).then(() => {
        app.user = user
      })
    }
    return
  }

  function getNote() {
    fetch("/org/" + gon.organization_name + "/info/notes.json").then((resp) => {
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
      
      app.notes = app.notes.sort(function(note1, note2) {
        return note2.id > note1.id
      })
      app.timeline = []
      app.addTimeline()
    })
  }

  function getOrganizationInfo() {
    if(gon.organization_name) {
      var organization = {}
      fetch(`/org/${gon.organization_name}.json`).then((resp) => {
        return resp.text()
      }).then((data) => {
        organization = JSON.parse(data);
        return fetch(`/org/${gon.organization_name}/info/member_users.json`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        organization["members"] = JSON.parse(data)
        return fetch(`/org/${gon.organization_name}/info/subscriber_users.json`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        organization["subscribers"] = JSON.parse(data)
        return fetch(`/org/${gon.organization_name}/info/member_request_users.json`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        organization["member_requests"] = JSON.parse(data)
      }).then(() => {
        app.organization = organization
      })
    }
  }

  getUserInfo()
  getNote()
  getOrganizationInfo()
})
