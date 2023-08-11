export default {
    info: "komutları yerine getirmesini/bir şey söylemesini sağlayın.",
    callback: (message, ...args) => {
        message.channel.send(args.join(" "));
    }
}