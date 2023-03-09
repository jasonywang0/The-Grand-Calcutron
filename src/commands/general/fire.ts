import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';
import { Guild } from '../../db/models/guild.model.js';
import { ChannelName } from '../../constants/channels.js';

export default new CommandClass({
    data: new SlashCommandBuilder()
        .setName('fired')
        .setDescription('Announce the draft has fired') as SlashCommandBuilder,
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'General',
        cooldown: 5,
        visible: true,
        guildOnly: true,
    },
    async execute(interaction: ChatInputCommandInteraction<'cached'>) {
      let content = 'This command can only be used in the draft channel.';
      let ephemeral = true;
      try {
        const guild = await Guild.findByDiscordId(interaction.guildId);
        const draftingChannel = guild.getChannelByName(ChannelName.Drafting);
        if (interaction.channelId !== draftingChannel.discordId) {
          this.opt.cooldown = 0;
          throw new Error(content);
        }
        content = 'The draft has fired! Good luck and please save your decklists :pray:';
        ephemeral = false;
      } catch (e) {
        content = e.message;
      }
      await interaction.reply({
        content,
        ephemeral,
        fetchReply: true,
      });
    }
})