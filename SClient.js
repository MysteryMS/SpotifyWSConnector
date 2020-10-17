import fetch from "node-fetch"
import events from 'events'
import Logger from "./Logger.js"

class SClient extends events.EventEmitter {
  constructor(socket, token) {
    super()
    this.socket = socket
    this.token = token
    socket.on('message', m => {
      const payload = JSON.parse(m)
      payload.type === 'pong' ? Logger.ping('Received') : Logger.websocket(payload)
      this.processRawMessage(m)
    })
  }


  processRawMessage(message) {
    const payload = JSON.parse(message)
    if (payload.type === 'message') return this.processMessage(payload)
    if (payload.type === 'pong') return this.begin()
  }

  processMessage(payload) {
    if (payload.uri.startsWith('hm://pusher/v1/connections')) {
      const connectionId = payload.headers['Spotify-Connection-Id']
      this.subscribe(encodeURIComponent(connectionId))
        .then(() => {
          Logger.info('[SUBSCRIBER] Fired')
          this.putDevice(connectionId).then(() => {
            Logger.info('[PUT DEVICE] Fired')
            this.begin().then(() => {
              Logger.ping('Begin cycle')
              this.registerDevice(connectionId).then(() => Logger.info('[REGISTER DEVICE] Fired'))
            })
          })
        })
    }
  }

  async begin() {
    return setTimeout(() => this.ping(), 30 * 1000)
  }

  ping() {
    Logger.ping('Fired')
    this.socket.send(JSON.stringify({type: 'ping'}))
  }


  subscribe(connectionID) {
    return fetch(`https://api.spotify.com/v1/me/notifications/user?connection_id=${connectionID}`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${this.token}`,
        origin: 'https://open.spotify.com',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty'
      }
    })
  }

  putDevice(connectionID) {
    return fetch('https://guc-spclient.spotify.com/track-playback/v1/devices', {
      method: 'PUT',
      headers: {
        'authorization': 'Bearer ' + this.token,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty'
      },
      body: JSON.stringify({
        "device": {
          "brand": "spotify",
          "capabilities": {
            "change_volume": true,
            "audio_podcasts": true,
            "enable_play_token": true,
            "play_token_lost_behavior": "pause",
            "disable_connect": false,
            "video_playback": true,
            "manifest_formats": ["file_urls_mp3", "file_urls_external", "file_ids_mp4", "file_ids_mp4_dual", "manifest_ids_video"]
          },
          "device_id": 'busetinha_aberta', // DEVICE ID
          "device_type": "computer",
          "metadata": {},
          "model": "web_player",
          "name": "Web Player (Chrome)",
          "platform_identifier": "web_player osx 10.15.4;chrome 80.0.3987.163;desktop"
        }, "connection_id": connectionID, "client_version": "harmony:4.0.0-4f6c892", "volume": 65535
      })
    })
  }

  registerDevice(connectionId) {
    return fetch(`https://guc-spclient.spotify.com/connect-state/v1/devices/hobs_busetinha`, {
      method: 'PUT',
      headers: {
        'authorization': 'Bearer ' + this.token,
        'x-spotify-connection-id': connectionId,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty'
      },
      body: JSON.stringify({
        member_type: "CONNECT_STATE",
        device: {
          device_info: {
            capabilities: {
              can_be_player: false,
              hidden: true
            }
          }
        }
      })
    })
  }
}

export default SClient
