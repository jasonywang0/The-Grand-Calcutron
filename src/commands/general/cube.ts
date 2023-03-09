import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';
import { User } from '../../db/models/user.model.js';

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
            .setDescription('Add cubes')
            .addStringOption(option =>
              option
                .setName('url')
                .setDescription('Cube URL')
                .setRequired(true)
              )
        )
        .addSubcommand(subcommand => 
          subcommand
            .setName('delete')
            .setDescription('Delete cubes')
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
      let content = 'Something went wrong!';
      try {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'get') {
          let dsUser = interaction.options.getUser('user');
          if (!dsUser) throw new Error('User could not found be in guild!');
          let user = await User.findUser(dsUser.id);
          const cubes = user?.getCubes() || [];
          if (!cubes.length) throw new Error(`**<@!${dsUser.id}>** has no cubes set.`);
          content = `**<@!${dsUser.id}>'s Cubes**`;
          cubes.forEach((cube) => content += `\n${cube.link}`);
        } else {
          let user = await User.findUser(interaction.user.id);
          if (!user) user = new User({discordId: interaction.user.id});
          let option = interaction.options.getString('url');
          if (subcommand === 'add') {
            user.addCube(option);
            await user.save();
            content = `${option} has been added!`;
          } else if (subcommand === 'delete') {
            user.findCube(option); // just check to see if something will be found
            user.deleteCube(option);
            await user.save();
            content = `${option} has been deleted!`;
          }
        }
      } catch (error) {
        if (error.code === 'ERR_INVALID_URL') {
          content = `URL must be a complete link from cube cobra. Here's an example: https://cubecobra.com/cube/list/thunderwang`
        }
        content = error.message;
      }
      await interaction.reply({
        content,
        ephemeral: true,
        fetchReply: true,
        flags: 'SuppressEmbeds'
      });
    },
})