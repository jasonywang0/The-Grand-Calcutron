import { Events, Client } from 'discord.js';
import { EventClass } from '../../structures/event.js';
import updateStatus from '../../misc/updateStatus.js';

export default new EventClass({
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
      try {
        console.log(client.user.username + " is online");
        updateStatus(client);
        setInterval(() => {
          updateStatus(client);
        }, 3600000)
      } catch (e) {
        console.log(e.getMessage());
      }
    }
});