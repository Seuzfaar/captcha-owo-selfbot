import { accountCheck, accountRemove, checkUpdate } from "./extension.mjs";
import { getResult, trueFalse, listCheckbox } from "./prompt.mjs";
import { log } from "./console.mjs";
import { DataPath, global } from "../index.mjs";

import fs from "fs";
import path from "path";

var client = null, cache, conf;
var guildid, channelid, waynotify, webhookurl, usernotify, autocaptcha, apiuser, apikey, musicpath, gemorder, prefix;
var autodaily, autopray, autoquote, autoother, autogem, autosleep, autoresume, autorefresh, autolootbox, autoslash;

function listDocument() {
    const document = 
`\x1b[1mYapımcım

    \x1b[2m- \x1b[1mSeuzfaar - \x1b[1m[\x1b[0mOluşturucu\x1b[1m]

\x1b[1mHepinize çok teşşekkür ederim. ♥
    \x1b[0m
        Merhaba, benim adım Seuzfaar ve aracımı kullandığınız için size teşekkür etmek için biraz zaman ayırmak istedim.

        2022'den beri bu proje kar amacı gütmüyor. Ama yine de onu olabilecek en iyi hale getirmeye kararlıyım.
       
        Captcha çözme ve alıntı yapma gibi API'lerle... deneyiminizi daha sorunsuz ve daha verimli hale getirmeye çalışıyorum.
   
        Ne yazık ki, finansman ilerlememin önünde bir engel haline geldi. Küçük bir bağışla bana yardım etmek ister misin
       
        Bir kahve fincanının fiyatı bile devam etmem için çok yol kat edebilir. Her zerre yardımcı olur, benim için dünyalar demektir.
   
        Zaman ayırdığınız ve değerlendirdiğiniz için teşekkür eder, aracımızdan keyif almaya devam edeceğinizi umarım!`
    const obj = listCheckbox("list", document, [
        {name: "Bağış Yapmak İster Misin?", value: 1},
        {name: "Geri", value: -1},
    ]);
    return obj;
}

function listAccount(data) {
    const obj = listCheckbox("list", "Giriş yapmak için bir hesap seçin", [
        ...new Set(Object.values(data).map(user => user.tag)), 
        {name: "Yeni Hesap (Tokenle Giriş Yap)", value: 0},
        {name: "Yeni Hesap (QR Kod İle Giriş Yap)", value: 1},
        {name: "Yeni Hesap (Şifren İle Giriş Yap - Bilgilerin Gerekir)", value: 2},
        {name: "Hakkımızda - ?", value: 3},
    ])
    obj.filter = (value) => {
        const user = Object.values(data).find(u => u.tag == value);
        if(user) return Buffer.from(user.token.split(".")[0], "base64").toString();
        else return value;
    }
    return obj;
};

function getToken() {
    return {
        type: "input",
        validate(token) {
            return token.split(".").length === 3 ? true : "Geçersiz Token";
        },
        message: "Tokeninizi Girin"
    };
}

function getAccount() {
    return [{
        type: "input",
        message: "E-postanızı/Telefon Numaranızı Girin: ",
        validate(ans) {
            return ans.match(/^((\+?\d{1,2}\s?)?(\d{3}\s?\d{3}\s?\d{4}|\d{10}))|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/) ? true : "Geçersiz E-posta/Telefon Numarası";
        }
    }, {
        type: "password",
        message: "Şifrenizi Girin: ",
        validate(ans) {
            return ans.match(/^.+$/) ? true : "Şifreniz Doğru Değil";
        }
    }, {
        type: "input",
        message: "2/FA Yedekleme Kodunuzu Girin: ",
        validate: (ans) => {
            return ans.match(/^([0-9]{6}|[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4})$/) ? true : "2/FA Yedekleme Kodunuzu Doğru Yazdığınızdan Emin Olun!"
        }
    }];

}

function listGuild(cache) {
    const obj = listCheckbox("list", "Farm yapmak için bir sunucu seçin", client.guilds.cache.map(guild => ({name: guild.name, value: guild.id})))
    if(cache && client.guilds.cache.get(cache)) obj.default = () => {
        const guild = client.guilds.cache.get(cache)
        return guild.id
    };
    return obj;
}

