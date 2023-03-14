import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';
import { Guild } from '../../db/models/guild.model.js';
import { ChannelName } from '../../constants/channels.js';
import { CustomError } from '../../structures/error.js';

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
      let content = this.errorMessage;
      let ephemeral = false;
      try {
        const guild = await Guild.findByDiscordId(interaction.guildId);
        const draftingChannel = guild.getChannelByName(ChannelName.Drafting);
        if (interaction.channelId !== draftingChannel.discordId) {
          this.opt.cooldown = 0;
          throw new CustomError('CHANNEL_INVALID_1', 'This command can only be used in the drafting channel!');
        }
        content = 'The draft has fired! Good luck and please save your decklists :pray:';
      } catch (error) {
        content = error instanceof CustomError ? error.message : this.errorMessage;
        ephemeral = true;
      }
      await interaction.reply({
        content,
        ephemeral,
        fetchReply: true,
      });
    }
})