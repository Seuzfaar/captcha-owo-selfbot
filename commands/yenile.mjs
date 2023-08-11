import { aCheck } from "../lib/SelfbotWorker.mjs"
export default {
    info: "Yapılandırmayı yeniden yükler.",
    callback: (message, ...args) => {
        try {
            aCheck(true);
            message.reply("Yapılandırma başarıyla yenilendi")
        } catch (error) {
            message.reply("Yapılandırma yenilenemedi.")
        }
    }
}