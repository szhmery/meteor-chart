//import { Features } from './features.js'

//import { exec } from 'child_process';

//const child_process = require('child_process');

Meteor.methods({
    create_server: (cmd) => {
        // console.log(child_process); //test
        console.log("CMD: " + cmd);
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log("ERR: " + err);
            } else {
                console.log("OUT: " + stdout);
            }
        });
    },
});