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

        return PSRunner.send(['schtasks /query /V /FO CSV']).then((result) => {
          var arr = result[0].output.join('').split('\r\n')
          var jsonObj = [];
          var headers = splitAndTrimLine(arr[0])
          for(var i = 1; i < arr.length; i++) {
            var data = splitAndTrimLine(arr[i]);
            var obj = {};
            for(var j = 1; j < data.length; j++) {
               obj[headers[j].trim()] = data[j].trim();
            }
            jsonObj.push(obj);
          }
          var serialized = JSON.stringify(jsonObj);
          fileWriter.write(serialized);
          fileWriter.end();
          console.log('New snapshot saved!');
          resolve();
        });
    //   }, 1000);
    // });
  });
}

function splitAndTrimLine(line) {
  var withoutOuterQuotes = line.substr(1, line.length - 2);
  return withoutOuterQuotes.split('\",\"');
}
