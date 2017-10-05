const TorrentSkull = require('./torrentSkull.js')
const EztvApi = require('eztv-api-pt')
// const each = require('async/each')

class Eztv extends TorrentSkull {
  constructor (props) {
    super(props)

    this.eztv = new EztvApi()
    this.provider = 'eztv'
    this.type = ['series']
  }

  getTorrents (params) {
    return new Promise((resolve, reject) => {
      // if ()
    })
  }
}

module.exports = Eztv
