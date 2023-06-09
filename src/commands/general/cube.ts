import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';
import { User } from '../../db/models/user.model.js';
import { CustomError } from '../../structures/error.js';
import { createCubesEmbed } from '../../misc/createEmbeds.js';

export default new CommandClass({
    data: new SlashCommandBuilder()
        .setName('cube')
        .setDescription('Level Info')
        .addSubcommand(subcommand => 
          subcommand
            .setName('get')
            .setDescription('Get a user\'s cubes')
            .addUserOption(option =>
              option
                .setName('user')
                .setDescription('Discord user')
                .setRequired(true)
              )
        ) 
        .addSubcommand(subcommand => 
          subcommand
            .setName('add')
            .setDescription('Add cube')
            .addStringOption(option =>
              option
                .setName('url')
                .setDescription('Cube URL')
                .setRequired(true)
              )
        )
        .addSubcommand(subcommand => 
          subcommand
            .setName('remove')
            .setDescription('Remove cube')
            .addStringOption(option =>
              option
                .setName('url')
                .setDescription('Cube URL')
                .setRequired(true)
              )
         ) as SlashCommandBuilder,
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
      let suppressEmbed = true;
      const embeds = [];
      try {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'get') {
          let discordUser = interaction.options.getUser('user');
          if (!discordUser) throw new Error('Discord user could not found be in guild!');
          let user = await User.findUser(discordUser.id);
          const cubes = user?.getCubes();
          if (!cubes || !cubes.length) throw new CustomError('USER_CUBE_1', `**<@!${discordUser.id}>** has no cubes set.`);
          const embed = createCubesEmbed({discordUser, cubes});
          embeds.push(embed);
          content = '';
          suppressEmbed = false;
        } else {
          let user = await User.findUser(interaction.user.id);
          if (!user) user = new User({discordId: interaction.user.id});
          let option = interaction.options.getString('url');
          if (subcommand === 'add') {
            user.addCube(option);
            await user.save();
            content = `${option} has been added!`;
          } else if (subcommand === 'remove') {
            const deletedCube = user.deleteCube(option);
            await user.save();
            content = `${deletedCube.link} has been removed!`;
          }
        }
      } catch (error) {
        content = error instanceof CustomError ? error.message : this.errorMessage;
        suppressEmbed = true;
      }

      // TODO: TYPE THIS
      const options:any = {
        content,
        embeds,
        ephemeral: true,
        fetchReply: true,
      }
      if (suppressEmbed) options.flags = 'SuppressEmbeds';
      await interaction.reply(options);
    },
})