import Vue from 'vue/dist/vue.min.js'
import marked from 'marked/marked.min.js'
import getData from "./getData.js"
import sendData from "./sendData.js"

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
        sendData.acceptMemberRequest(org, this.user).then((data) => {
          this.organizations.splice(this.organizations.indexOf(org), 1)
        }).catch((err) => {
          window.alert(err.toString())
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

  getData.getUserInfo(gon.user_id).then((user) => {
    app.user = user
    return getData.getUserInfo(gon.show_user_id)
  }).then((user) => {
    app.show_user = user
    app.organizations = user[gon.type]
    console.log(gon.type)
  })
})
