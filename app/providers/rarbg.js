const TorrentSkull = require('./torrentSkull.js')
const RarbgApi = require('rarbg')
const each = require('async/each')
const rarbg = new RarbgApi()

class Yts extends TorrentSkull {
  constructor (props) {
    super(props)

    this.provider = 'rarbg'
    this.priority = 2
    this.type = ['movies', 'series']
    this.supportImdb = true
    this.supportQuery = true
  }

  getTorrents (params) {
    return new Promise((resolve, reject) => {
      let conf = {
        search_imdb: params.imdbId,
        search_string: !params.imdbId ? params.query : '',
        category: (params.type === 'movies') ? 'movies' : (params.type === 'series') ? 'tv' : 'movies',
        min_seeders: 30,
        sort: 'last'
      }
      if (!params.imdbId) delete conf.search_imdb
      rarbg.search(conf).then(res => {
        let torrents = []
        each(res, (elmt, cb) => {
          let obj = {
            magnet: elmt.download,
            quality: (elmt.category) ? elmt.category.split('/')[2] : null
          }
          torrents.push(obj)
          cb()
        }, err => {
          if (err) reject(err)
          resolve(torrents)
        })
      }).catch(err => {
        console.log(err)
        resolve([])
      })
    })
  }
}

module.exports = Yts
