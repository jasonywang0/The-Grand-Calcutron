import { Events } from 'discord.js';
import { EventClass } from '../../structures/event.js';

export default new EventClass({
    name: Events.MessageCreate,
    execute(message) {
      if (message.channelId !== process.env.HOOK_ENDPOINT) return;
      console.log(`${message.channelId} should go here`);
    }
});