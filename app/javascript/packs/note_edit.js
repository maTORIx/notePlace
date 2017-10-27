import Vue from 'vue/dist/vue.min.js'
import marked from 'marked/marked.min.js'

document.addEventListener('DOMContentLoaded', () => {
  var original_scopes = [];
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
      "scopes" : [],
      "scopes_change": {add: [], delete: []},
      "orgs" : [],
      "input_scope_name": "",
      "form": {title: "", description: "", note: null}
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
      addScopeData: function(org_name) {
        var searched_orgs = this.orgs.filter(function(org, idx, users) {
          return org.name === org_name
        })
        if(searched_orgs.length !== 1) {
          return
        }
        var org = searched_orgs[0]
        if (!(this.scopes.includes(org))) {
          this.scopes.push(org)
          if(this.scopes_change.delete.includes(org)) {
            this.scopes_change.delete.splice(this.scopes_change.delete.indexOf(org), 1)
          }
          this.scopes_change.add.push(org)
        }
      },
      deleteScopeData: function(organization) {
        this.scopes.splice(app.scopes.indexOf(organization), 1)
        if(this.scopes_change.add.includes(organization)) {
          this.scopes_change.add.splice(this.scopes_change.add.indexOf(organization), 1)
        }
        this.scopes_change.delete.push(organization)
      },
      addScope: function(org) {
        console.log(this.note)
        fetch("/scopes", {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': getCsrfToken()
          },
          body: JSON.stringify({"scope":{
                                  "note_id": this.note.id,
                                  "organization_id": org.id
                                }
          })
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
        })
      },
      submitNote: function(event) {
        event.preventDefault();
        if(gon.note_id) {
          this.updateNote()
        } else {
          this.createNote()
        }
      },
      createNote: function() {
        var formData = new FormData()
        formData.append("note",this.form.note)
        formData.append("title",this.form.title)
        formData.append("description",this.form.description)
        formData.append("permit",true)
        fetch("/notes", {
          method: "POST",
          credentials: 'same-origin',
          headers: {
              'X-CSRF-Token': getCsrfToken()
          },
          body: formData
        }).then((resp) => {
          if (resp.status >= 200 && resp.status <= 300) {
            return resp.text()
          } else {
            throw "Can not send data"
          }
        }).then((data) => {
          this.note = JSON.parse(data)
          this.updateScope()
        })
      },
      updateNote: function() {
        var formData = new FormData()
        formData.append("note",this.form.note)
        formData.append("title",this.form.title)
        formData.append("description",this.form.description)
        formData.append("permit",true)
        fetch("/notes/" + gon.note_id, {
          method: "PUT",
          credentials: 'same-origin',
          headers: {
              'X-CSRF-Token': getCsrfToken()
          },
          body: formData
        }).then((resp) => {
          if (resp.status >= 200 && resp.status <= 300) {
            this.updateScope()
          } else {
            throw "Can not send data"
          }
        })
      },
      updateScope: function() {
        for(var scope of this.scopes_change.add) {
          console.log(scope)
          this.addScope(scope);
        }

        for(var scope of this.scopes_change.delete) {
          this.deleteScope(scope);
        }
      },
      selectedFile: function(e) {
        // 選択された File の情報を保存しておく
        let file = e.target.files[0];
        this.form.note = file;
      },
    },
    computed: {
      candidate_orgs: function() {
        return []
      }
    },
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
      fetch(`/notes/${gon.note_id}.json`).then((resp) => {
        return resp.text()
      }).then((data) => {
        app.form = JSON.parse(data)
        app.note = JSON.parse(data)
        return fetch(`/notes/${gon.note_id}/info/organizations`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        var orgs = JSON.parse(data)
        app.scopes = orgs
      })
    }
  }

  getUserInfo();
  getNoteInfo();
})