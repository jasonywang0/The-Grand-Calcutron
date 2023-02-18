import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';

export default new CommandClass({
    data: new SlashCommandBuilder()
        .setName('call')
        .setDescription('Messages drafters')
        .addStringOption(option => 
          option
            .setName('role')
            .setDescription('Users with role')
            .setRequired(true)
            .addChoices(
              { name: 'Xmage', value: 'xmage' },
              { name: 'Cockatrice', value: 'cockatrice' },
				)) as SlashCommandBuilder,
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
      let content = 'This command can only be used in the draft channel.';
      let ephemeral = true;
      if (this.opt.channels?.includes(interaction.channelId)) {
        const roleId = interaction.options.getString('role', true) === 'xmage' ? process.env.XMAGE_ROLE : process.env.TRICE_ROLE;
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