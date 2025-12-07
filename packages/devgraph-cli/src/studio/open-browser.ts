import { exec } from 'node:child_process';
import { platform } from 'node:os';

export function openBrowser(url: string): void {
  const os = platform();

  let command: string;

  switch (os) {
    case 'darwin':
      command = `open "${url}"`;
      break;
    case 'win32':
      command = `start "" "${url}"`;
      break;
    default:
      // Linux and others
      command = `xdg-open "${url}"`;
      break;
  }

  exec(command, (error) => {
    if (error) {
      console.log(`Could not open browser automatically. Please visit: ${url}`);
    }
  });
}
