const map = require('async/map')
const sub = require('./providers/providers.js')
class TorrentSearch {
  constructor () {
    this.activeProviders = ['torrent9']
    this.torrents = []
  }

  setActiveProviders (providers) {
    providers.forEach(elemt => {
      if (elemt === 'torrent9') this.activeProviders.push(elemt)
    })
  }

  getActiveProviders () {
    return this.activeProviders
  }

  getTorrents () {
    let self = this
    return new Promise((resolve, reject) => {
      map(self.activeProviders, (elem, cb) => {
        if (sub[elem]) {
          sub[elem].getTorrents().then(res => {
            cb(null, res)
          }).catch(err => {
            cb(err, null)
          })
        }
      }, (err, results) => {
        let torrents = []
        if (err) reject(err)
        results.forEach(elemt => {
          torrents = torrents.concat(elemt)
        })
        resolve(torrents)
      })
    })
  }
}


let t = new TorrentSearch()
t.getTorrents().then(res => {
  console.log(res)
}).catch(err => {
  console.log(err)
})

module.exports = TorrentSearch
