//*********************************************
// Connect to the device , send, receive messages
//*********************************************
/**
 *
 * @param protocolAdaptor - must have a function onMessage(message) that expects a json object
 * @constructor
 */
function WebSocketDevice() {
    // This is the websocket connection
    this.deviceSocket = null;
    // The id for the ping interval timer so we can stop it
    this.pingIntervalId = null;
    // flag for echoing messages to the console
    this.echoAllMessages = false;
    // The last time a pong was received
    this.pongReceivedMillis = 0;
    // The last time a ping was sent.
    this.pingSentMillis = 0;
    // How often a ping is sent
    this.millisecondsBetweenPings = 5000; // 5 seconds
    // How long should it be before we warn on a dead connection
    this.deadConnectionWarnThreshold = this.millisecondsBetweenPings * 3;
    // How long should it be before we error on a dead connection
    this.deadConnectionErrorThreshold = this.millisecondsBetweenPings * 20; // Is 1 minute reasonable?
    // Flag to indicate if we attempt reconnects
    this.reconnect = true;
    this.reconnectAttempts = 0;
    this.numberOfReconnectAttemptsBeforeWeGiveUp = 20;
    this.timebetweenReconnectAttempts = 3000;
    // A queue of messages that may be populated while we attempt to reconnect.
    this.resendQueue = [];

    this.eventEmitter = new EventEmitter();

    this.contactDevice = function(ws_address) {
        var me = this;
        /**
         * Start the websocket connection to the device
         */
        if (ws_address) {
            // This will be a connection to the clover POSApiServer/SupportServer.  The url
            // can include the device id to contact, and let the server determine how to get
            // to the device (it is doing that now , but it is hardcoded)
            // deviceSocket = new WebSocket("ws://localhost:18000");
            this.deviceSocket = new WebSocket(
                //        "ws://192.168.0.56:49152"
                //        selectedDevice.websocket_direct
                ws_address
            );

            this.deviceSocket.onopen = function (event) {
                this.reconnecting = false;
                me.reconnectAttempts = 0;
                // Set up the ping for every 5 seconds
                me.pingIntervalId = setInterval(function () {
                    me.checkDeadConnection();
                    me.ping();
                }, me.millisecondsBetweenPings);
                me.onopen(event);
            };

            this.deviceSocket.onmessage = function (event) {
                var jsonMessage = JSON.parse(event.data);
                me.receiveMessage(jsonMessage);
            }

            this.deviceSocket.onerror = function (event) {
                if(me.reconnect) {
                    if(me.reconnectAttempts < me.numberOfReconnectAttemptsBeforeWeGiveUp) {
                        me.reconnectAttempts++;
                        setTimeout(
                            function(){
                                me.reconnectAttempts++;
                                me.attemptReconnect();
                            }, me.timebetweenReconnectAttempts );
                    }
                    else {
                        console.error("Exceeded number of reconnect attempts, giving up");
                        me.reconnectAttempts = 0;
                        me.onerror(event);
                    }
                }
                else {
                    me.onerror(event);
                }
            }

            this.deviceSocket.onclose = function (event) {
                try {
                    clearInterval(this.pingIntervalId);
                }catch(e){
                    console.error(e);
                }
                me.onclose(event);
            }
            console.log("contacting device");
        }
        else {
            alert("Select a device first");
        }
    }

    this.checkDeadConnection  = function() {
        if(this.pongReceivedMillis < this.pingSentMillis) {
            var currentMillis = new Date().getTime();
            var lag = (currentMillis - this.pongReceivedMillis);
            if(lag > this.deadConnectionWarnThreshold) {
                if(lag > this.deadConnectionErrorThreshold) {
                    this.connectionError(lag);
                }
                else {
                    this.connectionWarning(lag);
                }
            }
        }
        this.connectionOK();
    }

    this.connectionOK = function() {
    }

    this.connectionError = function(lag) {
        console.error("Connection appears to be dead...no response in " + lag + " milliseconds");
    }

    this.connectionWarning = function(lag) {
        console.error("Connection is slow...no response in " + lag + " milliseconds");
    }

    this.onerror = function(event) {
        console.error(event);
    }

    this.onopen = function(event) {
        console.info(event);
    }

    this.onclose = function(event) {
        console.info(event);
    }

    this.disconnectFromDevice = function() {
        clearInterval(this.pingIntervalId);
        this.deviceSocket.close();
    }

    this.attemptReconnect = function() {
        this.disconnectFromDevice();
        this.reconnecting = true;
        console.log("attempting reconnect...");
        this.contactDevice(this.deviceSocket.url);
    }

    /**
     * Send a message on the websocket.  The parameter will be serialized to json
     * @param message
     */
    this.sendMessage = function(message) {
        var stringMessage = JSON.stringify(message);
        if(this.echoAllMessages) {
            console.log("sending message:" + stringMessage)
        }
        if(this.deviceSocket.readyState == WebSocket.CLOSING || this.deviceSocket.readyState == WebSocket.CLOSED) {
            if(this.reconnect) {
                this.resendQueue.push(stringMessage);
                if(!this.reconnecting) {
                    this.attemptReconnect();
                }
            }
            else {
                this.disconnectFromDevice();
                throw new Error("Device disconnected");
            }
        }
        else {
            if(this.resendQueue.length > 0) {
                this.deviceSocket.send(this.resendQueue.shift());
            }
            this.deviceSocket.send(stringMessage);
        }
    }

    /**
     * Get a message on the websocket.
     * @param message
     */
    this.receiveMessage = function(message) {
        if(this.echoAllMessages) {
            var stringMessage = JSON.stringify(message);
            console.log("receive message:" + stringMessage)
        }
        if(message.hasOwnProperty("type")) {
            if(message["type"] == RemoteMessageBuilder.PONG) {
                this.pong(message);
            }
        }
        this.eventEmitter.emit(message.method, message);
        this.eventEmitter.emit(WebSocketDevice.ALL_MESSAGES, message);
    }

    this.on = function (eventName, callback) {
        this.eventEmitter.on(eventName, callback);
    }

    this.pong = function() {
        this.pongReceivedMillis = new Date().getTime();
    }
    this.ping = function() {
        this.pingSentMillis = new Date().getTime();
        this.sendMessage(this.messageBuilder.buildPing());
    }
}

