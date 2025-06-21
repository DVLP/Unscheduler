import fs from 'fs';
import path from 'path';
import tty from 'tty';
import os from 'os';
import { handleMessages } from './outputHandler.mjs';
import { PSRunner } from './psrunner.mjs';
import { saveSnapshot } from './snapshot.mjs';

process.openStdin();
process.stdin.setRawMode(true);

compareSnapshot();
const found = [];

function splitAndTrimLine(line) {
  var withoutOuterQuotes = line.substr(1, line.length - 2);
  return withoutOuterQuotes.split('\",\"');
}

export function compareSnapshot(interactive = false) {
  process.stdin.removeListener('data', handleKeypress);
  let started = false;
  let tasksDB = [];
  try {
    tasksDB = JSON.parse(fs.readFileSync(path.resolve() + '\\scheduleSnapshot.txt').toString());
  } catch (e) {
    console.error('First run install.bat. This file will run automatically on startup.');
    return;
  }

  return PSRunner.send(['schtasks /query /V /FO CSV']).then((result) => {

    var arr = result[0].output.join('').split('\r\n');
    var jsonObj = [];
    var headers = splitAndTrimLine(arr[0])
    for(var i = 1; i < arr.length; i++) {
      var data = splitAndTrimLine(arr[i]);
      if(data[1] === 'TaskName') continue;

      var obj = {};
      for(var j = 1; j < data.length; j++) {
         obj[headers[j].trim()] = data[j].trim();
      }
      jsonObj.push(obj);
    }
    var serialized = JSON.stringify(jsonObj);

    found.length = 0;

    jsonObj.forEach(el => {
      if(!tasksDB.find(storedTask => storedTask['TaskName'] === el['TaskName'])) {
        found.push(el);
      }
    });

    // when running as invisible scanner but new entires were detected, open interactive version
    if(found.length && os.userInfo().username.toLowerCase() === 'system') {
      PSRunner.send(['schtasks /run /tn "Unsheduler-Interactive"']);
      // process.exit();
      return;
    }

    if (found.length) {
      console.log('ATTENTION: New entries found! \n');
      found.forEach((item, ind) => {
        console.log(ind + '. ' + item['TaskName']);
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
    console.log('Removing ' + found[removingIndex]['TaskName']);
    PSRunner.send([
      'schtasks /delete /tn "' + found[removingIndex]['TaskName'] + '" /f'
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
    console.log('Are you sure you want to remove Scheduled Task "' + found[chunk]['TaskName'] + '"? Y/N');
  }
}
