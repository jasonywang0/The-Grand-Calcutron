import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandClass } from '../../structures/command.js';
import { Guild } from '../../db/models/guild.model.js';
import { RoleType } from '../../constants/roles.js';
import { CustomError } from '../../structures/error.js';

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
                { name: 'Xmage', value: RoleType.Xmage },
                { name: 'Cockatrice', value: RoleType.Cockatrice },
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
                { name: 'Xmage', value: RoleType.Xmage },
                { name: 'Cockatrice', value: RoleType.Cockatrice },
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
      let content = this.errorMessage;
      try {
        const guild = await Guild.findByDiscordId(interaction.guildId);
        const subcommand = interaction.options.getSubcommand();
        const roleName = interaction.options.getString('role');
        const role = guild.getRolesByType(roleName as RoleType)[0];
        if (subcommand === 'add') {
          await interaction.member.roles.add(role.discordId);
          content = `<@&${role.discordId}> has been added!`;
        } else {
          await interaction.member.roles.remove(role.discordId);
          content = `<@&${role.discordId}> has been removed!`;
        }
      } catch (error) {
        content = error instanceof CustomError ? error.message : this.errorMessage;
      }
      await interaction.reply({
        content,
        ephemeral: true,
        fetchReply: true,
      });
    },
})