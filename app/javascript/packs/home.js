import Vue from 'vue/dist/vue.min.js'

document.addEventListener('DOMContentLoaded', () => {
  console.log("hello")
  var app = new Vue({
    el: '#app',
    data: {
      "user" : {},
      "user_notes" : []
    },
    methods: {
      parseHTML: function(src) {
        var result = src.replace(/[&'`"<>]/g, function(match) {
          return {
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
          }[match]
        });
        result = result.split("\n").join("<br>")
        console.log(result)
        return result
      }
    }
  })
  if(gon.user_id) {
    fetch("/users/" + gon.user_id + ".json").then((resp) => {
      return resp.text();
    }).then((data) => {
      app.user = JSON.parse(data)
    })
    fetch("/users/" + gon.user_id + "/info/notes.json").then((resp) => {
      return resp.text();
    }).then((data) => {
      console.log(data)
      app.user_notes = JSON.parse(data)
    })
  }
})