WebSocketDevice.ALL_MESSAGES = "ALL_MESSAGES";


//**************************************************************
// Functionality to deal with sending messages
//**************************************************************


// Send an update to the order to the device.  No idea what the update is,
// this is just the comms
/**
 * Sends an update to the order to the device, and causes it to displ ay the change.
 *
 * @param order - the entire order json object
 */
WebSocketDevice.prototype.sendShowOrderScreen = function(order) {
    var payload = {
        "order": JSON.stringify(order)
    };
    var lanMessage = this.messageBuilder.buildShowOrderScreen(payload);
    this.sendMessage(lanMessage);
}

// Send a message to start a transaction
WebSocketDevice.prototype.sendTXStart = function(payIntent) {

    // This is how they are doing the payload...
    var payload = {
        "payIntent": payIntent
    };

    var lanMessage = this.messageBuilder.buildTxStart(payload);
    this.sendMessage(lanMessage);
}

// Verify that the signature is valid
WebSocketDevice.prototype.sendSignatureVerified = function(payment) {
    var payload = {};
    payload.verified = true;
    payload.payment = JSON.stringify(payment);

    var lanMessage = this.messageBuilder.buildSignatureVerified(payload);

    this.sendMessage(lanMessage);
}

// Reject the signature
WebSocketDevice.prototype.sendSignatureRejected = function(payment) {
    var payload = {};
    payload.verified = false;
    payload.payment = JSON.stringify(payment);

    var lanMessage = this.messageBuilder.buildSignatureVerified(payload);

    this.sendMessage(lanMessage);
}

WebSocketDevice.prototype.sendFinishCancel = function() {
    var lanMessage = this.messageBuilder.buildFinishCancel();
    this.sendMessage(lanMessage);
}

WebSocketDevice.prototype.sendShowThankYouScreen = function() {
    var lanMessage = this.messageBuilder.buildShowThankYouScreen();
    this.sendMessage(lanMessage);
}

WebSocketDevice.prototype.sendShowWelcomeScreen = function() {
    var lanMessage = this.messageBuilder.buildShowWelcomeScreen();
    this.sendMessage(lanMessage);
}

WebSocketDevice.prototype.sendShowReceiptScreen = function() {
    var lanMessage = this.messageBuilder.buildShowReceiptScreen();
    this.sendMessage(lanMessage);
}

WebSocketDevice.prototype.sendTerminalMessage = function(message) {
    var payload = {"text" : message};
    var lanMessage = this.messageBuilder.buildTerminalMessage(payload);
    this.sendMessage(lanMessage);
}

WebSocketDevice.prototype.sendDiscoveryRequest = function() {
    var lanMessage = this.messageBuilder.buildDiscoveryRequest();
    this.sendMessage(lanMessage);
}