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
      "users": [],
      "form": {search_text: ""},
      "search_text": gon.search_text,
    },
    methods: {
      parseHTML: function(src) {
        return marked(src)
      },
      redirectTo: function(url) {
        location.href = url
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
      },
    },
    computed: {
    }
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

  function getTargetUsers() {
    if(gon.search_text) {
      fetch(`/search/users.json/${gon.search_text}`).then((resp) => {
        return resp.text()
      }).then((data) => {
        app.users = JSON.parse(data)
      })
    }
  }

  getUserInfo()
  getTargetUsers()
})
