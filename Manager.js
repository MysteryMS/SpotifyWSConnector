import axios from "axios"
import ws from "@clusterws/cws"
import SClient from './SClient.js'

const SPOTIFY_STREAM = (endpoint, token) => `ws${endpoint.endsWith('443') ? 's' : ''}://${endpoint.split(':')[0]}/?access_token=${token}`

class Manager {
  constructor(token) {
    /**
     * @type string
     */
    this.token = token
  }

  async getDealer() {
    const r = await axios.get('https://apresolve.spotify.com/?type=dealer&type=spclient')
    return r.data.dealer[0]
  }

  connect() {
    return this._connect().then(({ socket, token }) => new SClient(socket, token))
  }

  async _connect() {
    const D = await this.getDealer()
    return { socket: new ws.WebSocket(SPOTIFY_STREAM(D, this.token)), token: this.token }
  }
}

export default Manager
