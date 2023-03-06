import 'dotenv/config'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';
import { Role } from '../../db/models/role.model.js';

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
        const roleName = interaction.options.getString('role');
        const role = await Role.findByName(roleName);
        if (!role || !role.getDiscordId()) throw new Error('Role does not exist!');
        if (subcommand === 'add') {
          await interaction.member.roles.add(role.getDiscordId());
          content = `<@&${role.getDiscordId()}> has been added!`;
        } else {
          await interaction.member.roles.remove(role.getDiscordId());
          content = `<@&${role.getDiscordId()}> has been removed!`;
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