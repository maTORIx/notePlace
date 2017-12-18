import Vue from 'vue/dist/vue.min.js'
import marked from './marked.js'
import getData from "./getData.js"

document.addEventListener('DOMContentLoaded', () => {
  var original_scopes = [];

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
      "input_scope_name": "",
      "form": {title: "", description: "", note: null, scope_setting: ""},
      "markdown": "",
      "redirect": true,
      "isFile": true
    },
    methods: {
      parseHTML: function(src) { 
        return marked(src)
      },
      redirectTo: function(url) {
        location.href = url
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
      markToFile: function(markdown) {
        var blob = new Blob([markdown], {"type": "text/plain"});
        return new File([blob], "note.md")
      },
      submitNote: function(event) {
        event.preventDefault();
        return new Promise((resolve, reject) => {
          if(!this.isFile) {
            this.form.note = this.markToFile(this.markdown)
          }
          if(gon.note_id) {
            resolve(this.updateNote())
          } else {
            resolve(this.createNote())
          }
        }).then(() => {
          if(this.redirect) {
            location.href = `/notes/${this.note.id}`
            return
          }
        }).catch((err) => {
          window.alert(err.toString())
        })
      },
      createNote: function() {
        var formData = new FormData()
        formData.append("note",this.form.note)
        formData.append("title",this.form.title)
        formData.append("description",this.form.description)
        formData.append("scope_setting",this.form.scope_setting)
        formData.append("permit",true)
        
        return fetch("/notes", {
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
          console.log(data)
          this.note = JSON.parse(data)
          this.updateScope()
          return this.note
        })
      },
      updateNote: function() {
        var formData = new FormData()
        formData.append("note",this.form.note)
        formData.append("title",this.form.title)
        formData.append("description",this.form.description)
        formData.append("scope_setting",this.form.scope_setting)
        formData.append("permit",true)

        return fetch("/notes/" + gon.note_id, {
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
      },
      markedText: function() {
        return marked(this.markdown)
      },
      orgs: function() {
        return this.user.members
      },
      isAuthor: function() {
        if(gon.note_id) {
          return this.note.user_id == this.user.id
        } else {
          return true
        }
      }
    },
  })

  getData.getUserInfo(gon.user_id).then((user) => {
    app.user = user
  })

  function getNoteInfo() {
    if(gon.note_id) {
      fetch(`/notes/${gon.note_id}.json`, {credentials: "same-origin"}).then((resp) => {
        return resp.text()
      }).then((data) => {
        app.form = JSON.parse(data)
        app.note = JSON.parse(data)
        console.log(data)
        return fetch(`/notes/${gon.note_id}/info/organizations`)
      }).then((resp) => {
        return resp.text()
      }).then((data) => {
        var orgs = JSON.parse(data)
        app.scopes = orgs
        return fetch(`/notes/${gon.note_id}/file`, {credentials: "include"})
      }).then((resp) => {
        var extension = app.note.filename.split(".").pop();
        if(resp.status > 300 || resp.status < 200) {
          return ""
        }

        // check extension
        switch (extension) {
          case "md":
            return resp.text();
          default:
            return ""
        }
      }).then((data) => {
        app.form.markdown = data
        app.markdown = data
      }).catch((err) => {
        console.error(err.toString())
      })
    } else {
      console.error("Note ID not found")
    }
  }

  getNoteInfo();
})
