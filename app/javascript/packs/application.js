import Vue from 'vue/dist/vue.min.js'

document.addEventListener('DOMContentLoaded', () => {
  var app = new Vue({
    el: '#header',
    data: {
      "header_search_text" : ""
    },
    methods: {
      parseHTML: function(src) {
        var result = marked(src)
        return result
      },
      search: function() {
        location.href = `/search/notes/${this.search_text}`
      }
    }
  })
})