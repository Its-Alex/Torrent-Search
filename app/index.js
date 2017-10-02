var Xray = require('x-ray')
var x = Xray()

class TorrentSearch {
  constructor (props) {
    this.params = {
      provider: '',
      type: '',
      query: ''
    }
  }
}

x('http://www.torrent9.pe/search_torrent/series/walking-dead.html', '.')

module.exports = TorrentSearch
