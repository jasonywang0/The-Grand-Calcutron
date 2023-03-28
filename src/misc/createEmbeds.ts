import { EmbedBuilder,  GuildMember } from 'discord.js';
import { IGuildDocument } from '../db/models/guild.model.js';
import { IGuildRole } from '../db/schemas/guildRole.schema.js';
import { ImageName } from '../constants/images.js';
import { CustomError } from '../structures/error.js';
import { ICube } from '../db/schemas/cube.schema.js';
import { User, Role } from 'discord.js';
import { IUserDocument } from '../db/models/user.model.js';

interface LevelEmbed {
  user: IUserDocument,
  level: IGuildRole,
  discordUser: User,
  discordRole: Role,
  guild?: IGuildDocument
}

export function createLevelGetEmbed(info:LevelEmbed): EmbedBuilder {
  const { user, discordUser, discordRole, level } = info;
  return new EmbedBuilder()
    .setColor(discordRole.color)
    .setTitle(`${discordUser.username}'s Level`)
    .setThumbnail(discordUser.displayAvatarURL())
    .setDescription(`**<@!${discordUser.id}> is a <@&${discordRole.id}> with ${user.getPoints()} points!**`)
    .setImage(level.image || discordUser.displayAvatarURL());
}

export function createLevelUpEmbed(info:LevelEmbed): EmbedBuilder {
  const { user, discordUser, discordRole, level, guild } = info;
  let color = discordRole.color;
  const pointsStatement = user.points === 1 ? `${user.points} point` : `${user.points} points`;
  let description = `**<@!${discordUser.id}> leveled up to <@&${discordRole.id}> with ${pointsStatement}!**`;
  let image = level.image;

  // user is max level
  if (user.points !== level.points) {
    description = `**<@!${discordUser.id}> leveled up with ${pointsStatement}!**`;
    color = 0x40863f;
    if (guild) image = guild.getImageByName(ImageName.Level).link;
  }

  return new EmbedBuilder()
    .setColor(color)
    .setTitle('Level Up')
    .setDescription(description)
    .setThumbnail(discordUser.displayAvatarURL())
    .setImage(image);
}

export function createWelcomeEmbed(guildMember: GuildMember, guild:IGuildDocument) {
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
    .setDescription(description);
}