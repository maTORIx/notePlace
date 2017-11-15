function getUserInfo(id) {
  var user = {}
  fetch("/users/" + id + ".json").then((resp) => {
    return resp.text();
  }).then((data) => {
    user = JSON.parse(data)
    return fetch(`/users/${id}/info/member_organizations`)
  }).then((resp) => {
    return resp.text()
  }).then((data) => {
    user["members"] = JSON.parse(data)
    return fetch(`/users/${id}/info/subscriber_organizations`)
  }).then((resp) => {
    return resp.text()
  }).then((data) => {
    user["subscribers"] = JSON.parse(data)
    return fetch(`/users/${id}/info/member_request_organizations`)
  }).then((resp) => {
    return resp.text()
  }).then((data) => {
    user["member_requests"] = JSON.parse(data)
  }).then(() => {
    return user
  })
}


