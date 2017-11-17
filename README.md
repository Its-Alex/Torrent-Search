# Torrent search
---
Module to find some movies or series from torrent source
## How to get
```shell
npm install https://github.com/Its-Alex/torrent-search
```
ou
```shell
yarn add https://github.com/Its-Alex/torrent-search
```
## How to use
```javascript
let TorrentSearch = require('torrent-search')
const ts = new TorrentSearch()

let imdbID = 'tt123456'
let title = 'Deadpool'

ts.getTorrents(imdbID, title, 'movies' || 'series').then(torrents => {
    console.log(torrents)
}).catch(err => console.log(err))
```
Torrents are sort by priority of providers define in file for each source

