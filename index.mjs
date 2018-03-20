import { PSRunner } from './psrunner';
import { handleMessages } from './outputHandler';
import os from 'os';
import { saveSnapshot } from './snapshot';
import path from 'path';

// in admin mode everything points to system, __directory is undefined and node can't give correct current file path in any way, so triggering error at purpose and extracting file location from error message stack. So very bad :o
function veryHackyGetFolder() {
  try {
    throw new Error();
  } catch(e) {
    const fullMsg = e.stack.toString();
    const beginning = fullMsg.indexOf('file:///') + 8;
    const end = fullMsg.indexOf('\/index.mjs');
    const dir = fullMsg.substr(beginning, end - beginning).replace(/\//g, '\\');
    return dir;
  }
}

saveSnapshot().then(el => {
  scheduleItself().then(el => {
    handleMessages(el);
  });
});

console.log('schtasks /create /tn "Unsheduler" /tr ' + veryHackyGetFolder() + '\\check.bat /SC ONLOGON /ru "' + os.userInfo().username + '" /rl highest /it');

export function scheduleItself() {
  return PSRunner.send([
    //'$trigger = New-JobTrigger -AtStartup -RandomDelay 00:00:30',
    //'Register-ScheduledJob -Trigger $trigger -FilePath ' + veryHackyGetFolder() + '\\unsheduler.bat -Name Unsheduler'
    // 'Unregister-ScheduledTask'
    'schtasks /create /tn "Unsheduler" /tr ' + veryHackyGetFolder() + '\\check.bat /SC ONLOGON /ru "' + os.userInfo().username + '" /rl highest /it'
  ]);
}
