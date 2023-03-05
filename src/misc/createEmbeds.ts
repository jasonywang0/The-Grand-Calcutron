import { EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { IRoleDocument }  from '../db/models/role.model.js'
import { Image } from '../db/models/image.model.js';

 interface levelInfo {
  interaction: ChatInputCommandInteraction<'cached'>,
  level: IRoleDocument,
  points: number
}

export async function createLevelGetEmbed(info:levelInfo): Promise<EmbedBuilder> {
  const { interaction, level, points } = info;
  let role = interaction.guild.roles.cache.get(level.getDiscordId());
  if (!role) throw Error('Embed Failed - Role not found');
  let image = await level.getImage();
  return new EmbedBuilder()
    .setColor(role.color)
    .setTitle(`Level Stats`)
    .setThumbnail(interaction.user.displayAvatarURL())
    .setDescription(`**<@!${interaction.user.id}> has ${points} counters!**`)
    .setImage(image.getLink() || interaction.user.displayAvatarURL());
}

export async function createLevelUpEmbed(info:levelInfo): Promise<EmbedBuilder> {
  const { interaction, level, points } = info;
  let color = 0x40863f;
  let title = 'Level Up';
  let description = `**<@!${interaction.user.id}> leveled up to ${points} counters!**`;
  const image = await Image.findByName('level');
  let imageLink = image.getLink();

  if (points === level.getPoints()) { // promotion
    let role = interaction.guild.roles.cache.get(level.getDiscordId());
    if (!role) throw Error('Embed Failed - Role not found');
    const image: any = await level.getImage();
    color = role.color;
    imageLink = image.getLink();
    title = `:fire: **Polymorph** :fire:`;
    description = `**<@!${interaction.user.id}> leveled up to <@&${role.id}> with ${points} counters!**`;
  } 
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setThumbnail(interaction.user.displayAvatarURL())
    .setDescription(description)
    .setImage(imageLink);
}
