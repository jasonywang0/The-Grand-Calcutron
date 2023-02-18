import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';

export default new CommandClass({
    data: new SlashCommandBuilder()
        .setName('fired')
        .setDescription('Let members know the draft has fired') as SlashCommandBuilder,
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
        content = 'The draft has fired! Good luck and please save your decklists :pray:';
        ephemeral = false;
      }       
      await interaction.reply({
        content,
        ephemeral,
        fetchReply: true,
      });
    },
})