import Manager from "./Manager.js"
import Logger from "./Logger.js"
import dotenv from 'dotenv'
dotenv.config()

const bct = new Manager(process.env.ACCESS_TOKEN)

bct.connect().then((socket) => {
  socket.on('message', (m) => {
    Logger.websocket(m)
  })
})
