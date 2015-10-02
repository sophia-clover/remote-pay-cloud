//*********************************************
// Connect to the device , send, receive messages
//*********************************************
/**
 * The object used to communicate with the device.
 *
 *
 * @constructor
 */
function WebSocketDevice() {
    // This is the websocket connection
    this.deviceSocket = null;
    // The id for the ping interval timer so we can stop it
    this.pingIntervalId = null;
    // flag for echoing messages to the console
    this.echoAllMessages = false;
    // The last time a pong was received, set to current time initially
    this.pongReceivedMillis = new Date().getTime();
    // The last time a ping was sent, set to current time initially
    this.pingSentMillis = new Date().getTime();
    // How often a ping is sent
    this.millisecondsBetweenPings = 10000; // 5 seconds
    // How long should it be before we warn on a dead connection
    this.deadConnectionWarnThreshold = this.millisecondsBetweenPings * 3;
    // How long should it be before we error on a dead connection
    this.deadConnectionErrorThreshold = this.millisecondsBetweenPings * 20; // Is 1 minute reasonable?
    // Flag to indicate if we attempt reconnects
    this.reconnect = true;
    this.reconnectAttempts = 0;
    this.numberOfReconnectAttemptsBeforeWeGiveUp = 20;
    this.timebetweenReconnectAttempts = 6000;
    // A queue of messages that may be populated while we attempt to reconnect.
    this.resendQueue = [];

    // Used to emit messages and state of the device
    this.eventEmitter = new EventEmitter();

    /**
     * Initiates contact with the device.
     *
     * @param {url} ws_address - the web service url to connect to to communicate with the clover device
     */
    this.contactDevice = function(ws_address) {
        var me = this;
        /*
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

                    ///////////////////////////
                    // Dealing with the very strange 401 error in secure web sockets
                    if(!me.triedToFix401) {
                        // Try to deal with the issue where the browser has cached
                        // an old certificate somehow.  There is no indication of this
                        // in the error, so just try to fix it, even if there is some
                        // other error.
                        var wssUrl = me.deviceSocket.url;
                        if (wssUrl.indexOf("wss") > -1) {
                            var httpsUrl = wssUrl.replace("wss", "https");
                            if (!me.xmlHttpSupport) {
                                me.xmlHttpSupport = new XmlHttpSupport();
                            }
                            me.xmlHttpSupport.getData(httpsUrl, console.log.bind(console), console.log.bind(console));
                            me.triedToFix401 = true;
                        }
                    }
                    ///////////////////////////

                    if(me.reconnectAttempts < me.numberOfReconnectAttemptsBeforeWeGiveUp) {
                        me.reconnectAttempts++;
                        setTimeout(
                            function(){
                                me.reconnectAttempts++;
                                me.attemptReconnect();
                            }, me.timebetweenReconnectAttempts );
                    }
                    else {
                        console.error("Exceeded number of reconnect attempts, giving up. There are " +
                            me.resendQueue.length + " messages that were queued, but not sent.");
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

    /**
     * Called to check the state of the connection.
     *
     * @private
     */
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

    /**
     * Called when the connection is OK
     */
    this.connectionOK = function() {
        var message = "Connection Ok";
        this.eventEmitter.emit(WebSocketDevice.CONNECTION_OK, message);
        this.eventEmitter.emit(WebSocketDevice.ALL_MESSAGES, message);
    }

    /**
     * Called when the lag on communication has reached an error length
     * @param {Number} lag - the number of milliseconds between communication to and from the device.  Measured as
     *  related to 'pong' responses to a 'ping'
     */
    this.connectionError = function(lag) {
        var message = "Connection appears to be dead...no response in " + lag + " milliseconds";
        this.eventEmitter.emit(WebSocketDevice.CONNECTION_ERROR, message);
        this.eventEmitter.emit(WebSocketDevice.ALL_MESSAGES, message);
    }

    /**
     * Called when the lag on communication has reached a warning length
     * @param {Number} lag - the number of milliseconds between communication to and from the device.  Measured as
     *  related to 'pong' responses to a 'ping'
     */
    this.connectionWarning = function(lag) {
        var message = "Connection is slow...no response in " + lag + " milliseconds";
        this.eventEmitter.emit(WebSocketDevice.CONNECTION_WARNING, message);
        this.eventEmitter.emit(WebSocketDevice.ALL_MESSAGES, message);
    }

    /**
     * Called on device error
     * @param event
     */
    this.onerror = function(event) {
        this.eventEmitter.emit(WebSocketDevice.DEVICE_ERROR, event);
        this.eventEmitter.emit(WebSocketDevice.ALL_MESSAGES, event);
    }

    /**
     * Called when the device is opened
     * @param event
     */
    this.onopen = function(event) {
        this.eventEmitter.emit(WebSocketDevice.DEVICE_OPEN, event);
        this.eventEmitter.emit(WebSocketDevice.ALL_MESSAGES, event);
    }

    /**
     * Called when the device is closed
     * @param event
     */
    this.onclose = function(event) {
        this.eventEmitter.emit(WebSocketDevice.DEVICE_CLOSE, event);
        this.eventEmitter.emit(WebSocketDevice.ALL_MESSAGES, event);
    }

    /**
     * Called to initiate disconnect from the device
     */
    this.disconnectFromDevice = function() {
        clearInterval(this.pingIntervalId);
        this.sendShutdown();
    }

    /**
     * Called to attempt to reconnect ot the device
     * @private
     */
    this.attemptReconnect = function() {
        {
            // Disconnect without telling the peer that we
            // wantto, because it appears
            // the connection may have gone stale.
            clearInterval(this.pingIntervalId);
            this.deviceSocket.close();
        }
        this.reconnecting = true;
        console.log("attempting reconnect...");
        this.contactDevice(this.deviceSocket.url);
    }

    /**
     * Send a message on the websocket.  The parameter will be serialized to json
     * @param {json} message - the message to send
     * @private
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
            while(this.resendQueue.length > 0) {
                this.deviceSocket.send(this.resendQueue.shift());
            }
            this.deviceSocket.send(stringMessage);
        }
    }

    /**
     * Get a message on the websocket.
     * @param {json} message - the message received on the socket
     * @private
     */
    this.receiveMessage = function(message) {
        if(this.echoAllMessages) {
            var stringMessage = JSON.stringify(message);
            console.log("receive message:" + stringMessage)
        }
        if(message.hasOwnProperty("type")) {
            if(message["type"] == RemoteMessageBuilder.PONG) {
                this.pongReceived(message);
            }
            if(message["type"] == RemoteMessageBuilder.PING) {
                this.pingReceived(message);
            }
        }
        this.eventEmitter.emit(message.method, message);
        this.eventEmitter.emit(WebSocketDevice.ALL_MESSAGES, message);
    }

    /**
     * Registers event callbacks for message method types.
     *
     * @see LanMethod
     *
     * @param {string} eventName - one of the LanMethod types
     * @param {function} callback - the function called with the event data
     */
    this.on = function (eventName, callback) {
        this.eventEmitter.on(eventName, callback);
    }

    /**
     * Unregisters an event callback.
     *
     * @param eventName
     * @param callback
     */
    this.removeListener = function (eventName, callback) {
        this.eventEmitter.removeListener(eventName, callback);
    }

    /**
     * Registers event callbacks for message method types.
     *
     * @see LanMethod
     *
     * @param {string} eventName - one of the LanMethod types
     * @param {function} callback - the function called with the event data
     */
    this.once = function (eventName, callback) {
        this.eventEmitter.once(eventName, callback);
    }

    /**
     * @private
     */
    this.pongReceived = function() {
        this.pongReceivedMillis = new Date().getTime();
    }

    /**
     * @private
     */
    this.pingReceived = function() {
        this.pong();
    }

    /**
     * @private
     */
    this.pong = function() {
        this.pingSentMillis = new Date().getTime();
        this.sendMessage(this.messageBuilder.buildPong());
    }

    /**
     * @private
     */
    this.ping = function() {
        this.pingSentMillis = new Date().getTime();
        this.sendMessage(this.messageBuilder.buildPing());
    }
}

/**
 * Special message method type used to receive all messages received by this device interface.  Used when registering
 * a callback to the WebSocketDevice.on function
 */
WebSocketDevice.ALL_MESSAGES = "ALL_MESSAGES";

// Device state events
/**
 * Prefix for events that are local to the device - right now just
 * for device state events.
 * @type {string}
 */
WebSocketDevice.LOCAL_EVENT = "LOCAL_EVENT";

/**
 * Event emitter key for connection ok messages
 * @type {string}
 */
WebSocketDevice.CONNECTION_OK = WebSocketDevice.LOCAL_EVENT + "_CONNECTION_OK";
/**
 * Event emitter key for connection error messages
 * @type {string}
 */
WebSocketDevice.CONNECTION_ERROR = WebSocketDevice.LOCAL_EVENT + "_CONNECTION_ERROR";
/**
 * Event emitter key for connection warning messages
 * @type {string}
 */
WebSocketDevice.CONNECTION_WARNING = WebSocketDevice.LOCAL_EVENT + "_CONNECTION_WARNING";
/**
 * Event emitter key for device error events
 * @type {string}
 */
WebSocketDevice.DEVICE_ERROR = WebSocketDevice.LOCAL_EVENT + "_DEVICE_ERROR";
/**
 * Event emitter key for device open events
 * @type {string}
 */
WebSocketDevice.DEVICE_OPEN = WebSocketDevice.LOCAL_EVENT + "_DEVICE_OPEN";
/**
 * Event emitter key for device close events
 * @type {string}
 */
WebSocketDevice.DEVICE_CLOSE = WebSocketDevice.LOCAL_EVENT + "_DEVICE_CLOSE";


//**************************************************************
// Functionality to deal with sending messages
//**************************************************************


// Send an update to the order to the device.  No idea what the update is,
// this is just the comms
/**
 * Sends an update to the order to the device, and causes it to display the change.
 *
 * @param {json} order - the entire order json object
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendShowOrderScreen = function(order, ackId) {
    var payload = {
        "order": JSON.stringify(order)
    };
    var lanMessage = this.messageBuilder.buildShowOrderScreen(payload);
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

/**
 *
 * @param {KeyPress} keyCode - the KeyPress to send to the device
 * @param [ackId] - an optional id for the message.  If set then the keypress will be acknowledged,
 *  otherwise there will be no response.
 */
WebSocketDevice.prototype.sendKeyPress = function(keyCode, ackId) {
    var payload = {
        "keyPress": keyCode
    };
    var lanMessage = this.messageBuilder.buildKeyPress(payload);
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

//
/**
 * Send a message to start a transaction.  This will make the device display the payment screen
 *
 * @param {json} payIntent - the payment intention object
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendTXStart = function(payIntent, ackId) {

    // This is how they are doing the payload...
    var payload = {
        "payIntent": payIntent
    };

    var lanMessage = this.messageBuilder.buildTxStart(payload);
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

//
/**
 * Verify that the signature is valid
 *
 * @param {json} payment - the payment object with signature verification fields populated (positively)
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendSignatureVerified = function(payment, ackId) {
    var payload = {};
    payload.verified = true;
    payload.payment = JSON.stringify(payment);

    var lanMessage = this.messageBuilder.buildSignatureVerified(payload);
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

// Reject the signature
/**
 * Verify that the signature is NOT valid
 *
 * @param {json} payment - the payment object with signature verification fields populated (negatively)
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendSignatureRejected = function(payment, ackId) {
    var payload = {};
    payload.verified = false;
    payload.payment = JSON.stringify(payment);

    var lanMessage = this.messageBuilder.buildSignatureVerified(payload);
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

/**
 * Void a payment
 *
 * @param {json} payment - the payment object with signature verification fields populated (negatively)
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendVoidPayment = function(payment, voidReason, ackId) {
    var payload = {};
    payload.payment = JSON.stringify(payment);
    payload.voidReason = voidReason;

    var lanMessage = this.messageBuilder.buildVoidPayment(payload);
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

/**
 * Void a payment
 *
 * @param {string} orderId - the id for the order the refund is against
 * @param {string} paymentId - the id for the payment on the order the refund is against
 * @param {number} [amount] - the amount that will be refunded.  If not included, the amount of
 *  the passed payment will be refunded.
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendRefund = function(orderId, paymentId, amount, ackId) {
    var payload = {};
    payload.orderId = orderId;
    payload.paymentId = paymentId;
    if(amount)payload.amount = amount;

    var lanMessage = this.messageBuilder.buildRefund(payload);
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

/**
 * Show the recipt options screen for a specific ordereid/paymentid.
 *
 * @param {string} orderId - the id for the order
 * @param {string} paymentId - the id for the payment on the order
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendShowPaymentReceiptOptions = function(orderId, paymentId, ackId) {
    var payload = {};
    payload.orderId = orderId;
    payload.paymentId = paymentId;

    var lanMessage = this.messageBuilder.buildShowPaymentReceiptOptions(payload);
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}


/**
 * Send a cancellation message
 *
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendFinishCancel = function(ackId) {
    var lanMessage = this.messageBuilder.buildFinishCancel();
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

/**
 * Send a message to show the 'Thank You' screen
 *
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendShowThankYouScreen = function(ackId) {
    var lanMessage = this.messageBuilder.buildShowThankYouScreen();
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

/**
 * Send a message to show the 'Welcome' screen
 *
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendShowWelcomeScreen = function(ackId) {
    var lanMessage = this.messageBuilder.buildShowWelcomeScreen();
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

/**
 * Send a message to show the receipt screen from the last order
 *
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendShowReceiptScreen = function(ackId) {
    var lanMessage = this.messageBuilder.buildShowReceiptScreen();
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

/**
 * Send a message to show a custom message on the screen
 *
 * @param {string} message - the message to display
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendTerminalMessage = function(message, ackId) {
    var payload = {"text" : message};
    var lanMessage = this.messageBuilder.buildTerminalMessage(payload);
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

/**
 * Send a message to ask the device if it is there.
 *
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendDiscoveryRequest = function(ackId) {
    var lanMessage = this.messageBuilder.buildDiscoveryRequest();
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

/**
 * Send a message to ask the device to print some text
 *
 * @param textLines - an  array of strings
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendPrintText = function(textLines, ackId) {
    //List<String> textLines
    var payload = {"textLines" : textLines};
    var lanMessage = this.messageBuilder.buildPrintText(payload);
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

/**
 * Send a message to ask the device to shutdown the connection.
 *
 * @param textLines - an  array of strings
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendShutdown = function() {
    var lanMessage = this.messageBuilder.buildShutdown();
    // Note:  the 'ack' is not included here because the device will
    // be shutting down,
    this.sendMessage(lanMessage);
}

/**
 * Send a message to ask the device if it is there.
 *
 * @param img - an image.  Can be obtained in a manner similar to :
 *  <pre>var img = document.getElementById("img_id");</pre>
 * @param {string} [ackId] - an optional identifier that can be used to track an acknowledgement
 *  to this message.  This should be a unique identifier, but this is NOT enforced in any way.
 *  A "ACK" message will be returned with this identifier as the message id if this
 *  parameter is included.  This "ACK" message will be in addition to any other message
 *  that may be generated as a result of this message being sent.
 */
WebSocketDevice.prototype.sendPrintImage = function(img, ackId) {
    var payload = {"png" : this.getBase64Image(img) };
    var lanMessage = this.messageBuilder.buildPrintImage(payload);
    // If an id is included, then an "ACK" message will be sent for this message
    if(ackId) lanMessage.id = ackId;

    this.sendMessage(lanMessage);
}

/**
 * @private
 * @param img
 * @returns {string}
 */
WebSocketDevice.prototype.getBase64Image = function(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}