export const terminalFiles = ['readme', 'services', 'studies', 'pricing', 'studio', 'project'] as const;
export type TerminalFile = typeof terminalFiles[number];
export type TerminalTheme = 'phosphor' | 'amber' | 'mono';
export const terminalThemes: TerminalTheme[] = ['phosphor', 'amber', 'mono'];
const aliases: Record<string, TerminalFile> = {
  readme: 'readme', 'readme.md': 'readme', services: 'services', 'services.md': 'services',
  studies: 'studies', 'studies/': 'studies', pricing: 'pricing', 'pricing.cfg': 'pricing',
  studio: 'studio', 'studio.md': 'studio', project: 'project', 'new-project': 'project', 'new-project.md': 'project',
  '~': 'readme', '/': 'readme', '..': 'readme', '.': 'readme',
};
export function resolveFile(value: string): TerminalFile | undefined {
  const name = value.toLowerCase().replace(/^\.\//, '');
  return Object.hasOwn(aliases, name) ? aliases[name] : undefined;
}
export type Command = {kind: 'open'; file: TerminalFile} | {kind: 'theme'; theme: TerminalTheme}
  | {kind: 'help' | 'ls' | 'clear' | 'exit' | 'empty'} | {kind: 'error'; message: string};
export function parseCommand(raw: string): Command {
  const parts = raw.trim().split(/\s+/);
  const verb = parts[0].toLowerCase();
  if (!verb) return {kind: 'empty'};
  if (['open', 'cat', 'cd'].includes(verb)) {
    if (parts.length !== 2) return {kind: 'error', message: `Usage: ${verb} <file>. Type ls for available files.`};
    const file = resolveFile(parts[1]);
    return file ? {kind: 'open', file} : {kind: 'error', message: `No file named “${parts[1]}”. Type ls for available files.`};
  }
  if (verb === 'theme') {
    const theme = parts[1]?.toLowerCase() as TerminalTheme;
    return parts.length === 2 && terminalThemes.includes(theme) ? {kind: 'theme', theme}
      : {kind: 'error', message: 'Usage: theme phosphor | amber | mono.'};
  }
  if (parts.length === 1) {
    if (['help', 'ls', 'clear', 'exit'].includes(verb)) return {kind: verb as 'help' | 'ls' | 'clear' | 'exit'};
    if (verb === 'pricing') return {kind: 'open', file: 'pricing'};
  }
  return {kind: 'error', message: `Unknown command “${raw.trim()}”. Type help for commands.`};
}

export class CommandHistory {
  private items: string[] = [];
  private cursor = 0;
  private draft = '';
  add(value: string) {
    if (value.trim() && this.items.at(-1) !== value) this.items.push(value);
    this.items = this.items.slice(-50);
    this.cursor = this.items.length;
    this.draft = '';
  }
  move(direction: -1 | 1, current: string) {
    if (this.cursor === this.items.length) this.draft = current;
    this.cursor = Math.max(0, Math.min(this.items.length, this.cursor + direction));
    return this.cursor === this.items.length ? this.draft : this.items[this.cursor];
  }
}
