import child_process from 'child_process';

export const PSRunner = {
    send: function(commands) {
        var self = this;
        var results = [];
        var child = child_process.spawn('powershell.exe', ['-Command', '-']);

        child.stdout.on('data', function(data) {
            self.out.push(data.toString());
        });
        child.stderr.on('data', function(data) {
            self.err.push(data.toString());
        });

        commands.forEach(function(cmd){
            self.out = [];
            self.err = [];
            child.stdin.write(cmd+ '\n');
            results.push({ command: cmd, output: self.out, errors: self.err });
        });
        child.stdin.end();

        return new Promise((resolve) => {
            child.on('close', () => {
                resolve(results);
            })
        });
    },
};