function listChannel(cache) {
    const guild = client.guilds.cache.get(guildid);
    const channelList = guild.channels.cache.filter(cnl => ["GUILD_NEWS", "GUILD_TEXT"].includes(cnl.type) && cnl.permissionsFor(guild.members.me).has(["VIEW_CHANNEL", "SEND_MESSAGES"]))
    const obj = listCheckbox("checkbox", "Farm yapmak için kanalları seçin (Birden fazla kanal seçilirse farm kanalları rastgele değiştirilir)", [{name: "Sunuc listesine geri dön <-", value: -1}, ...channelList.map(ch => ({name: ch.name, value: ch.id}))])
    obj.validate = (ans) => {return ans.length > 0 ? true : "Lütfen En Az Bir Kanal Seçin!" }
    if(cache && channelList.some(cn => cache.indexOf(cn.id) >= 0)) obj.default = [...channelList.filter(channel => cache.indexOf(channel.id) >= 0).map(channel => channel.id)];
    return obj;
}

function wayNotify(cache) {
    const obj = listCheckbox(
        "checkbox", 
        "selfbot bir captcha aldığında nasıl bilgilendirilmek istediğinizi seçin", 
        [
            {name: "Muzik", value: 3},
            {name: "Webhook", value: 0}, 
            {name: "Mesaj (Arkadaş Olmalısın)", value: 1}, 
            {name: "Arama (Arkadaş Olmalısın)", value: 2}
        ]
    )
    if(cache) obj.default = cache;
    return obj;
}

function webhook(cache) {
    const obj = {
        type: "input",
        message: "Webhook Bağlantınızı Girin",
        validate(ans) {
            return ans.match(/(^.*(discord|discordapp)\.com\/api\/webhooks\/([\d]+)\/([a-zA-Z0-9_-]+)$)/gm) ? true : "Webhook Bağlantınız Hatalı"
        }
    }
    if(cache) obj.default = cache;
    return obj;
}

function userNotify(cache){
    const obj = {
        type: "input",
        message: "Webhook/Arama/Mesaj yoluyla bilgilendirilmek istediğiniz kullanıcının ID'sini girin",
        async validate(ans) {
            if(waynotify.includes(1) || waynotify.includes(2)) {
                if(ans.match(/^\d{17,19}$/)) {
                    if(ans == client.user.id) return "ID Geçersizdir. Lütfen başka birinin ID'sini giriniz!"
                    const target = client.users.cache.get(ans);
                    if(!target) return "Kullanıcı bulunamadı";
                    if(target.relationships == "FRIEND") return true;
                    else if(target.relationships == "PENDING_INCOMING") {
                        try {
                            await target.setFriend();
                            return true;
                        } catch (error) {
                            return "Kullanıcının arkadaşlık isteği kabul edilemedi"
                        }
                    }
                    else if(target.relationships == "PENDING_OUTGOING") return "Lütfen selfbot'un arkadaşlık isteğini kabul edin"
                    else if(target.relationships == "NONE") {
                        try {
                            await target.sendFriendRequest();
                            return "Lütfen selfbot'un arkadaşlık isteğini kabul edin"
                        } catch (error) {
                            return "Bu kullanıcıya arkadaşlık isteği gönderilemedi"
                        }
                    }
                }
            }
            return ans.match(/^(\d{17,19}|)$/) ? true : "Geçersiz kullanıcı kimliği!"
        }
    }
    if(cache) obj.default = cache;
    return obj;
}

function music1(cache) {
    const obj = {
        type: "input",
        message: "Müzik dosyasını/yol dizinini girin",
        validate(answer) {
            if(!answer.match(/^([a-zA-Z]:)?(\/?[^\/\0]+)+(\/[^\/\0]+)?$/)) return "Geçersiz dizin";
            const supportedAudioExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac'];
            if(!fs.existsSync(answer)) return "Yol Bulunamadı";
            const stats = fs.statSync(answer)
            if(stats.isDirectory()) {
                if(fs.readdirSync(answer).some(file => supportedAudioExtensions.includes(path.extname(path.join(answer, file))))) return true;
                else return "Bu Dizinde Desteklenen Dosya Bulunamadı"
            }
            if((stats.isFile() && supportedAudioExtensions.includes(path.extname(answer)))) return true;
            return "Geçersiz dizin";
        }
    };
    if(cache) obj.default = cache;
    return obj;
}

function music2(folder) {
    const supportedAudioExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac'];
    const files = fs.readdirSync(folder)
    const supportedFiles = files.filter(file => supportedAudioExtensions.includes(path.extname(file)))

    const obj = {
        type: "list",
        message: "Müzik dosyanızı seçin",
        choices: [
            {name: "Back", value: "none"},
            ...supportedFiles.map(file => ({name: file, value: path.resolve(folder, file)}))
        ]
    }
    return obj
}

