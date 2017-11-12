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
      "organization": {name: "none", description: "none", members: [], subscribers: [], member_requests:[]},
      "form": {user_email: ""},
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
      sendMemberRequest: function(event) {
        event.preventDefault();
        this.addMemberRequest(this.form.user_email)
      },
      addMemberRequest: function(user_email) {
        fetch("/member_requests", {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': getCsrfToken()
          },
          body: JSON.stringify({"member_request":{
                                  "user_email": user_email,
                                  "organization_id": this.organization.id
                                }
          })
        }).then((resp) => {
          if (resp.status >= 200 && resp.status <= 300) {
            getUserInfo()
          } else {
            window.alert("Internal Server Error")
            throw "Internal server error"
          }
        })
      },
      deleteMemberRequest: function(user) {
        fetch(`/org/${gon.organization_name}/info/member_requests`).then((resp) => {
          return resp.text()
        }).then((data) => {
          var member_requests_data = JSON.parse(data)

          var member_request_data = member_requests_data.filter(function(data) {
            return data.user_id == user.id
          })
          if(member_request_data.length !== 1) {
            throw "User not found"
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
          } else {
            window.alert("Internal Server Error")
            throw "Internal server error"
          }
        })
      },
      deleteMember: function(user) {
        fetch(`/org/${gon.organization_name}/info/members.json`).then((resp) => {
          return resp.text()
        }).then((data) => {
          var members_data = JSON.parse(data)
          var member_data = members_data.filter(function(data) {
            return data.user_id == user.id
          })
          if(member_data.length !== 1) {
            throw "User not found"
          }

          member_data = member_data[0]


          return fetch(`/members/${member_data.id}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCsrfToken()
            }
          })
        }).then((resp) => {
          if (resp.status >= 200 && resp.status <= 300) {
            this.organization.members.splice(this.organization.members.indexOf(user), 1)
          } else {
            window.alert("Internal Server Error")
            throw "Internal server error"
          }
        })
      }
    },
    computed: {
      targetUsers: function() {
        if(gon.type == "members") {
          return this.organization.members
        } else {
          return this.organization.subscribers
        }
      }
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

  function getTargetUsers() {
    if(gon.organization_name) {
      fetch(`/org/${gon.organization_name}/info/${gon.type}_users.json`).then((resp) => {
        return resp.text()
      }).then((data) => {
        app.users = JSON.parse(data)
      })
    }
  }

  getUserInfo()
  getOrganizationInfo()
  getTargetUsers()
})
