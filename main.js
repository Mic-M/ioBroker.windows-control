'use strict';
/*******************************************************************************************************************
 * Adapter to Control Windows Devices
 * https://github.com/Mic-M/ioBroker.windows-control
 *******************************************************************************************************************/


/******************************************************
 * Global constants and variables
 ******************************************************/
const utils = require('@iobroker/adapter-core'); // The adapter-core module
const request = require('request'); // for Travis CI: in adapter dir, execute: "npm install request --save"

// Helper Functions
const path = require('path');
const helper = require(path.join(__dirname, 'lib', 'utils.js'));

// Timer for updating connection intervals
let updateTimer = null;

let adapter; // The adapter instance

// All devices per configuration table, like: [{deviceName: 'LivingRoom-PC', deviceIp: '10.10.0.100', active:true}]
const CONF_DEVICES = [];

// All user commands per configuration
let CONF_USERCMDS = [];

// Polling Interval (number of seconds - or 0 if disabled)
let CONF_UPDATE_INTERVAL = 0;

// Supported Get Admin Commands (Version 2.6)
const GETADMIN_COMMANDS = ['process', 'shutdown', 'poweroff', 'reboot', 'forceifhung', 'logoff', 'monitor1', 'monitor2']; 

// Supported Get Admin Keys (Version 2.6)
const GETADMIN_KEYS = ['CTRL', 'RCTRL', 'ALT', 'RALT', 'SHIFT', 'RSHIFT', 'WIN', 'RWIN', 'ESC', 'ENT', 'DEL', 'INS', 'VOLUP', 'VOLDN', 'MUTE', 'NEXT', 'PREV', 'PLAY', 'STOP', 'BACK', 'SPACE', 'TAB', 'NUMP', 'NUMS', 'NUMD', 'NUM*', 'NUMM', 'NUML', 'CAPS', 'END', 'HOME', 'PGDN', 'PGUP', 'SCRL', 'PRNTSCR', 'SLEEP', 'DOWN', 'UP', 'LEFT', 'RIGHT', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F19', 'F20', 'F21', 'F22', 'F23', 'F24', 'NUM0', 'NUM1', 'NUM2', 'NUM3', 'NUM4', 'NUM5', 'NUM6', 'NUM7', 'NUM8', 'NUM9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// State _processGetStatusResult value
let PROCESSSTATUS_VAL = [];

// How many elements to keep in PROCESSSTATUS_VAL?
const PROCESSSTATUS_MAX = 30;



/**************************************
 * Initialize the adapter
 **************************************/
init();

/**************************************
 * Main Function, called with init() -> startAdapter().
 **************************************/
function main() {


    // First, we validate and get the adapter settings
    initializeConfigValues(() => {

        const statesToProcess = buildNeededStates();

        // Next, we create all objects (states) which we need
        createAdapterObjects(statesToProcess, () => {

            // States created, now add info (like IP address) to device channels
            // No need for callback/async here...
            for (const lpConfDevice of CONF_DEVICES) {
                const ip = helper.getConfigValuePerKey(CONF_DEVICES, 'deviceName', lpConfDevice.deviceName, 'deviceIp');
                adapter.setObject(lpConfDevice.deviceName, {
                    type: 'channel',
                    common: {name:ip, role:'media.device'},
                    native: {},
                });
            }


            // States created, so we subscribe to all adapter states
            adapter.subscribeStates('*');

            // Schedule Updating Connection States
            killTimer();
            if (CONF_UPDATE_INTERVAL > 0) {
                // Update immediately
                updateConnectionStates(() => {
                    // Update timer
                    updateTimer = setInterval(updateConnectionStates, CONF_UPDATE_INTERVAL * 1000);
                    adapter.log.debug('Connection update scheduled... Interval: ' + CONF_UPDATE_INTERVAL + ' seconds.');
                });
            }

        });

    });

}

/**
 * Kill Timer
 */
function killTimer() {
    if (updateTimer) clearInterval(updateTimer);
    updateTimer = null;
}


/**
 * Update the connection states
 * 
 * @param {object} [callback]   Optional: callback function
 */
function updateConnectionStates(callback = undefined) {

    if (CONF_UPDATE_INTERVAL > 0) {
        adapter.log.debug('Update of connection states (_connection) just triggered.');
        for (let i = 0; i < CONF_DEVICES.length; i++) {

            const options = { url: 'http://' + CONF_DEVICES[i].deviceIp + ':' + CONF_DEVICES[i].devicePort + '/?chk=GetAdmin' };

            adapter.log.debug('Send command to ' + CONF_DEVICES[i].deviceName + ': ' + options.url);
            request(options, function (error, response) {
                if ( (response !== undefined) && !error && ( parseInt(response.statusCode) == 200 )) {
                    adapter.log.debug(CONF_DEVICES[i].deviceName + ' responded with [OK], so connection is given.'); 
                    adapter.setState(CONF_DEVICES[i].deviceName + '._connection', {val: true, ack: true});
                    if (typeof callback === 'function') {
                        return callback(true);
                    } else {
                        return;
                    }
                } else {
                    adapter.log.debug('No response from ' + CONF_DEVICES[i].deviceName + ', so there is no connection.'); 
                    adapter.setState(CONF_DEVICES[i].deviceName + '._connection', {val: false, ack: true});
                    if (typeof callback === 'function') {
                        return callback(true);
                    } else {
                        return;
                    }
                }
            });
            
        }
    }

}



/**
 * Called once a subscribed state changes
 * @param {string} statePath   State Path
 * @param {any}    obj         State object
 */
function stateChanges(statePath, obj) {

    if (obj) {
        // The state was changed

        // Get the device + command state portion of statePath (like test.0.PC-Maria.shutdown)
        const name = statePath.split('.')[statePath.split('.').length - 2];   // e.g. [PC-Maria]
        const whichState = statePath.split('.')[statePath.split('.').length - 1];  // e.g. [shutdown]

        // get IP and port
        const ip = helper.getConfigValuePerKey(CONF_DEVICES, 'deviceName', name, 'deviceIp');
        const port = helper.getConfigValuePerKey(CONF_DEVICES, 'deviceName', name, 'devicePort');

        //////////////////////////////
        // Subscribe: Process Status
        //////////////////////////////
        if(statePath.endsWith('_processGetStatus')) {
            if (obj.val && !obj.ack) { // state value (val) is true and ack=false. ack will be set to true later, once confirmed.

                const whichProcess = obj.val.trim();
                getAdminSendCommand(statePath, name, ip, port, 'chk', whichProcess, function(returnedBody) {
                    // returnedBody looks like: [<html>chrome.exe Running!<p>true</p></html>]
                    let status = '';
                    const match = returnedBody.match(/<html>.*<p>(true|false)<\/p><\/html>/);
                    if (match == null) {
                        status = 'unknown';
                    } else {
                        status = match[1]; // the match of the regexp will be returning true or false as STRING
                    }
                    PROCESSSTATUS_VAL.unshift({process: whichProcess, status: status, ts: Date.now()});
                    PROCESSSTATUS_VAL = PROCESSSTATUS_VAL.slice(0, PROCESSSTATUS_MAX); // Limit the number of elements in the array
                    adapter.setState(name + '._processGetStatusResult', JSON.stringify(PROCESSSTATUS_VAL));
                });
            }
        } else {
            //////////////////////////////
            // Subscribe: Rest
            //////////////////////////////
            if (obj.val && !obj.ack) { // state value (val) is true and ack=false. ack will be set to true later, once confirmed.
                
                if( (ip != -1) && (port != -1) ) {
                    let type = '';
                    let cmd = '';
                    switch (whichState) {
                        case '_sendKey' :
                            type = 'key';
                            cmd = obj.val;
                            break;
                        default:
                            type = 'cmd';
                            cmd = whichState;
                    }                
                    getAdminSendCommand(statePath, name, ip, port, type, cmd);
                } else {
                    adapter.log.warn('No configuration found for [' + name + '], therefore we were not able to send a command.');
                }            
            }
        }
    }
}


/**
 * Send command to GetAdmin.
 * @param {string}  statePath  State which triggered the command
 * @param {string}  name       Name of the Windows computer
 * @param {string}  ip         IP address of Windows computer, like 10.10.0.107
 * @param {string}  port       Port, like 8585
 * @param {string}  type       cmd, chk, or key
 * @param {string}  command    Command
 * @param {object}  [callback] Optional: Callback function. Returns the body or an empty string if no body.
 */
function getAdminSendCommand(statePath, name, ip, port, type, command, callback = undefined) {
    
    const options = { url: 'http://' + ip + ':' + port + '/?' + type + '=' + command };

    adapter.log.debug('Send command to ' + name + ': ' + options.url);
    //adapter.log.info('Send command [' + command + '] to ' + name); 
    request(options, function (error, response, body) {
        let responseReturn = '';
        if ( (response !== undefined) && !error ) {
            if ( parseInt(response.statusCode) == 200 ) {
                adapter.log.debug(name + ' responded with [OK]'); 
                
                // We acknowledge the positive response
                // Remove due to https://forum.iobroker.net/post/413048
                //adapter.setState(statePath, {ack:true}); // just send ack:true
                
                // Also, we update the _connection state at this point.
                if (CONF_UPDATE_INTERVAL > 0) adapter.setState(name + '._connection', {val: true, ack: true});

                // this is returned by GetAdmin
                responseReturn = body;

            } else {
                adapter.log.warn(name + ' responds with unexpected status code [' + response.statusCode + ']');
            }
        } else {
            adapter.log.info('No response from ' + name + ', so it seems to be off.');
            if (CONF_UPDATE_INTERVAL > 0) adapter.setState(name + '._connection', {val: false, ack: true});
        }
        if (typeof callback === 'function') {
            return callback(responseReturn);
        } else {
            return;
        }
    });
}


/**
 * Build an array of states we need to create.
 * Also, we delete states no longer needed.
 * @return {array} Array of states to be created.
 */
function buildNeededStates() {

    const finalStates = [];

    /////////////////////////////////////////
    // A: Build all states needed
    /////////////////////////////////////////
    for (const lpConfDevice of CONF_DEVICES) {

        // Create Get Admin Command States
        for (const lpCommand of GETADMIN_COMMANDS) {
            finalStates.push([lpConfDevice.deviceName + '.' + lpCommand, {name:'Command: ' + lpCommand, type:'boolean', read:false, write:true, role:'button', def:false }]);
        }

        // Create User Specific Command States
        if (! helper.isLikeEmpty(CONF_USERCMDS)) {
            for (const lpCommand of CONF_USERCMDS) {
                finalStates.push([lpConfDevice.deviceName + '.' + lpCommand, {name:'User Command: ' + lpCommand, type:'boolean', read:false, write:true, role:'button', def:false }]);
            }
        }

        // Create states for checking if process is running
        finalStates.push([lpConfDevice.deviceName + '._processGetStatus', {name:'Get status of a process', type:'string', read:true, write:true, role:'state', def:'' }]);
        finalStates.push([lpConfDevice.deviceName + '._processGetStatusResult', {name:'The response of _processGetStatus', type:'string', read:true, write:false, role:'state', def:'' }]);

        
        // Create State for sending a key
        const dropdown = {};
        for (const lpEntry of GETADMIN_KEYS) {
            //dropdown += '"' + lpEntry + '":"' + lpEntry + '",'; // fill JSON string
            dropdown[lpEntry] = lpEntry;
        }
        //let dropdownJSON = JSON.parse(dropdown); // convert to JSON

        finalStates.push([lpConfDevice.deviceName + '._sendKey', {name:'Send Key', type:'string', read:true, write:true, role:'state', states:dropdown, def:'' }]);

        // Create "_connection" state
        if (CONF_UPDATE_INTERVAL > 0) {
            finalStates.push([lpConfDevice.deviceName + '._connection', {name:'Connection status', type:'boolean', read:true, write:false, role:'indicator.connected', def:false }]);
        }
    }


    /////////////////////////////////////////
    // B: Delete all redundant states and channels which are no longer used.
    /////////////////////////////////////////

    // Let's get all states and devices, which we still need, into an array
    const statesUsed = [];
    const channelsUsed = [];
    for (const lpStateObj of finalStates) {

        const lpState = lpStateObj[0].toString(); // like: "GuestRoom-PC.logoff"
        const lpDevice = lpState.split('.')[0]; // like: GuestRoom-PC
        statesUsed.push(adapter.namespace + '.' + lpState);
        channelsUsed.push(adapter.namespace + '.' + lpDevice);
    }

    // Next, delete all states no longer needed.
    adapter.getStatesOf(function(err, result) {
        if (result != undefined) {
            for (const lpState of result) {
                const statePath = lpState._id;
                if (statesUsed.indexOf(statePath) == -1) {
                    // State is no longer needed.
                    adapter.log.info('State [' + statePath + '] is no longer used, so we delete it.');
                    adapter.delObject(statePath); // Delete state.
                }
            }
        }
    });

    // Next, delete all channels no longer needed.
    adapter.getChannelsOf(function(err, result) {
        if (result != undefined) {
            for (const lpState of result) {
                const statePath = lpState._id;
                if (channelsUsed.indexOf(statePath) == -1) {
                    // Channel is no longer needed.
                    adapter.log.info('Channel [' + statePath + '] is no longer used, so we delete it.');
                    adapter.delObject(statePath); // Delete channel.
                }
            }
        }
    });    


    return finalStates;

}


/**
 * Create Adapter Objects
 * @param {array}  objects      Array of states to create
 * @param {object} callback     Callback function
 */
function createAdapterObjects(objects, callback) {

    let numStates = objects.length;
    helper();    
    /**
     * Helper function: This is a "callback loop" through a function. Inspired by https://forum.iobroker.net/post/152418
     */
    function helper() {
        numStates--;
        if (numStates >= 0) {
            adapter.setObjectNotExists(objects[numStates][0], {type:'state', common:objects[numStates][1], native: {}}, function(err, obj) {
                if (!err && obj) {
                    adapter.log.debug('Object created: ' + objects[numStates][0]);
                }
                setImmediate(helper); // we call function again. We use node.js setImmediate() to avoid stack overflows.
            });
        } else {
            // All objects processed
            return callback();
        }
    }

}

/**
 * Checks and validates the configuration values of adapter settings
 * Provides result in CONF_DEVICES and CONF_USERCMDS
 *  @param {object} [callback]     Optional: a callback function
 */
function initializeConfigValues(callback = undefined) {

    // Verify the device table contents
    if(!helper.isLikeEmpty(adapter.config.getAdminDevices)) {
        // Example: [{deviceName: 'GuestRoom-PC', deviceIp: '10.10.0.100', devicePort:'8585', active:true}];
        for (const lpEntry of adapter.config.getAdminDevices) {
            if ( (lpEntry.active != undefined) && (lpEntry.active)) {
    
                let pass = false;
    
                // Verify name
                let name = lpEntry.deviceName;
                name = helper.cleanStringForState(name);
                if (name.length < 1) {
                    adapter.log.warn('[Adapter Configuration Error] Given name "' + lpEntry.deviceName + '" is not valid.');
                } else {
                    pass = true;
                }
    
                // Verify IP address
                // @ts-ignore - is actually existing
                let ip = lpEntry.deviceIp;
                ip = ip.replace(/\s+/g, ''); // remove all white-spaces
                const checkIp = ip.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/);
                if (checkIp == null && ip != 'localhost') {
                    adapter.log.warn('[Adapter Configuration Error] Given IP address "' + lpEntry.deviceIp + '" is not valid.');
                } else {
                    pass = true;
                }
    
                // Verify Port
                const port = parseInt(lpEntry.devicePort);
                if(!helper.isLikeEmpty(port) && (port > 1) && (port <= 65535) ) {
                    pass = true;
                } else {
                    adapter.log.warn('[Adapter Configuration Error] Given port "' + lpEntry.devicePort + '" is not valid.');                    
                }

                // Finalize
                if(pass) CONF_DEVICES.push({deviceName: name, deviceIp: ip, devicePort:port});
    
            } 
        }
    }

    if ( CONF_DEVICES.length < 1 ) adapter.log.error('[Adapter Configuration Error] No devices configured.');

    // Verify the user GetAdmin commands
    if (!helper.isLikeEmpty(adapter.config.ownGetAdminCommands)) {
        let userCmdStr = adapter.config.ownGetAdminCommands;
        userCmdStr = userCmdStr.replace(/\s+/g, ''); // remove all white-spaces
        let userCmdArray = userCmdStr.split(',');
        userCmdArray = helper.cleanArray(userCmdArray);
        const finalArr = [];
        for (const lpEntry of userCmdArray) {
            finalArr.push(helper.cleanStringForState(lpEntry));
        }
        CONF_USERCMDS = finalArr;
    }

    // Update Interval for Connection states
    if (!helper.isLikeEmpty(adapter.config.updateConnectionInterval)) {
        const polling = parseInt(adapter.config.updateConnectionInterval.toString());
        // not less than 5 seconds
        if (polling < 5 || polling > 10000) {
            CONF_UPDATE_INTERVAL = 0;
        } else {
            CONF_UPDATE_INTERVAL = polling;
        }
    } else {
        CONF_UPDATE_INTERVAL = 0;
    }

    // Finalize
    adapter.log.info(CONF_DEVICES.length + ' device(s) and ' + CONF_USERCMDS.length + ' user command(s) configured.');
    if (typeof callback === 'function') { // execute if a function was provided to parameter callback
        return callback();
    } else {
        return;
    }    
}