function captchaAPI(cache) {
    const obj = {
        type: "list",
        message: "[BETA] Selfbot'un captcha'yı bir kez çözmeye çalışması için lütfen bir Captcha hizmeti seçin",
        choices: [
            {name: "Geç", value: 0},
            {name: "TrueCaptcha (Ücretsiz)", value: 1},
            {name: "2Captcha (Ücretli)", value: 2},
            {name: "Yapay Zeka İle Çözme [ YAKINDA ]", disabled: true}
        ],
        loop: false
    }
    if(cache) obj.default = cache;
    return obj;
}


function apiUser(cache) {
    const obj = {
        type: "input",
        message: "API User ID Kimliğinizi Girin",
        validate(ans) {
            return ans.match(/^\S+$/) ? true : "Geçersiz API Kullanıcı Kimliği!"
        }
    }
    if(cache) obj.default = cache;
    return obj;
}

function apiKey(cache) {
    const obj = {
        type: "input",
        message: "API User Key Kimliğinizi Girin",
        validate(ans) {
            return ans.match(/^[a-zA-Z0-9]{20,}$/) ? true : "Geçersiz API Kullanıcı Anahtarı!"
        }
    }
    if(cache) obj.default = cache;
    return obj;
}

function botPrefix(cache) {
    const obj = {
        type: "input",
        message: "[BETA] Kendi Selfbot Önekini (Prefix Kodu) Girin (Sadece Bildirim Alıcı ve Selfbot Hesabı Erişim Sağlayacak), Atlamak için Boş Bırakın.",
        validate(ans) {
            if(!ans) return true
            return ans.match(/^[^0-9\s]{1,5}$/) ? true : "Geçersiz Önek!";
        },
        filter(ans) {
            return ans.match(/^\s*$/) ? null : ans;
        }
    }
    if(cache) obj.default = cache
    return obj;
}

function gemOrder(cache) {
    const obj = listCheckbox(
        "list", 
        "Avlanma için mücevher kullanım sırasını seçin", 
        [
            {name: "En İyiden En Kötüye", value: 0},
            {name: "En Kötüden En İyiye", value: 1}
        ]
    )
    if(cache) obj.default = cache;
    return obj;
}

function resolveData(tag, token, guildID, channelID = [], wayNotify = [], musicPath, webhookURL, userNotify, captchaAPI, apiUser, apiKey, cmdPrefix, autoDaily, autoPray, autoSlash, autoGem, autoLootbox, gemOrder, autoQuote, autoOther, autoRefresh, autoSleep, autoResume) {
    return {
        tag,
        token,
        guildID,
        channelID,
        wayNotify,
        musicPath,
        webhookURL,
        userNotify,
        captchaAPI,
        apiUser,
        apiKey,
        cmdPrefix,
        autoDaily,
        autoPray,
        autoSlash,
        autoGem,
        autoLootbox,
        gemOrder,
        autoQuote,
        autoOther,
        autoRefresh,
        autoSleep,
        autoResume
    }
}

