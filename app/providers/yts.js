const TorrentSkull = require('./torrentSkull.js')
const qs = require('query-string')
const fetch = require('node-fetch')
const each = require('async/each')

class Yts extends TorrentSkull {
  getTorrents (params) {
    return new Promise((resolve, reject) => {
      if (params.type !== 'movies') return resolve([])
      fetch('https://yts.ag/api/v2/list_movies.json?' + qs.stringify({
        limit: params.limit,
        page: params.page,
        query_term: params.query,
        sort_by: 'seeds'
      }))
      .then(res => {
        return res.json()
      })
      .then(res => {
        let limit = 0

        if (res.data.movie_count === 0) return resolve([])
        let torrents = []
        each(res.data.movies, elmt => {
          each(elmt.torrents, (torrent, index) => {
            if (limit >= params.limit) return
            limit++
            torrents.push({
              link: torrent.url,
              magnet: `magnet:?xt=urn:btih:${torrent.hash}&dn=URL+Encoded+Movie+Name&tr=http://track.one:1234/announce&tr=udp://track.two:80&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969`,
              quality: torrent.quality,
              seeds: torrent.seeds,
              size: torrent.size
            })
          }, (err) => {
            if (err) reject(err)
          })
        }, (err) => {
          if (err) reject(err)
        })
        resolve(torrents)
      })
      .catch(err => reject(err))
    })
  }
}

module.exports = Yts