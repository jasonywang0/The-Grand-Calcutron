import { SlashCommandBuilder, ContextMenuCommandBuilder, PermissionResolvable } from "discord.js";

interface CustomOptions {
    userPermissions?: PermissionResolvable;
    botPermissions?: PermissionResolvable;
    category?: string;
    cooldown?: number;
    visible?: boolean;
    guildOnly?: boolean;
    channels?: string[];
};

interface CommandOptions {
    data: SlashCommandBuilder | ContextMenuCommandBuilder;
    opt?: CustomOptions;
    execute: (...args: any) => any;
};

export class CommandClass {
    data: CommandOptions['data'];
    opt?: CommandOptions['opt'];
    errorMessage: 'Something went wrong!';
    execute: CommandOptions['execute'];

    constructor(options: CommandOptions) {
        this.data = options.data;
        this.opt = options.opt;
        this.execute = options.execute;
    };
};