import 'dotenv/config'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';

export default new CommandClass({
    data: new SlashCommandBuilder()
      .setName('role')
      .setDescription('Toggle roles')
      .addSubcommand(subcommand => 
        subcommand
          .setName('add')
          .setDescription('Add a role')
          .addStringOption(option =>
            option
              .setName('role')
              .setDescription('Role to add')
              .setRequired(true)
              .addChoices(
                { name: 'Xmage', value: 'xmage' },
                { name: 'Cockatrice', value: 'cockatrice' },
              )
          )
      )
      .addSubcommand(subcommand => 
        subcommand
          .setName('remove')
          .setDescription('Remove a role')
          .addStringOption(option =>
            option
              .setName('role')
              .setDescription('Role to remove')
              .setRequired(true)
              .addChoices(
                { name: 'Xmage', value: 'xmage' },
                { name: 'Cockatrice', value: 'cockatrice' },
              )
            )
      ) as SlashCommandBuilder,
    opt: {
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'General',
        cooldown: 3,
        visible: true,
        guildOnly: true,
    },
    async execute(interaction: ChatInputCommandInteraction<'cached'>) {
      let content = 'Something went wrong!';
      try {
        const subcommand = interaction.options.getSubcommand();
        const role = interaction.options.getString('role');
        if (!role) throw new Error('Role does not exist!');
        const roleId = role === 'xmage' ? process.env.XMAGE_ROLE : process.env.TRICE_ROLE;
        if (subcommand === 'add') {
          if (role === 'xmage') await interaction.member.roles.add(roleId);
          if (role === 'cockatrice') await interaction.member.roles.add(roleId);
          content = `<@&${roleId}> has been added!`;
        } else if (subcommand === 'remove') {
          if (role === 'xmage') await interaction.member.roles.remove(roleId);
          if (role === 'cockatrice') await interaction.member.roles.remove(roleId);
          content = `<@&${roleId}> has been removed!`;
        }
      } catch (error) {
        content = error.message;
      }
      await interaction.reply({
        content,
        ephemeral: true,
        fetchReply: true,
      });
    },
})