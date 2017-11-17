module.exports = {
  parseNoteDescription: function(src) {
    if(typeof src !== 'string') {
      return src;
    }
    console.log("hello")
    var text =  src.replace(/[&'`"<>]/g, function(match) {
      return {
        '&': '&amp;',
        "'": '&#x27;',
        '`': '&#x60;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;',
      }[match]
    });

    text = text.replace(/(?:\s|^)#([^#\s]+)/mg, function(matched, tag) {
      let prefix = matched.slice(0, matched.length - tag.length - 1)
      return `${prefix}<a href='/search/notes/%23${tag}'>#${tag}</a>`
    })

    text = text.replace(/\n/g, function(tag) {
      return `<br>`
    })

    text = text.replace(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/g, function(url) {
      return `<a href="${url}">${url}</a>`
    })

    return text
  },
}
