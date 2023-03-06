import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';
import { Role } from '../../db/models/role.model.js';

export default new CommandClass({
    data: new SlashCommandBuilder()
        .setName('call')
        .setDescription('Alert drafters')
        .addSubcommand(subcommand => 
          subcommand
            .setName('xmage')
            .setDescription('Alert Xmage users')
         )
         .addSubcommand(subcommand =>
          subcommand
            .setName('cockatrice')
            .setDescription('Alert Cockatrice users')
         ) as SlashCommandBuilder,
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'General',
        cooldown: 600,
        visible: true,
        guildOnly: false,
        channels: [process.env.DRAFT_CHANNEL]
    },
    async execute(interaction: ChatInputCommandInteraction<'cached'>) {
      const subcommand = interaction.options.getSubcommand();
      let content = 'This command can only be used in the draft channel.';
      let ephemeral = true;
      if (this.opt.channels?.includes(interaction.channelId)) {
        const roleId = await Role.findByName(subcommand); 
        content = `**<@!${interaction.user.id}> calls for <@&${roleId.getDiscordId()}> to assemble!**`;
        ephemeral = false;
      }
      await interaction.reply({
        content,
        ephemeral,
        fetchReply: true,
      });
    },
})