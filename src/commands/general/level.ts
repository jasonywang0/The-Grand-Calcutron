import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';
import User from '../../db/models/user.model.js';

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
        channels: [process.env.DRAFT_CHANNEL]
    },
    async execute(interaction: ChatInputCommandInteraction<'cached'>) {
      let ephemeral = true;
      let content = '';
      try {
        const subcommand = interaction.options.getSubcommand();
        let user = await User.findUser(interaction.user.id);
        if (!user) user = new User({discordId: interaction.user.id});
        let points = user?.getPoints() || 0;
        if (subcommand === 'up') {
          ephemeral = false;
          points += 1;
          user.setPoints(points);
          await user.save();
        } else if (subcommand === 'down') {
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