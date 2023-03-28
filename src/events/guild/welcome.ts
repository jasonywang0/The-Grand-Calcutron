import { Events, GuildMember, TextChannel } from 'discord.js';
import { EventClass } from '../../structures/event.js';
import { Guild } from '../../db/models/guild.model.js';
import { createWelcomeEmbed } from '../../misc/createEmbeds.js';
import { ChannelName } from '../../constants/channels.js';
import { CustomError } from '../../structures/error.js';

export default new EventClass({
  name: Events.GuildMemberAdd,
  async execute(guildMember: GuildMember) {
    try {
      const guild = await Guild.findByDiscordId(guildMember.guild.id);
      const discordWelcomeChannel = guildMember.guild.channels.cache.get(guild.getChannelByName(ChannelName.Welcome).discordId);
      const levels = guild.getLevelsByPoints(0);
      await guildMember.roles.add(levels.add[0].discordId);
      let role = guildMember.guild.roles.cache.get(levels.add[0].discordId);
      if (!role) throw new CustomError('EMBED_ROLE_FOUND_1');
      const level = guild.getLevelsByPoints(0).add[0];
      (discordWelcomeChannel as TextChannel).send({embeds: [createWelcomeEmbed({guildMember, discordRole: role, level})], allowedMentions: { parse: [] }});
    } catch (error) {
      // TODO: do something here
    }
  }
});