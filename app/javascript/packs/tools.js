var marked = require("./marked.js")

module.exports = {
  parseHTML: function(src) {
    if(typeof src !== 'string') {
      return src;
    }

    var text = src.replace(/(?:\s|^)#([^#\s]+)/mg, function(matched, tag) {
      let prefix = matched.slice(0, matched.length - tag.length - 1)
      return `${prefix}<a href='/search/notes/%23${tag}'>#${tag}</a>`
    })

    text = text.replace(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/g, function(url) {
      return `<a href="${url}">${url}</a>`
    })

    text = marked(text)

    return text
  },
}
