import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';
import getPack from '../../misc/getPack.js';

export default new CommandClass({
    data: new SlashCommandBuilder()
      .setName('p1p1')
      .setDescription('Generate a pack')
      .addSubcommand(subcommand => 
        subcommand
          .setName('cobra')
          .setDescription('Use Cube Cobra')
          .addStringOption(option =>
            option
              .setName('tag')
              .setDescription('Cube Cobra ID')
              .setRequired(true)
            )
      )
      .addSubcommand(subcommand => 
        subcommand
          .setName('artisan')
          .setDescription('Use Cube Artisan')
          .addStringOption(option =>
            option
              .setName('tag')
              .setDescription('Cube Artisan ID')
              .setRequired(true)
            )
      ) as SlashCommandBuilder,
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'General',
        cooldown: 5,
        visible: true,
    },
    async execute(interaction: ChatInputCommandInteraction<'cached'>) {
      let content = 'Something went wrong!';
      try {
        const subcommand = interaction.options.getSubcommand();
        const Id = interaction.options.getString('tag');
        content = subcommand === 'cobra' ? getPack(Id) : getPack(Id, 'cubeartisan.net');
      } catch (error) {
        content = error.message;
      }
      await interaction.reply({
        content,
        fetchReply: true,
      });
    },
})