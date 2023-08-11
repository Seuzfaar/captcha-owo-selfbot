import { aCheck } from "../lib/SelfbotWorker.mjs"
export default {
    info: "Yapılandırmayı Yeniden Yükler",
    callback: (message, ...args) => {
        try {
            aCheck(true);
            message.reply("Yapılandırma başarıyla yenilendi")
        } catch (error) {
            message.reply("Yapılandırma yenilenemedi.")
        }
    }
}