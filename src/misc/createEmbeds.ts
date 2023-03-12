import { EmbedBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { Guild, IGuildDocument } from '../db/models/guild.model.js';
import { IGuildRole } from '../db/schemas/guildRole.schema.js';
import { ImageName } from '../constants/images.js';
import { CustomError } from '../structures/error.js';
 interface levelInfo {
  interaction: ChatInputCommandInteraction<'cached'>,
  level: IGuildRole,
  points: number
}

export async function createLevelGetEmbed(info:levelInfo): Promise<EmbedBuilder> {
  const { interaction, level, points } = info;
  let role = interaction.guild.roles.cache.get(level.discordId);
  if (!role) throw new CustomError('EMBED_ROLE_FOUND_1');
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
    if (!role) throw new CustomError('EMBED_ROLE_FOUND_1');
    color = role.color;
    imageLink = level.image;
    description = `**<@!${interaction.user.id}> leveled up to <@&${role.id}> with ${points} points!**`;
  } 
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setThumbnail(interaction.user.displayAvatarURL())
    .setDescription(description)
    .setImage(imageLink);
}

export async function createWelcomeEmbed(guildMember: GuildMember, guild:IGuildDocument) {
  const levels = guild.getLevelsByPoints(0);
  let role = guildMember.guild.roles.cache.get(levels.add[0].discordId);
  if (!role) throw new CustomError('EMBED_ROLE_FOUND_1');
  return new EmbedBuilder() 
    .setColor(role.color)
    .setTitle(`Welcome ${guildMember.user.username}!`)
    .setThumbnail(guildMember.user.displayAvatarURL())
    .setDescription(`**<@!${process.env.CLIENT_ID}> polymorphed <@!${guildMember.user.id}> into a <@&${role.id}>**`)
    .setImage(levels.add[0].image);
}