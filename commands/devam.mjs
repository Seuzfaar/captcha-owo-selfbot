import { global } from "../index.mjs"
import { main } from "../lib/SelfbotWorker.mjs"
export default {
    info: "Selfbot duraklatılmışsa devam eder.",
    callback: (message, ...args) => {
        if(global.captchaDetected) {
            if(global.paused) {
                global.captchaDetected = false
                global.paused = false
                message.reply("Selfbot devam ettirildi!")
                main();
            }
            else return message.reply("**İŞLEM GEREKLİ!** Selfbot'u çalıştırmadan önce captcha görüntüsünü çözmelisiniz")
        } else return message.reply("Selfbot duraklatılmadı!")
    }
}