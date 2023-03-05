import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';
import { User } from '../../db/models/user.model.js';
import { Role } from '../../db/models/role.model.js';
import { createLevelGetEmbed, createLevelUpEmbed  } from '../../misc/createEmbeds.js';

export default new CommandClass({
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Level Info')
        .addSubcommand(subcommand => 
          subcommand
            .setName('get')
            .setDescription('Get level')
        ) 
        .addSubcommand(subcommand => 
          subcommand
            .setName('up')
            .setDescription('Level up')
        )
        .addSubcommand(subcommand => 
          subcommand
            .setName('down')
            .setDescription('Level down')
         ) as SlashCommandBuilder,
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'General',
        cooldown: 5,
        visible: true,
        guildOnly: true,
        channels: [process.env.DRAFT_CHANNEL]
    },
    async execute(interaction: ChatInputCommandInteraction<'cached'>) {
      let ephemeral = true;
      let content = '';
      const embeds = [];
      try {
        const subcommand = interaction.options.getSubcommand();
        let user = await User.findUser(interaction.user.id);
        if (!user) user = new User({discordId: interaction.user.id});
        let points = user.getPoints();
        switch (subcommand) {
          case 'get': {
            const roles = await Role.findRolesByPoints(points);
            const highestLevel = roles[0].pop();
            embeds.push(await createLevelGetEmbed({interaction, points, level: highestLevel}));
            break;
          }
          case 'up': {
            ephemeral = false;
            points += 1;
            user.setPoints(points);
            let roles = await Role.findRolesByPoints(points);
            await Promise.all([
              user.save(),
              interaction.member.roles.add(roles[0].map(role => role.discordId)),
              interaction.member.roles.remove(roles[1].map(role => role.discordId))
            ]);
            const highestLevel = roles[0].pop();
            embeds.push(await createLevelUpEmbed({interaction, points, level: highestLevel}));
            break;
          }
          case 'down': {
            points -= 1;
            let roles = await Role.findRolesByPoints(points);
            user.setPoints(points);
            await Promise.all([
              user.save(),
              interaction.member.roles.remove(roles[1].map(role => role.discordId))
            ]);
            content = `**<@!${interaction.user.id}> now has ${points} points!**`;
            break;
          }
          default:
            content = 'Something went wrong!';
            break;
        }
      } catch (error) {
        content = error.message;
      }
      await interaction.reply({
        content,
        ephemeral,
        fetchReply: true,
        embeds,
        allowedMentions: { parse: [] } // never remove or else the whole server will be pinged at times
      });
    },
})