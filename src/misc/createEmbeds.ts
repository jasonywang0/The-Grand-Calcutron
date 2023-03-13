import { EmbedBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { Guild, IGuildDocument } from '../db/models/guild.model.js';
import { IGuildRole } from '../db/schemas/guildRole.schema.js';
import { ImageName } from '../constants/images.js';
import { CustomError } from '../structures/error.js';
import { ICube } from '../db/schemas/cube.schema.js';
import { User } from 'discord.js';
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
    const pointsGrammar = points === 1 ? 'point' : 'points'; 
    description = `**<@!${interaction.user.id}> leveled up to <@&${role.id}> with ${points} ${pointsGrammar}!**`;
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
    .setTitle(`Welcome ${guildMember.displayName}!`)
    .setThumbnail(guild.getLevelsByPoints(0).add[0].image)
    .setDescription(`<@!${process.env.CLIENT_ID}> polymorphed **${guildMember.displayName}** into a <@&${role.id}> Check out the rules channel to get started!`);
}

export function createCubesEmbed(discordUser:User, cubes: ICube[]) {
  let description = '';
  cubes.forEach((cube, index) => description += `${index + 1}. ${cube.link}\n`);
  return new EmbedBuilder()
    .setColor(0x40863f)
    .setTitle(`${discordUser.username}'s Cubes`)
    .setThumbnail(discordUser.displayAvatarURL())
    .setDescription(description);
}