/**************************************************************************************************************************************
 * DONE. Here comes all the rest needed for an adapter.
 * We don't really touch this, it was provided by the adapter creator.
 **************************************************************************************************************************************/
function init() {
    // @ts-ignore parent is a valid property on module
    if (module.parent) {
        // Export startAdapter in compact mode
        module.exports = startAdapter;
    } else {
        // otherwise start the instance directly
        startAdapter();
    }
}

/**
 * Starts the adapter instance
 * @param {Partial<ioBroker.AdapterOptions>} [options]
 */
function startAdapter(options) {
    // Create the adapter and define its methods
    return adapter = utils.adapter(Object.assign({}, options, {
        name: 'windows-control',

        // The ready callback is called when databases are connected and adapter received configuration.
        // start here!
        ready: main, // Call main function.

        // This is called once adapter shuts down - callback has to be called under any circumstances!
        unload: (callback) => {
            killTimer();
            try {
                adapter.log.info('cleaned everything up...');
                callback();
            } catch (e) {
                callback();
            }
        },

        // is called if a subscribed object changes
        objectChange: (id, obj) => {
            if (obj) {
                // The object was changed
                adapter.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
            } else {
                // The object was deleted
                adapter.log.info(`object ${id} deleted`);
            }
        },

        // is called if a subscribed state changes
        stateChange: (id, state) => {
            stateChanges(id, state);
            if (state) {
                // The state was changed
                adapter.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
            } else {
                // The state was deleted
                adapter.log.debug(`state ${id} deleted`);
            }
        },

    }));
}
