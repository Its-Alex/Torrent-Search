const TorrentSkull = require('./torrentSkull.js')
const fetch = require('node-fetch')
const each = require('async/each')

class Eztv extends TorrentSkull {
  constructor (props) {
    super(props)

    this.type = ['imdb']
    this.provider = 'eztv'
  }

  getTorrents (params) {
    return new Promise((resolve, reject) => {
      console.log(params)
      fetch('https://eztv.ag/api/get-torrents?imdb_id=' + params.imdbId.slice(2))
      .then(res => {
        return res.json()
      }).then(res => {
        let torrents = []
        let limit = 0

        if (res.torrents_count < 20000 || res.torrents_count === 0) {
          return resolve(torrents)
        }
        each(res.torrents, (elmt, cb) => {
          if (limit >= params.limit) return cb()
          limit++
          torrents.push({
            imdbId: 'tt' + elmt.imdb_id,
            magnet: elmt.magnet_url
          })
          cb()
        }, (err) => {
          if (err) return reject(err)
          resolve(torrents)
        })
      }).catch(err => reject(err))
    })
  }
}

module.exports = Eztv
