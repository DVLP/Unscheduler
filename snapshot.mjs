import { PSRunner } from './psrunner';
import { handleMessages } from './outputHandler';
import fs from 'fs';
import path from 'path';

export function saveSnapshot() {
  const snapPath = path.resolve() + '\\scheduleSnapshot.txt';
  console.log('Saving scheduled tasks to a snapshot to', snapPath);

  return new Promise((resolve) => {
    // fs.writeFile(snapPath, '', () => {
    //   setTimeout(() => {
        const fileWriter = fs.createWriteStream(snapPath, {
          // flags: 'a' // 'a' means appending (old data will be preserved)
        });

        return PSRunner.send(['Get-ScheduledTask']).then((result) => {
          result[0].output.forEach(el => {
            fileWriter.write(el);
          });
          fileWriter.end();
          console.log('New snapshot saved!');
          resolve();
        });
    //   }, 1000);
    // });
  });
}
