const map = require('async/map')
const sub = require('./providers/providers.js')

// const config = JSON.parse(require('fs').readFileSync(require('path').resolve(require('path').dirname(__dirname), '.config.json'), 'UTF-8'))

class TorrentSearch {
  constructor () {
    this.activeProviders = ['eztv']
    this.torrents = []
    this.params = {
      imdbId: null,
      query: null,
      type: null,
      limit: 5,
      page: 0,
      lang: 'en-US'
    }
  }

  setActiveProviders (providers) {
    providers.forEach(elemt => {
      if (elemt === 'torrent9') this.activeProviders.push(elemt)
      if (elemt === 'yts') this.activeProviders.push(elemt)
      if (elemt === 'eztv') this.activeProviders.push(elemt)
    })
  }

  getActiveProviders () {
    return this.activeProviders
  }

  getTorrents (id = this.params.query, type = this.params.type) {
    return new Promise((resolve, reject) => {
      this.parseArgs(id, type).then(res => {
        map(this.activeProviders, (elem, cb) => {
          if (sub[elem]) {
            if (sub[elem].type.indexOf(type) === -1) return cb(null, [])
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
      if (type !== 'series' && type !== 'movies' && type !== 'imdb') return reject(new Error('Bad type!'))
      this.params.type = type
      if (id.match(/^(tt|nm|ch|co|ev|ni)-{0,1}([0-9]{2,7})$/) && type === 'imdb') {
        this.params.imdbId = id
        this.params.query = null
      } else {
        this.params.imdbId = null
        this.params.query = id
      }
      resolve()
    })
  }
}

let t = new TorrentSearch()
t.getTorrents('tt4488724', 'imdb').then(res => {
  console.log(res)
}).catch(err => {
  console.log(err)
})

module.exports = TorrentSearch
