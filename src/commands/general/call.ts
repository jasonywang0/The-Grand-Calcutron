import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';
import { Guild } from '../../db/models/guild.model.js';
import { RoleType } from '../../constants/roles.js';
import { ChannelName } from '../../constants/channels.js';

export default new CommandClass({
    data: new SlashCommandBuilder()
        .setName('call')
        .setDescription('Alert drafters')
        .addSubcommand(subcommand => 
          subcommand
            .setName(RoleType.Xmage.toLowerCase())
            .setDescription('Alert Xmage users')
         )
         .addSubcommand(subcommand =>
          subcommand
            .setName(RoleType.Cockatrice.toLowerCase())
            .setDescription('Alert Cockatrice users')
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
      let content = 'This command can only be used in the draft channel.';
      let ephemeral = true;
      try {
        const guild = await Guild.findByDiscordId(interaction.guildId);
        const subcommand = interaction.options.getSubcommand().toUpperCase();
        const draftingChannel = guild.getChannelByName(ChannelName.Drafting);
        if (interaction.channelId !== draftingChannel.discordId) {
          this.opt.cooldown = 0;
          throw new Error(content);
        }
        const role = guild.getRolesByType(subcommand as RoleType)[0];
        content = `**<@!${interaction.user.id}> calls for <@&${role.discordId}> to assemble!**`;
        ephemeral = false;
      } catch (e) {
        content = e.message;
      }
      await interaction.reply({
        content,
        ephemeral,
        fetchReply: true,
      });
    },
})