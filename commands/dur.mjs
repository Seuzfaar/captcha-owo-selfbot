export default {
    info: "Çalışmasını Durdurun",
    callback: (message, ...args) => {
        message.reply("Kapatılıyor...")
        process.kill(process.pid, "SIGINT");
    }
}