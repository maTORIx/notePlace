module.exports = {
  getCsrfToken: function() {
    const metas = document.getElementsByTagName('meta');
    for (let meta of metas) {
      if (meta.getAttribute('name') === 'csrf-token') {
        console.log(meta.getAttribute('content'));
        return meta.getAttribute('content');
      }
    }
    return '';
  },
  subscribe: function(org, user) {
    return fetch("/subscribers", {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCsrfToken()
      },
      body: JSON.stringify({"subscriber":{
                              "user_id": user.id,
                              "organization_id": org.id
                            }
      })
    }).then((resp) => {
      if (resp.status >= 200 && resp.status <= 300) {
        return resp.text()
      } else {
        throw "Internal server error"
      }
    }).then((data) => {
      return JSON.parse(data)
    })
  },
  unsubscribe: function(org, user) {
    return fetch(`/users/${user.id}/info/subscribers.json`).then((resp) => {
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
            'X-CSRF-Token': this.getCsrfToken()
        },
      })
    }).then((resp) => {
      if (!(resp.status >= 200 && resp.status <= 300)) {
        throw "Internal server error"
      }
    })
  },
  sendMemberRequest: function(org, user_email) {
    return fetch("/member_requests", {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCsrfToken()
      },
      body: JSON.stringify({"member_request":{
                              "user_email": user_email,
                              "organization_id": org.id
                            }
      })
    }).then((resp) => {
      if (resp.status >= 200 && resp.status <= 300) {
        return resp.text()
      } else {
        throw "Internal server error"
      }
    }).then((data) => {
      return JSON.parse(data)
    })
  },
  destroyMemberRequest: function(org, user) {
    return fetch(`/org/${org.name}/info/member_requests`).then((resp) => {
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
            'X-CSRF-Token': this.getCsrfToken()
        }
      })
    }).then((resp) => {
      if (!(resp.status >= 200 && resp.status <= 300)) {
        throw "Internal server error"
      }
    })
  },
  acceptMemberRequest: function(org, user) {
    return fetch(`/users/${user.id}/info/member_requests.json`).then((resp) => {
      return resp.text()
    }).then((data) => {
      var member_requests_data = JSON.parse(data);

      var member_request_data = member_requests_data.filter(function(data) {
        return data.organization_id == org.id
      })
      if(member_request_data.length < 1) {
        throw "Request not found"
      }
      member_request_data = member_request_data[0]
      return fetch(`/members`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': this.getCsrfToken()
        },
        body: JSON.stringify({member: {request_id: member_request_data.id}})
      })
    }).then((resp) => {
      if (resp.status >= 200 && resp.status <= 300) {
        return resp.text()
      } else {
        throw "Internal server error"
      }
    }).then((data) => {
      return data
    })
  },
  destroyMember: function(org, user) {
    return fetch(`/org/${org.name}/info/members.json`).then((resp) => {
      return resp.text()
    }).then((data) => {
      var members_data = JSON.parse(data)
      var member_data = members_data.filter(function(data) {
        return data.user_id == user.id
      })
      if(member_data.length < 1) {
        throw "User not found"
      }
      member_data = member_data[0]
      return fetch(`/members/${member_data.id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': this.getCsrfToken()
        }
      })
    }).then((resp) => {
      if (resp.status >= 200 && resp.status <= 300) {
        return resp.text()
      } else {
        throw "Internal server error"
      }
    }).then((data) => {
      return data
    })
  },
}