import Vue from 'vue/dist/vue.esm'

document.addEventListener('DOMContentLoaded', () => {
  const app = new Vue({
    el: '#app',
    data: {
      user : {},
    }
  })

  fetch("/users/" + gon.user_id + ".json").then((resp) => {
    return resp.text();
  }).then((data) => {
    app.user = JSON.parse(data)
  })
})