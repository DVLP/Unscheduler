import { PSRunner } from './psrunner';
import { handleMessages } from './outputHandler';
import fs from 'fs';
import path from 'path';
import tty from 'tty';
import { saveSnapshot } from './snapshot';

process.openStdin();
process.stdin.setRawMode(true);

compareSnapshot();
const found = [];

export function compareSnapshot(interactive = false) {
  process.stdin.removeListener('data', handleKeypress);
  let started = false;
  const lines = fs.readFileSync(path.resolve() + '\\scheduleSnapshot.txt').toString().split('\r\n');

  return PSRunner.send(['Get-ScheduledTask']).then((result) => {
    found.length = 0;

    result[0].output.forEach(el => {
      el = el.replace('\r\n', '')
      if(started && el.trim() !== '' && !lines.includes(el)) {
        found.push(el.slice(43, 77).trim());
      }
      if (el.indexOf('----') === 0) {
        started = true;
      }
    });

    if (found.length) {
      console.log('ATTENTION: New entries found! \n');
      found.forEach((item, ind) => {
        console.log(ind + '.', item);
      })

      console.log('Press a number to delete an entry. If the list is good press "S" to save new entries to the snapshot and exit');
      process.stdin.on('data', handleKeypress);

    } else {
      if (interactive) {
        console.log('All new entries removed. No need to udpate snapshot.');
        process.exit();
      } else {
        console.log('All good. Nothing new. Exiting');
        process.exit();
      }
    }
  });
}

var removingIndex = null;

function handleKeypress(chunk, key) {
  if (('' + chunk).toLowerCase() === 's') {
    saveSnapshot().then(() => {
      setTimeout(() => process.exit(), 100);
    });
    return;
  }

  if (('' + chunk).toLowerCase() === 'y') {
    console.log('Removing ' + found[removingIndex]);
    PSRunner.send([
      'schtasks /delete /tn "' + found[removingIndex] + '" /f'
    ]).then((out) => {
      handleMessages(out);
      console.log('Please wait, refreshing list');
      compareSnapshot(true);
    });
    removingIndex = null;
    return;
  }
  if (('' + chunk).toLowerCase() === 'n') {
    removingIndex = null;
    console.log('Cancelling removal. Press other number or "S" to save and exit');
    return;
  }

  if(!found[chunk]) {
    console.log('Wrong task number provided. Press other number or "S" to accept new entries and exit.');
    return;
  } else {
    removingIndex = chunk;
    console.log('Are you sure you want to remove Scheduled Task "' + found[chunk] + '"? Y/N');
  }
}
