export default {
    info: "Pingini gösterir.",
    callback: (message, ...args) => {
        message.reply(`Pong! ${message.client.ws.ping}ms`);
    }
}