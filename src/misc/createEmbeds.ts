import { EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Guild } from '../db/models/guild.model.js';
import { IGuildRole } from '../db/schemas/guildRole.schema.js';
import { ImageName } from '../constants/images.js';

 interface levelInfo {
  interaction: ChatInputCommandInteraction<'cached'>,
  level: IGuildRole,
  points: number
}

export async function createLevelGetEmbed(info:levelInfo): Promise<EmbedBuilder> {
  const { interaction, level, points } = info;
  let role = interaction.guild.roles.cache.get(level.discordId);
  if (!role) throw Error('Embed Failed - Role not found');
  return new EmbedBuilder()
    .setColor(role.color)
    .setTitle(`Level Stats`)
    .setThumbnail(interaction.user.displayAvatarURL())
    .setDescription(`**<@!${interaction.user.id}> is a <@&${role.id}> with ${points} points!**`)
    .setImage(level.image || interaction.user.displayAvatarURL());
}

export async function createLevelUpEmbed(info:levelInfo): Promise<EmbedBuilder> {
  const { interaction, level, points } = info;
  let color = 0x40863f;
  let title = 'Level Up';
  let description = `**<@!${interaction.user.id}> leveled up to ${points} points!**`;
  const guild = await Guild.findByDiscordId(interaction.guildId);
  let imageLink = guild.getImageByName(ImageName.Level).link;

  if (points === level.points) { // promotion
    let role = interaction.guild.roles.cache.get(level.discordId);
    if (!role) throw Error('Embed Failed - Role not found');
    color = role.color;
    imageLink = level.image;
    title = `:fire: **Polymorph** :fire:`;
    description = `**<@!${interaction.user.id}> leveled up to <@&${role.id}> with ${points} points!**`;
  } 
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setThumbnail(interaction.user.displayAvatarURL())
    .setDescription(description)
    .setImage(imageLink);
}
