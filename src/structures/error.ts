const ErrorCodes = {
  USER_FOUND_1: { code: 'USER1', message: 'User could not be found!'},
  USER_CUBE_1: { code: 'USER_CUBE_1', message: 'User has no cubes set!'},
  USER_CUBE_LIMIT_1: { code: 'USER_CUBE_LIMIT_1', message: 'Cube limit reached!'},
  CHANNEL_FOUND_1: { code: 'CHANNEL_FOUND_1', message: 'The registered channel could not be found!'},
  CHANNEL_INVALID_1: { code: 'CHANNEL_INVALID_1', message: 'This command can not be used in this channel!'},
  CUBE_PARSE_1: { code: 'CUBE_PARSE_1', message: `URL must be a complete link from cube cobra or artisan. Here's an example: https://cubecobra.com/cube/list/thunderwang`}
} as const

class CustomError<K extends keyof typeof ErrorCodes> extends Error {
  code: string
  constructor(code:K, customMessage?: string) {
    let message = ErrorCodes[code].message || 'Something went wrong!';
    if (customMessage) message = customMessage;
    super(message);
    this.code = code;
  }
}

export { CustomError, ErrorCodes }
