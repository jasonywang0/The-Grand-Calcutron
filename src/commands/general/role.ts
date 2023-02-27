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
          .addRoleOption(option =>
            option
              .setName('role')
              .setDescription('Role to add')
              .setRequired(true)
            )
      )
      .addSubcommand(subcommand => 
        subcommand
          .setName('remove')
          .setDescription('Remove a role')
          .addRoleOption(option =>
            option
              .setName('role')
              .setDescription('Role to remove')
              .setRequired(true)
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
        const role = interaction.options.getRole('role');
        if (!role) throw new Error('Role does not exist!');
        if (subcommand === 'add') {
          if (role.id == process.env.XMAGE_ROLE) await interaction.member.roles.add(process.env.XMAGE_ROLE);
          if (role.id == process.env.TRICE_ROLE) await interaction.member.roles.add(process.env.TRICE_ROLE);
          content = `<@&${role.id}> has been added!`;
        } else if (subcommand === 'delete') {
          if (role.id == process.env.XMAGE_ROLE) await interaction.member.roles.remove(process.env.XMAGE_ROLE);
          if (role.id == process.env.TRICE_ROLE) await interaction.member.roles.remove(process.env.TRICE_ROLE);
          content = `<@&${role.id}> has been removed!`;
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