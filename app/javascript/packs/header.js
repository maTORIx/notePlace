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

  var header = new Vue({
    el: '#header',
    data: {
      "header_search_text" : "",
      "user": {id: null, name: "John Doe", description: "none", members: [], member_requests: [], subscribers: []}
    },
    methods: {
      search: function() {
        location.href = `/search/notes/${this.header_search_text}`
      },
      redirectTo: function(url) {
        location.href = url
      }
    }
  })

  var header_drawer = new Vue({
    el: '#header_drawer',
    data: {
      "user": {id: null, name: "John Doe", description: "none", members: [], member_requests: [], subscribers: []}
    },
    methods: {
      parseHTML: function(src) {
        var result = marked(src)
        return result
      },
      search: function() {
        location.href = `/search/notes/${this.search_text}`
      },
      redirectTo: function(url) {
        location.href = url
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
        header.user = user
        header_drawer.user = user
      })
    }
  }

  getUserInfo()
})