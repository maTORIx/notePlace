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
      "user" : {id: undefined, name: "none", icon: ""},
      "organizations": [],
      "show_user": {id: undefined, name: "none", description: "none", members: [], subscribers: [], member_requests: []},
    },
    methods: {
      parseHTML: function(src) {
        return marked(src)
      },
      redirectTo: function(url) {
        location.href = url
        return
      },
      isCurrentUser: function() {
        return this.user.id == this.show_user.id
      },
      addMember: function(org) {
        fetch(`/users/${gon.show_user_id}/info/member_requests.json`).then((resp) => {
          return resp.text()
        }).then((data) => {
          var member_requests_data = JSON.parse(data);
          console.log(member_requests_data)

          var member_request_data = member_requests_data.filter(function(data) {
            return data.organization_id == org.id
          })
          if(member_request_data.length !== 1) {
            throw "Request not found"
          }

          member_request_data = member_request_data[0]

          return fetch(`/members`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify({member: {request_id: member_request_data.id}})
          })
        }).then((resp) => {
          if (resp.status >= 200 && resp.status <= 300) {
          } else {
            window.alert("Internal Server Error")
            throw "Internal server error"
          }
        })
      },
      deleteMemberRequest: function(org) {
        fetch(`/users/${gon.user_id}/info/member_requests.json`).then((resp) => {
          return resp.text()
        }).then((data) => {
          var member_requests_data = JSON.parse(data);
          console.log(member_requests_data)

          var member_request_data = member_requests_data.filter(function(data) {
            return data.organization_id == org.id
          })
          if(member_request_data.length !== 1) {
            throw "Request not found"
          }

          member_request_data = member_request_data[0]

          return fetch(`/member_requests/${member_request_data.id}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCsrfToken()
            }
          })
        }).then((resp) => {
          if (resp.status >= 200 && resp.status <= 300) {
            this.organizations.splice(this.organizations.indexOf(org), 1)
          } else {
            throw "Internal server error"
          }
        }).catch((err) => {
          window.alert(err.toString())
        })
      },
    },
  })

  function getUserInfo() {
    if(gon.user_id) {
      fetch("/users/" + gon.user_id + ".json").then((resp) => {
        return resp.text();
      }).then((data) => {
        app.user = JSON.parse(data)
      })
    }
  }

  function getShowUserInfo() {
    var show_user = {}
    if(gon.show_user_id) {
      fetch("/users/" + gon.show_user_id + ".json").then((resp) => {
        return resp.text();
      }).then((data) => {
        show_user = JSON.parse(data)
        return fetch(`/users/${gon.show_user_id}/info/member_organizations`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        show_user["members"] = JSON.parse(data)
        return fetch(`/users/${gon.show_user_id}/info/subscriber_organizations`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        show_user["subscribers"] = JSON.parse(data)
        return fetch(`/users/${gon.show_user_id}/info/member_request_organizations`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        show_user["member_requests"] = JSON.parse(data)
      }).then(() => {
        app.show_user = show_user
      })
    }
  }

  function getShowUserOrgs() {
    if(gon.show_user_id) {
      fetch(`/users/${gon.show_user_id}/info/${gon.type}_organizations`).then((resp) => {
        return resp.text()
      }).then((data) => {
        app.organizations = JSON.parse(data);
      })
    }
  }
  getUserInfo()
  getShowUserInfo()
  getShowUserOrgs()
})
