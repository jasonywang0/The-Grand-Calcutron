import { EmbedBuilder, GuildMember } from 'discord.js';
import { IGuildDocument } from '../db/models/guild.model.js';
import { IGuildRole } from '../db/schemas/guildRole.schema.js';
import { ImageName } from '../constants/images.js';
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

interface WelcomeEmbed {
  guildMember: GuildMember,
  discordRole: Role,
  level: IGuildRole,
}

interface CubeEmbed {
  discordUser:User, 
  cubes: ICube[]
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

export function createWelcomeEmbed(info:WelcomeEmbed) {
  const { guildMember, discordRole, level } = info;
  return new EmbedBuilder() 
    .setColor(discordRole.color)
    .setTitle(`Welcome ${guildMember.displayName}!`)
    .setDescription(`<@!${process.env.CLIENT_ID}> polymorphed **${guildMember.displayName}** into a <@&${discordRole.id}> Check out the rules channel to get started!`)
    .setThumbnail(level.image);
}

export function createCubesEmbed(info:CubeEmbed) {
  const { discordUser, cubes } = info;
  let description = '';
  cubes.forEach((cube, index) => description += `${index + 1}. ${cube.link}\n`);
  return new EmbedBuilder()
    .setColor(0x40863f)
    .setTitle(`${discordUser.username}'s Cubes`)
    .setDescription(description);
}