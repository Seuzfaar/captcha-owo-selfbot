process.title = "OwO Captcha Doğrulamalı Farm Botu © 2023 Seuzfaar"

//import libraries

import path from "path"
import fs from "fs"
import os from "os"

//import files

import { collectData } from "./lib/DataCollector.mjs"
import { log } from "./lib/console.mjs"
import { commandHandler, randomInt, reloadPresence, sleep, solveCaptcha, timeHandler } from "./lib/extension.mjs"
import { main, notify } from "./lib/SelfbotWorker.mjs"

//define variables
export const FolderPath = path.join(os.homedir(), "data")
export const DataPath = path.resolve(FolderPath, "./data.json")
const LangPath = path.resolve(FolderPath, "./language.json")
let Data = JSON.parse(fs.existsSync(DataPath) ? fs.readFileSync(DataPath) : "{}")

//global variables
export var global = {
    owoID: "408785106942164992",
    commands: {

    }
}
global.channel, global.config, global.language, global.totalcmd = 0, global.totaltext = 0, global.timer = 0;
global.captchaDetected = false, global.paused = false, global.lastTime = 0;

//check data

if(!fs.existsSync(FolderPath)) {
    fs.mkdirSync(FolderPath)
    fs.writeFileSync(DataPath, "{}")
}

//Process Error Handler

process.on('unhandledRejection', (err) => {
    console.log(err);
    log(err, "PROMISE.ERROR")
});

process.on("SIGINT", function () {
    console.log("\n")
    console.log("\x1b[92mToplam gönderilen komut sayısı: \x1b[0m" + global.totalcmd)
    console.log("\x1b[92m \x1b[0m" + global.totaltext)
    console.log("\x1b[92mToplam aktif zaman: \x1b[0m" + timeHandler(global.startTime, Date.now()))
    console.log("\x1b[36mSELFBOT DURDU!!\x1b[0m")
    process.exit(1)
});

/**
 *CopyRight © 2023 Seuzfaar
**/

(async () => {
    const { client, conf } = await collectData(Data, DataPath);
    global.config = conf;
    client
    .on("ready", async () => {
        log("\x1b[94mLogged In As " + client.user.username, "i")
        global.startTime = new Date();
        reloadPresence(client);
        if(global.config.cmdPrefix) await commandHandler()
        global.channel = client.channels.cache.get(global.config.channelID[0]);
        main();
    })
    .on("shardReady", () => reloadPresence(client))
    .on("messageCreate", async (message) => {
        if(message.author.id == global.owoID) {
            if(((message.content.includes(message.client.user.username) || 
                message.content.includes(message.guild.members.me.displayName) || 
                message.content.includes(message.client.user.id)) && 
                message.content.match(/are you a real human|(check|verify) that you are.{1,3}human!/igm)) || 
                (message.content.includes('Beep Boop') && message.channel.type == 'DM')) {
                global.captchaDetected = true;
                console.log("\n");
                console.log("\x1b[92mToplam gönderilen komut sayısı: \x1b[0m" + global.totalcmd);
                console.log("\x1b[92mToplam gönderilen metin sayısı: \x1b[0m" + global.totaltext);
                console.log("\x1b[92mToplam aktif zaman: \x1b[0m" + timeHandler(global.startTime, Date.now()));
                console.log("\x1b[36mSELFBOT DURDU!!\x1b[0m");

                if(!global.config.autoResume && !global.config.captchaAPI) process.exit(1);

                else if([1, 2].includes(global.config.captchaAPI)) {
                    if(message.attachments) {
                        try {
                            var attempt = await solveCaptcha(message.attachments.first().url);
                            if(!attempt || attempt.match(/\d/)) {
                                log("CAPTCHA Çözme Sistemi dönüşü: " + attempt, "i");
                                throw new Error();
                            }
                            const owo = message.client.users.cache.get(global.owoID);
                            if(!owo.dmChannel) owo.createDM();
                            await sleep(randomInt(4000, 12000));
                            await owo.send(attempt);
                            const filter = m => m.author.id == global.owoID;
                            const collector = owo.dmChannel.createMessageCollector({filter, max: 1, time: 15_000});
                            collector.on("collect", async msg => {
                                if (msg.content.match(/verified that you are.{1,3}human!/igm)) return await notify(message, true);
                                return await notify(message);
                            })
                        } catch (error) {
                            log("CAPTCHA çözmeye çalışma başarısız oldu.", "e")
                            console.log(error);
                            return await notify(message)
                        }
                    }
                    else log("CAPTCHA resmi bulunamadı!", "i")
                }
                else log("CAPTCHA'nın çözülmesi için yeniden başlatmayı bekliyorum...", "i")
            }

            else if(message.content.match(/verified that you are.{1,3}human!/igm) && message.channel.type == 'DM') {
                log(`CAPTCHA çözüldü.${global.config.autoResume ? ", SELFBOT YENİDEN BAŞLATILIYOR..." : ""}`, "i");
                if(!global.config.autoResume) process.exit(1);
                global.captchaDetected = false;
                main();
            }

            else if(message.content.match(/have been banned/) && (message.channel.type == 'DM' || message.content.includes(message.guild.members.me.displayName))) {
                log("HESAP YASAKLANDI,SELFBOT DURDURULUYOR...", "e")
                process.kill(process.pid, "SIGINT");
            }
        }
        if(message.author.id == global.config.userNotify) {
            let msgr = message
            if(message.channel.type == "DM" && global.captchaDetected && message.channel.recipient.id === global.config.userNotify) {
                if(message.content.match(/^[a-zA-Z]{3,6}$/)) {
                    let filter = m => m.author.id === global.owoID && m.channel.type == 'DM' && m.content.match(/(wrong verification code!)|(verified that you are.{1,3}human!)|(have been banned)/gim)
                    try {
                        const owo = message.client.users.cache.get(global.owoID)
                        if(!owo.dmChannel) owo.createDM()
                        await owo.send(message.content)
                        const collector = owo.dmChannel.createMessageCollector({filter, max: 1, time: 15_000})
                        collector.on("collect", msg => {
                            console.log(msg.content);
                            msgr.reply(msg.content)
                        })
                    } catch (error) {
                        msgr.reply("Bir hata oluştu, lütfen hesabı kendiniz kontrol edin.")
                    }
                } else {
                    return msgr.reply("Hatalı sözdizimi, bu mesaj OwO Bot'a gönderilmeyecek!")
                }
            } 
        } 
    }).on("messageCreate", async message => {
        if(global.config.cmdPrefix && (message.author.id == global.config.userNotify || message.author.id == message.client.user.id)) {
            if(!message.content.startsWith(global.config.cmdPrefix)) return;
            const args = message.content.slice(global.config.cmdPrefix.length).split(/ +/)
            const commandName = args.shift().toLowerCase()
            if(!global.commands[commandName]) return;
            try {
                message.channel.sendTyping();
                await sleep(randomInt(680, 3400));
                await global.commands[commandName].callback(message, ...args)
            } catch (error) {
                log("Komutu gerçekleştirmeye çalışırken bir hata oluştu.", "e")
                console.log(error);
            }
        }
    })
    client.emit("ready")
})()