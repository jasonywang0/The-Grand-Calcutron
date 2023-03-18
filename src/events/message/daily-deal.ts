import { EmbedBuilder, Events, TextChannel } from 'discord.js';
import { EventClass } from '../../structures/event.js';
import { loadImage } from 'canvas';
import { Guild } from '../../db/models/guild.model.js';
import { ChannelName } from '../../constants/channels.js';

// TODO: USE TWITTER API WHEN THEY FINALLY APPROVE

export default new EventClass({
    name: Events.MessageCreate,
    async execute(message) {  
      if ((message.author.id === '802369375432736788'|| message.author.id === '132761947975188480') && message.content.toLowerCase().includes('the #mtgarena daily deals for today')) {
        try {
          const guild = await Guild.findByDiscordId(process.env.GUILD_ID);
          const registeredChannel = guild.getChannelByName(ChannelName.Deals);
          const mtgaDailyDealChannel = message.client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(registeredChannel.discordId);
  
          // parse message (see above for example)
          const [tweet, profilePic, imageStrings] = message.content.split('@@@@@');
          
          if (!imageStrings) return;
          const comment = tweet.slice(0, tweet.lastIndexOf('https://'));
          const tweetURL = tweet.slice(tweet.lastIndexOf('https://'));
  
          // create an array of objects with the following fields: url and width
          const imageUrls = imageStrings.split(',');
          let images:any = imageUrls.map((url) => loadImage(url));
          images = await Promise.all(images);
          images = images.map((image, index) => ({ url: imageUrls[index], width: image.width }));
          images.sort((a, b) => b.width - a.width);
  
          // send first image
          const messageEmbed = new EmbedBuilder()
            .setColor('#1DA1F2')
            .setAuthor({name:'@ArenaDailyDeal', iconURL: profilePic, url: tweetURL })
            .setDescription(comment)
            .setThumbnail('https://i.imgur.com/7tVYAeF.png')
            .setURL(tweetURL)
            .setImage(images.shift().url);
  
          const m = await (mtgaDailyDealChannel as TextChannel).send({embeds: [messageEmbed]});
          await m.crosspost();

          // send the rest of the images in separate new embed messages
          for (const extraImage of images) {
            const discordEmbed = new EmbedBuilder()
              .setThumbnail(null)
              .setColor('#1DA1F2')
              .setImage(extraImage.url);
            const m = await (mtgaDailyDealChannel as TextChannel).send({embeds: [discordEmbed]});
            await m.crosspost();
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
});