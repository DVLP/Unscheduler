import { PSRunner } from './psrunner';
import { handleMessages } from './outputHandler.mjs';

unschedule('Unsheduler');

export function unschedule(taskName) {
  PSRunner.send([
    'schtasks /delete /tn "' + taskName + '" /f'
  ]).then(handleMessages);
}
