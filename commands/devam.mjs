import { global } from "../index.mjs"
import { main } from "../lib/SelfbotWorker.mjs"
export default {
    info: "Duraklatılmışsa devam eder.",
    callback: (message, ...args) => {
        if(global.captchaDetected) {
            if(global.paused) {
                global.captchaDetected = false
                global.paused = false
                message.reply("Devam ettirildi!")
                main();
            }
            else return message.reply("**İŞLEM GEREKLİ!** Çalıştırmadan önce captcha görüntüsünü çözmelisiniz.")
        } else return message.reply("Duraklatılmadı!")
    }
}