import { global } from "../index.mjs"
import { timeHandler } from "../lib/extension.mjs";
export default {
    info: "Durumum hakkında bilgi alırsın.",
    callback: (message, ...args) => {
        const status = global.captchaDetected ? global.paused ? "**DURAKLATILDI**" : "**CAPTCHA ÇÖZÜMÜNÜ BEKLİYOR**" : "BALIK TUTUYOR 🎣";
        message.reply(`__Uptime:__ **${timeHandler(global.startTime, Date.now())}**\n__Status:__ ${status}`)
    }
}