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
        console.log(meta.getAttribute('content'));
        return meta.getAttribute('content');
      }
    }
    return '';
  }

  var app = new Vue({
    el: '#app',
    data: {
      "user" : {},
      "note" : [],
      "scopes" : [{name: "user"}],
      "orgs" : [],
      "input_scope_name": ""
    },
    methods: {
      parseHTML: function(src) {
        var result 
        return result
      },
      redirectTo: function(note) {
        location.href = `/notes/${note.id}`
        return
      },
      addScope: function(org_name) {
        var searched_orgs = this.orgs.filter(function(org, idx, users) {
          return org.name === org_name
        })
        if(searched_orgs.length !== 1) {
          return
        }
        var org = searched_orgs[0]
        fetch("/scopes", {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': getCsrfToken()
          },
          body: JSON.stringify({"scope":{
                                  "note_id": gon.note_id,
                                  "organization_id": org.id
                                }
          })
        }).then((resp) => {
          if(resp.status >= 200 && resp.status < 300) {
            getNoteInfo()
          }
        })
      },
      deleteScope: function(organization) {
        fetch(`/notes/${gon.note_id}/info/scopes.json`).then((resp) => {
          return resp.text()
        }).then((data) => {
          var scopes = JSON.parse(data)
          var scopes = scopes.filter(function(scope, idx, src) {
            return scope.organization_id == organization.id
          });
          if (scopes.length !== 1) {
            throw "Scope not found"
          }
          var scope = scopes[0]

          return fetch(`/scopes/${scope.id}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCsrfToken()
            },
          })
        }).then((resp) => {
          if(resp.status >= 200 && resp.status < 300) {
            getNoteInfo()
            console.log(resp.text);
          }
        })
      }
    },
    computed: {
      candidate_orgs: function() {
        return []
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
        return fetch(`/users/${gon.user_id}/info/member_organizations`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        var orgs = JSON.parse(data)
        app.orgs = orgs
      })
    }
  }

  function getNoteInfo() {
    if(gon.note_id) {
      fetch(`/notes/${gon.note_id}/info/organizations`).then((resp) => {
        return resp.text()
      }).then((data) => {
        var member_orgs = JSON.parse(data)
        app.scopes = member_orgs
      })
    }
  }

  getUserInfo();
  getNoteInfo();
})