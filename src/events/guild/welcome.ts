import { Events, GuildMember, TextChannel } from 'discord.js';
import { EventClass } from '../../structures/event.js';
import { Guild } from '../../db/models/guild.model.js';
import { createWelcomeEmbed } from '../../misc/createEmbeds.js';
import { ChannelName } from '../../constants/channels.js';

export default new EventClass({
  name: Events.GuildMemberAdd,
  async execute(guildMember: GuildMember) {
    try {
      const guild = await Guild.findByDiscordId(guildMember.guild.id);
      const welcomeChannel = guild.getChannelByName(ChannelName.Welcome);
      const discordWelcomeChannel = guildMember.guild.channels.cache.get(welcomeChannel.discordId);
      const levels = guild.getLevelsByPoints(0);
      await guildMember.roles.add(levels.add[0].discordId);
      const embed = await createWelcomeEmbed(guildMember, guild);
      (discordWelcomeChannel as TextChannel).send({embeds: [embed], allowedMentions: { parse: [] }});
    } catch (error) {
      // TODO: do something here
    }
  }
});