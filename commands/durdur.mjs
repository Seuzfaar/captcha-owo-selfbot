export default {
    info: "Anında programı kapatır.",
    callback: (message, ...args) => {
        message.reply("Kapatılıyor...")
        process.kill(process.pid, "SIGINT");
    }
}