import { global } from "../index.mjs";

export default {
  info: "Girilen kişiye girilen miktarda cowoncy gönderir.",
  callback: async (message, ...args) => {
    try {
      if (message.channel.type == "DM" || message.channel.type == "GROUP_DM")
        return message.reply("OwO Botu olan bir sunucuda yapmalısın denyo.");
    
      if (!args) return message.reply("Cowoncy gönderilecek kişiyi etiketlemeli ve cowoncy miktarını girmelisiniz.");
      const target = message.mentions.members.first();
      const owo = message.guild.members.cache.get(global.owoID);
      if (!target) return message.reply("Cowoncy gönderilecek bir kişi etiketlemelisiniz.");
      if (!owo) return message.reply("OwO botu bulunamadı.");
      if (!args[1].match(/^[0-9]+$/)) return message.reply("Gönderilecek cowoncy miktarını girmelisiniz.");
      message.reply(`owo send <@!${target.id}> ${args[1]}`);
      const filter = (msg) => msg.author.id === global.owoID && msg.embeds && msg.components.length;
      const collector = message.channel.createMessageCollector({ filter, max: 5, time: 10_000 });
      collector.on("collect", async (m) => {
        if(m.author.id === global.owoID) await m.clickButton({ row: 0, col: 0 })
    })
    } catch (error) {
      message.reply("Komut başarısız oldu.");
      console.log(error);
    }
  },
};