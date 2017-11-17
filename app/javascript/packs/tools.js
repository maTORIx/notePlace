import marked from 'marked/marked.min.js'

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

module.exports = {
  parseNoteDescription: function(src) {
    var text = src.replace(/[#＃][Ａ-Ｚａ-ｚA-Za-z一-鿆0-9０-９ぁ-ヶｦ-ﾟー]+/g, function(tag) {
      return `<a href='/search/notes/${tag}'>${tag}</a>`
    })

    text = src.replace(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/g, function(url) {
      return `<a href="${url}">${url}</a>`
    })

    return text
  },
  parseMarkDown: function(src) {
    return marked(src)
  },
}