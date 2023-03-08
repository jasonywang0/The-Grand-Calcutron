import { Events, GuildMember } from 'discord.js';
import { EventClass } from '../../structures/event.js';
import { Guild } from '../../db/models/guild.model.js';

export default new EventClass({
    name: Events.GuildMemberAdd,
    async execute(guildMember: GuildMember) {
      const guild = await Guild.findByDiscordId(guildMember.guild.id);
      const roles = guild.getLevelsByPoints(0);
      if (roles[0][0]) guildMember.roles.add(roles[0][0].discordId);
    }
});