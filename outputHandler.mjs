export function handleMessages(out) {
  if(out[0].errors.length) {
    if(out[0].errors[1].includes('Access is denied')) {
      console.error('Error: Run this command as Administrator');
    } else {
      console.error(out[0].errors[1]);
    }
  } else {
    console.log(out[0].output.join('. '));
  }
}
