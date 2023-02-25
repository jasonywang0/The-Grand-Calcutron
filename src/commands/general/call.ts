import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';

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
        cooldown: 5,
        visible: true,
        guildOnly: false,
        channels: [process.env.DRAFT_CHANNEL]
    },
    async execute(interaction: ChatInputCommandInteraction<'cached'>) {
      const subcommand = interaction.options.getSubcommand();
      let content = 'This command can only be used in the draft channel.';
      let ephemeral = true;
      if (this.opt.channels?.includes(interaction.channelId)) {
        const roleId = subcommand === 'xmage' ? process.env.XMAGE_ROLE : process.env.TRICE_ROLE;
        content = `**<@!${interaction.user.id}> calls for <@&${roleId}> to assemble!**`;
        ephemeral = false;
      }
      await interaction.reply({
        content,
        ephemeral,
        fetchReply: true,
      });
    },
})