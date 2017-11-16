module.exports = {
  getUserInfo: function(user_id) {
    var user = {}
    return fetch("/users/" + user_id + ".json").then((resp) => {
      return resp.text();
    }).then((data) => {
      user = JSON.parse(data)
      return fetch(`/users/${user_id}/info/member_organizations`)
    }).then((resp) => {
      return resp.text()
    }).then((data) => {
      user["members"] = JSON.parse(data)
      return fetch(`/users/${user_id}/info/subscriber_organizations`)
    }).then((resp) => {
      return resp.text()
    }).then((data) => {
      user["subscribers"] = JSON.parse(data)
      return fetch(`/users/${user_id}/info/member_request_organizations`)
    }).then((resp) => {
      return resp.text()
    }).then((data) => {
      user["member_requests"] = JSON.parse(data)
    }).then(() => {
      return user
    })
  },
  getOrganizationInfo: function(org_name) {
    var organization = {}
    return fetch(`/org/${org_name}.json`).then((resp) => {
      return resp.text()
    }).then((data) => {
      organization = JSON.parse(data);
      return fetch(`/org/${org_name}/info/member_users.json`)
    }).then((resp) => {
      return resp.text()
    }).then((data) => {
      organization["members"] = JSON.parse(data)
      return fetch(`/org/${org_name}/info/subscriber_users.json`)
    }).then((resp) => {
      return resp.text()
    }).then((data) => {
      organization["subscribers"] = JSON.parse(data)
      return fetch(`/org/${org_name}/info/member_request_users.json`)
    }).then((resp) => {
      return resp.text()
    }).then((data) => {
      organization["member_requests"] = JSON.parse(data)
    }).then(() => {
      return organization
    })
  },
  getNotesUsers: function(notes) {
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
      }).then((data) => {
        return JSON.parse(data)
      })
    }))
  },
  getOrgNotes: function(org_name) {
    var notes = []
    return fetch("/org/" + gon.organization_name + "/info/notes.json").then((resp) => {
      return resp.text();
    }).then((data) => {
      notes = JSON.parse(data)
      
      notes = notes.sort(function(note1, note2) {
        return note2.id > note1.id
      })
    }).then(() => {
      return notes
    })
  },
  getUserNotes: function(user_id) {
    var notes = []
    return fetch("/users/" + user_id + "/info/notes.json").then((resp) => {
      return resp.text();
    }).then((data) => {
      notes = JSON.parse(data)
      notes = notes.sort(function(note1, note2) {
        return note2.id > note1.id
      })
    }).then(() => {
      return notes
    })
  },
  getUserStarNotes: function(user_id) {
    var star_notes = []
    return fetch("/users/" + user_id + "/info/star_notes.json").then((resp) => {
      return resp.text();
    }).then((data) => {
      star_notes = JSON.parse(data)

      star_notes = star_notes.sort(function(note1, note2) {
        return note2.id > note1.id
      })
    }).then(() => {
      return star_notes
    })
  },
  getTimelineNotes: function(user_id) {
    var notes = []
    return fetch("/users/" + gon.user_id + "/info/timeline.json").then((resp) => {
      return resp.text();
    }).then((data) => {
      notes = JSON.parse(data)
      
      notes = notes.sort(function(note1, note2) {
        return note2.id > note1.id
      })
    }).then(() => {
      return notes
    })
  },
}
