import { User } from "../db/models/user.model.js";
import { Client } from 'discord.js';

export default async function updateStatus(client: Client) {
  const Users = await User.find({maritLage: true});
  const user = Users[Math.floor(Math.random() * Users.length)];
  if (!user) return;
  const discordUser = await client.users.fetch(user.discordId);
  if (!discordUser) return;
  client.user.setPresence({ activities: [{ name: `vs ${discordUser.username}`}]});
};