export async function collectData(data) {
    console.clear()
    await checkUpdate();
    if(JSON.stringify(data) == "{}") {
        const res = await getResult(
            trueFalse("Devam etmek istiyor musun", false), 
            `Telif Hakkı 2023 © Seuzfaar. Tüm hakları saklıdır.
            Seuzfaar Kanalından Sevgiyle ve ❤️ ile.
            Bu modülü kullanarak, Kullanım Koşullarımızı kabul ediyor ve beraberinde gelen riskleri kabul ediyorsunuz.
            Lütfen hesapların araçlarımızın kullanımından dolayı yasaklanması konusunda herhangi bir sorumluluk almadığımızı unutmayın.`
        )
        if(!res) process.exit(1)
    }
    let account
    while(!client) {
        account = await getResult(listAccount(data))
        if (account === 0) {
            const token = await getResult(getToken());
            log("Hesap kontrol ediliyor...", "i");
            client = await accountCheck(token);
        } else if (account === 1) {
            client = await accountCheck();
        } else if(account === 2) {
            const profile = getAccount();
            const username = await getResult(profile[0])
            const password = await getResult(profile[1])
            const mfaCode = await getResult(profile[2])
            log("Hesap kontrol ediliyor...", "i");
            client = await accountCheck([username, password, mfaCode]);
        } else if(account === 3) {
            const choice = await getResult(listDocument());
            if(choice === 1) await getResult(listCheckbox("list", "Geri gitmek için \'Enter\'a bas", ["Back"]), "Cömert desteğiniz için teşekkür ederiz, gerçekten minnettarız!\n\n   \x1b[1mPapara:\x1b[0m 1309328472\n")
        } else {
            const obj = data[account];
            cache = obj;
            log("Hesap kontrol ediliyor...", "i");
            client = await accountCheck(obj.token)
        }
    }
    if(typeof client == "string") {
        log(client, "e");
        if(data[account]) accountRemove(account, data);
        process.exit(1);
    }
    try {
        const newToken = await client.login();
        client.token = newToken
    } catch (error) {
        log("Yeni belirteç oluşturulamadı.", "e")
    }
    guildid = await getResult(listGuild(cache?.guildID));
    channelid = await getResult(listChannel(cache?.channelID));
    while (channelid.includes(-1)) {
        guildid = await getResult(listGuild(cache?.guildID));
        channelid = await getResult(listChannel(cache?.channelID));
    }

    waynotify = await getResult(wayNotify(cache?.wayNotify));
    if(waynotify.includes(3)) {
        musicpath = await getResult(music1(cache?.musicPath));
        while (true) {
            if (!musicpath || musicpath == "none") musicpath = await getResult(music1(cache?.musicPath));
            else if (fs.statSync(musicpath).isDirectory()) musicpath = await getResult(music2(musicpath));
            else break;
        }
    }
    if(waynotify.includes(0)) webhookurl = await getResult(webhook(cache?.webhookURL));
    if(waynotify.includes(0) || waynotify.includes(1) || waynotify.includes(2)) usernotify = await getResult(userNotify(cache?.userNotify));
    autocaptcha = await getResult(captchaAPI(cache?.captchaAPI))
    if(autocaptcha === 1) {
        apiuser = await getResult(apiUser(cache?.apiUser), "Lütfen bu web sitesine gidin ve kaydolun/giriş yapın \nSonra \x1b[1m\"userid\"\x1b[0m Kısmını kopyalayın ve buraya yapıştırın.\nLink: https://truecaptcha.org/api.html")
        apikey = await getResult(apiKey(cache?.apiKey), "Lütfen bu web sitesine gidin ve kaydolun/giriş yapın \nSonra \x1b[1m\"apikey\"\x1b[0m Kısmını kopyalayın ve buraya yapıştırın.\nLink: https://truecaptcha.org/api.html")
    }
    else if(autocaptcha === 2) apikey = await getResult(apiKey(cache?.apiKey), "Lütfen bu web sitesine gidin ve kaydolun/giriş yapın \nSonra \x1b[1m\"API Key\"\x1b[0m [Gösterge Tablosu Sekmesi] içindeki değeri [Hesap Ayarları] bölümünden kopyalayın ve buraya yapıştırın.\nLink: https://2captcha.com/enterpage")
    prefix = await getResult(botPrefix(cache?.cmdPrefix))
    autodaily = await getResult(trueFalse("Ototmatik günlük ödülleri talep etmeyi aç/kapat", cache?.autoDaily))
    autopray = await getResult(trueFalse("Otomatik olarak dua (pray) etmeyi aç/kapat.", cache?.autoPray))
    autoslash = await getResult(trueFalse("Otomatik olarak Slash (/) komutunu kullanmayı aç/kapat", cache?.autoSlash))
    autogem = await getResult(trueFalse("Otomatik olarak avlanma taşlarını kullanmayı aç/kapat", cache?.autoGem))
    if(autogem) gemorder = await getResult(gemOrder(cache?.gemOrder))
    if(autogem) autolootbox = await getResult(trueFalse("Otomatik olarak ganimet kutularını açmayı aç/kapat", cache?.autoLootbox))
    autoquote = await getResult(trueFalse("Seviye atlamak için otomatik olarak rastgele metin göndermeyi aç/kapat", cache?.autoQuote))
    autoother = await getResult(trueFalse("Run/Pup/Piku Komutlarını otomatik olarak göndermeyi aç/kapat", cache?.autoOther))
    autorefresh = await getResult(trueFalse("Yeni günde yapılandırmayı otomatik olarak yenilemeyi aç/kapat", cache?.autoRefresh))
    autosleep = await getResult(trueFalse("Belirli bir süre sonra otomatik olarak duraklatmayı aç/kapat", cache?.autoSleep))
    autoresume = await getResult(trueFalse("CAPTCHA çözüldükten sonra otomatik olarak devam etmeyi aç/kapat", cache?.autoResume))

    conf = resolveData(client.user.username, client.token, guildid, channelid, waynotify, musicpath, webhookurl, usernotify, autocaptcha, apiuser, apikey, prefix, autodaily, autopray, autoslash, autogem, autolootbox, gemorder, autoquote, autoother, autorefresh, autosleep, autoresume)
    data[client.user.id] = conf;
    fs.writeFileSync(DataPath, JSON.stringify(data), "utf8")
    log("Veriler Kaydedildi: " + DataPath, "i")
    return { client, conf };
}