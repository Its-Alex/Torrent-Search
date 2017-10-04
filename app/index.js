const map = require('async/map')
const fetch = require('node-fetch')
const sub = require('./providers/providers.js')

const config = JSON.parse(require('fs').readFileSync(require('path').resolve(require('path').dirname(__dirname), '.config.json'), 'UTF-8'))

class TorrentSearch {
  constructor () {
    this.activeProviders = ['yts', 'torrent9']
    this.tmdbKey = config.api.tmdb.key
    this.torrents = []
    this.lang = 'en-US'
    this.params = {
      query: null,
      imdbId: null,
      type: null,
      limit: 5,
      page: 0
    }
  }

  setActiveProviders (providers) {
    providers.forEach(elemt => {
      if (elemt === 'torrent9') this.activeProviders.push(elemt)
    })
  }

  getActiveProviders () {
    return this.activeProviders
  }

  getTorrents (id = this.query, type = this.type) {
    return new Promise((resolve, reject) => {
      this.parseArgs(id, type).then(res => {
        map(this.activeProviders, (elem, cb) => {
          if (sub[elem]) {
            sub[elem].getTorrents(this.params).then(res => {
              cb(null, res)
            }).catch(err => {
              cb(err, null)
            })
          }
        }, (err, results) => {
          let torrents = []
          if (err) reject(err)
          results.filter(p => p).forEach(elemt => {
            torrents = torrents.concat(elemt)
          })
          resolve(torrents)
        })
      }).catch(err => reject(err))
    })
  }

  parseArgs (id, type) {
    return new Promise((resolve, reject) => {
      if (type !== 'series' && type !== 'movies') return reject(new Error('Bad type!'))
      if (id.match(/^(tt|nm|ch|co|ev|ni)-{0,1}([0-9]{2,7})$/)) {
        this.imdb = id
        this.query = null
        return resolve()
      }
      resolve()
    })
  }
}

let t = new TorrentSearch()
t.getTorrents('deadpool', 'movies').then(res => {
  console.log(res[0])
}).catch(err => {
  console.log(err)
})

module.exports = TorrentSearch
