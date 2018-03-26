export function handleMessages(out) {
  out.forEach(handleMessage);
}

function handleMessage(message) {
  if(message.errors.length) {
    if(message.errors[1].includes('Access is denied')) {
      console.error('Error: Run this command as Administrator');
    } else {
      console.error(message.errors[1]);
    }
  } else {
    console.log(message.output.join('. '));
  }
}
