import { global } from "../index.mjs"
export default {
    info: "Duraklatır.",
    callback: (message, ...args) => {
        if(global.captchaDetected) {
            if(global.paused) return message.reply("Zaten duraklatıldı!")
            else return message.reply("**İŞLEM GEREKLİ!** Duraklatmadan önce captcha görüntüsünü çözmelisiniz")
        }
        else {
            global.captchaDetected = true
            global.paused = true
            message.reply("Duraklatıldı!")
        }
    }
}