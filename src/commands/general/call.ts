import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';
import { Guild } from '../../db/models/guild.model.js';
import { RoleType } from '../../constants/roles.js';
import { ChannelName } from '../../constants/channels.js';
import { CustomError } from '../../structures/error.js';

export default new CommandClass({
    data: new SlashCommandBuilder()
        .setName('call')
        .setDescription('Alert drafters')
        .addSubcommand(subcommand => 
          subcommand
            .setName(RoleType.Xmage.toLowerCase())
            .setDescription('Call Xmage users')
         )
         .addSubcommand(subcommand =>
          subcommand
            .setName(RoleType.Cockatrice.toLowerCase())
            .setDescription('Call Cockatrice users')
         ) as SlashCommandBuilder,
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'General',
        cooldown: 600,
        visible: true,
        guildOnly: true,
    },
    async execute(interaction: ChatInputCommandInteraction<'cached'>) {
      let content = this.errorMessage;
      let ephemeral = false;
      let role = null;
      try {
        const guild = await Guild.findByDiscordId(interaction.guildId);
        const subcommand = interaction.options.getSubcommand().toUpperCase();
        const draftingChannel = guild.getChannelByName(ChannelName.Drafting);
        if (interaction.channelId !== draftingChannel.discordId) {
          this.opt.cooldown = 0;
          throw new CustomError('CHANNEL_INVALID_1', `This command can only be called in the ${draftingChannel.name} channel!`);
        }
        role = guild.getRolesByType(subcommand as RoleType)[0];
        const discordUser = await interaction.guild.members.fetch(interaction.member.id);
        if (!discordUser) throw new Error('Something went wrong!'); // TODO: use custom error
        content = `${discordUser.displayName || discordUser.user.username} calls for <@&${role.discordId}> to assemble!`;
      } catch (error) {
        content = error instanceof CustomError ? error.message : this.errorMessage;
        ephemeral = true;
      }
      await interaction.reply({
        content,
        ephemeral,
        allowedMentions: {roles: [role?.discordId]},
        fetchReply: true,
      });
    },
})