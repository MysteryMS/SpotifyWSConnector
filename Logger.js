import chalk from "chalk"

export default class Logger {

  static info(message) {
   console.log(chalk.blue(message))
  }

  static error(message) {
    console.log(chalk.red(message))
  }

  static websocket(message) {
    console.log(chalk.bgBlack.cyan('[WEBSOCKET]'), message)
  }

  static ping(message) {
    console.log(chalk.rgb(250, 84, 42)('[PING] ' + message))
  }
}
