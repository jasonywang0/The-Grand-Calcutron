import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';
import User from '../../db/models/user.model.js';

export default new CommandClass({
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Check level')
        .addStringOption(option => 
          option
            .setName('option')
            .setDescription('Level Up!')
            .setRequired(true)
            .addChoices(
              { name: 'Get', value: 'get' },
              { name: 'Up', value: 'up' },
              { name: 'Down', value: 'down' },
				)) as SlashCommandBuilder,
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
      try {
        const option = interaction.options.getString('option', true);
        let user = await User.findUser(interaction.user.id);
        if (!user) user = new User({discordId: interaction.user.id});
        let points = user?.getPoints() || 0;
        if (option === 'up') {
          ephemeral = false;
          points += 1;
          user.setPoints(points);
          await user.save();
        } else if (option === 'down') {
          points -= 1;
          user.setPoints(points);
          await user.save();
        }
        content = `**<@!${interaction.user.id}> has ${points} points!**`;
      } catch (error) {
        content = error.message;
      }
      await interaction.reply({
        content,
        ephemeral,
        fetchReply: true,
      });
    },
})