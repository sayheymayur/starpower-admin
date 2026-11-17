export interface GatewayUserCommand {
  userId: number;
  service: string;
  command: string;
  commandArgs?: string;
  timestamp: string;
}

const SERVICE_LABELS: Record<string, string> = {
  call: 'Call',
  chat: 'Chat',
  wallet: 'Wallet',
  user: 'User',
  listener: 'Listener',
  post: 'Posts',
  notification: 'Notifications',
};

const COMMAND_LABELS: Record<string, string> = {
  '/getactivesessions': 'Active sessions',
  '/getpmlogs': 'Private messages',
  '/seenmsgs': 'Mark messages seen',
  '/sendmsg': 'Send message',
  '/startsession': 'Start session',
  '/endsession': 'End session',
};

/** Parse `|gateway|usercmd|{userId}|{service}|{command} [args]` */
export function parseGatewayUserCmd(raw: string): GatewayUserCommand | null {
  const parts = raw.split('|').filter((p) => p.length > 0);
  if (parts.length < 5 || parts[0] !== 'gateway' || parts[1] !== 'usercmd') {
    return null;
  }

  const userId = Number(parts[2]);
  const service = parts[3];
  const commandPart = parts.slice(4).join('|').trim();
  if (!Number.isFinite(userId) || !service || !commandPart) return null;

  const spaceIdx = commandPart.indexOf(' ');
  const command = spaceIdx > 0 ? commandPart.slice(0, spaceIdx) : commandPart;
  const commandArgs = spaceIdx > 0 ? commandPart.slice(spaceIdx + 1).trim() : undefined;

  return {
    userId,
    service,
    command,
    commandArgs,
    timestamp: new Date().toISOString(),
  };
}

export function serviceLabel(service: string): string {
  return SERVICE_LABELS[service.toLowerCase()] ?? service;
}

export function commandLabel(command: string): string {
  return COMMAND_LABELS[command] ?? command.replace(/^\//, '').replace(/-/g, ' ');
}

export function formatUserCommandActivity(cmd: GatewayUserCommand): string {
  const label = commandLabel(cmd.command);
  if (cmd.commandArgs) {
    return `${label} (${cmd.commandArgs})`;
  }
  return label;
}

export const SERVICE_BADGE_COLORS: Record<string, string> = {
  call: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  chat: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  wallet: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  user: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  listener: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  post: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  notification: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
};

export function serviceBadgeClass(service: string): string {
  return (
    SERVICE_BADGE_COLORS[service.toLowerCase()] ??
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  );
}
