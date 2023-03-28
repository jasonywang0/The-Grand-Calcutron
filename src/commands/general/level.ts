import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';
import { User } from '../../db/models/user.model.js';
import { Guild } from '../../db/models/guild.model.js';
import { createLevelGetEmbed, createLevelUpEmbed  } from '../../misc/createEmbeds.js';
import { ChannelName } from '../../constants/channels.js';
import { CustomError } from '../../structures/error.js';

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
    },
    async execute(interaction: ChatInputCommandInteraction<'cached'>) {
      let content = '';
      let ephemeral = true;
      let embeds = [];
      try {
        const subcommand = interaction.options.getSubcommand();
        const guild = await Guild.findByDiscordId(interaction.guildId);
        let user = await User.findUser(interaction.user.id);
        if (!user) user = new User({discordId: interaction.user.id});
        let points = user.getPoints();
        switch (subcommand) {
          case 'get': {
            const levels = guild.getLevelsByPoints(points);
            const level = levels.add.pop();
            const role = interaction.guild.roles.cache.get(level.discordId);
            embeds.push(createLevelGetEmbed({user, discordUser: interaction.user, discordRole: role, level}));
            break;
          }
          case 'up': {
            const draftingChannel = guild.getChannelByName(ChannelName.BotSpam);
            if (interaction.channelId !== draftingChannel.discordId) throw new CustomError('CHANNEL_INVALID_1', 'This command can only be used in the bot channel');
            ephemeral = false;
            points += 1;
            user.setPoints(points);
            const levels = guild.getLevelsByPoints(points);
            const level = levels.add.pop();
            const role = interaction.guild.roles.cache.get(level.discordId);
            await interaction.member.roles.add(levels.add.map(level => level.discordId)); // TODO: Use Promise.all
            await interaction.member.roles.remove(levels.remove.map(level => level.discordId));
            await user.save();
            embeds.push(createLevelUpEmbed({user, discordUser: interaction.user, discordRole: role, level, guild}));
            break;
          }
          case 'down': {
            points -= 1;
            user.setPoints(points);
            let levels = guild.getLevelsByPoints(points);
            await interaction.member.roles.add(levels.add.map(level => level.discordId));
            await interaction.member.roles.remove(levels.remove.map(level => level.discordId));
            await user.save();
            content = `**<@!${interaction.user.id}> now has ${points} points!**`;
            break;
          }
          default:
            content = 'No choice was selected!';
            break;
        }
      } catch (error) {
        content = error instanceof CustomError ? error.message : this.errorMessage;
        ephemeral = true;
        embeds = [];
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