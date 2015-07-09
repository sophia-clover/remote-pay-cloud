
/**
 * A base for processing messages received from some device.
 *
 * The object includes a function to map messages to the proper
 * function based on the message 'type' and 'method'.
 *
 * @constructor
 */
function ProtocolAdaptor(messageBuilder) {
    this.messageFunctions = null;
    this.messageBuilder = messageBuilder;
    this.messageSender = null;
}

//**************************************************************
// Functionality to deal with received messages
//**************************************************************
/**
 * Map messages to functions based on their 'type' and 'method'
 *
 * @param message a lan message in json format.
 */
ProtocolAdaptor.prototype.onMessage = function(message) {
    if(message.hasOwnProperty("type")) {
        if(message["type"] == RemoteMessageBuilder.PONG) {
            this.handlePongMessage(message);
        }
        else if(message["type"] == RemoteMessageBuilder.PING) {
            this.handlePingMessage(message);
        }
        else if(message["type"] == RemoteMessageBuilder.COMMAND) {
            if(message.hasOwnProperty("method")) {
                var messageMethod = message["method"];
                if(this.messageFunctions == null){
                    this.messageFunctions = [];
                    this.refreshMessageFunctionMapping();
                }
                if(this.messageFunctions.hasOwnProperty(messageMethod)) {
                    this.messageFunctions[messageMethod].call(this,message);
                }
                else {
                    this.defaultMessageHandle(message);
                }
            }
        }
        else {
            this.defaultMessageHandle(message);
        }
    }
    else {
        this.unknownMessageTypeHandle(message);
    }
}

/**
 * If no message handling is defined, then this is called.
 * @param message
 */
ProtocolAdaptor.prototype.defaultMessageHandle = function(message) {
        var stringMessage = JSON.stringify(message);
        console.log("received message:" + stringMessage);
}

/**
 * If a message is received, and the type is unknown (or missing), then this is called.
 * @param message
 */
ProtocolAdaptor.prototype.unknownMessageTypeHandle = function(message) {
    var stringMessage = JSON.stringify(message);
    console.error("received unknown message type, message:" + stringMessage);
}

/**
 * This allows the object to be initialized as opposed to 'subclassed'
 * The method mapping happens after creation.
 *
 */
ProtocolAdaptor.prototype.refreshMessageFunctionMapping = function() {
    this.messageFunctions[LanMethod.TX_START ] = this.onTxStart;
    this.messageFunctions[LanMethod.KEY_PRESS ] = this.onKeyPress;
    this.messageFunctions[LanMethod.UI_STATE ] = this.onUIState;
    this.messageFunctions[LanMethod.TX_STATE ] = this.onTxState;
    this.messageFunctions[LanMethod.FINISH_OK ] = this.onFinishOk;
    this.messageFunctions[LanMethod.FINISH_CANCEL ] = this.onFinishCancel;
    this.messageFunctions[LanMethod.DISCOVERY_REQUEST ] = this.onDiscoveryRequest;
    this.messageFunctions[LanMethod.DISCOVERY_RESPONSE ] = this.onDiscoveryResponse;
    this.messageFunctions[LanMethod.TIP_ADDED ] = this.onTipAdded;
    this.messageFunctions[LanMethod.VERIFY_SIGNATURE ] = this.onVerifySignature;
    this.messageFunctions[LanMethod.SIGNATURE_VERIFIED ] = this.onSignatureVerified;
    this.messageFunctions[LanMethod.PAYMENT_VOIDED ] = this.onPaymentVoided;
    this.messageFunctions[LanMethod.PRINT_PAYMENT ] = this.onPrintPayment;
    this.messageFunctions[LanMethod.PRINT_PAYMENT_MERCHANT_COPY ] = this.onPrintPaymentMerchanyCopy;
    this.messageFunctions[LanMethod.PRINT_CREDIT ] = this.onPrintCredit;
    this.messageFunctions[LanMethod.PRINT_PAYMENT_DECLINE ] = this.onPrintPaymentDecline;
    this.messageFunctions[LanMethod.PRINT_CREDIT_DECLINE ] = this.onPrintCreditDecline;
    this.messageFunctions[LanMethod.PRINT_TEXT ] = this.onPrintText;
    this.messageFunctions[LanMethod.PRINT_IMAGE ] = this.onPrintImage;
    this.messageFunctions[LanMethod.TERMINAL_MESSAGE ] = this.onTerminalMessage;
    this.messageFunctions[LanMethod.SHOW_WELCOME_SCREEN ] = this.onShowWelcomeScreen;
    this.messageFunctions[LanMethod.SHOW_THANK_YOU_SCREEN ] = this.onShowThankYouScreen;
    this.messageFunctions[LanMethod.SHOW_RECEIPT_SCREEN ] = this.onShowReceiptScreen;
    this.messageFunctions[LanMethod.SHOW_ORDER_SCREEN ] = this.onShowOrderScreen;
    this.messageFunctions[LanMethod.BREAK ] = this.onBreak;
};

/*
Each of these functions are defined here to clarify the possible messages that may be received.
 */
ProtocolAdaptor.prototype.onTxStart = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onKeyPress = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onUIState = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onTxState = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onFinishOk = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onFinishCancel = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onDiscoveryRequest = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onDiscoveryResponse = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onTipAdded = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onVerifySignature = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onSignatureVerified = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onPaymentVoided = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onPrintPayment = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onPrintPaymentMerchanyCopy = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onPrintCredit = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onPrintPaymentDecline = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onPrintCreditDecline = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onPrintText = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onPrintImage = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onTerminalMessage = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onShowWelcomeScreen = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onShowThankYouScreen = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onShowReceiptScreen = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onShowOrderScreen = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onBreak = function(message){ this.defaultMessageHandle(message);}

ProtocolAdaptor.prototype.handlePongMessage = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.handlePingMessage = function(message){ this.defaultMessageHandle(message);}

//**************************************************************
// Functionality to deal with sending messages
//**************************************************************

/**
 * Set the object that will actually send the messages - basic delegate
 * @param sender - object with a function "sendMessage(jsonObject)"
 */
ProtocolAdaptor.prototype.setMessageSender = function(sender) {
    this.messageSender = sender;
}

/**
 * Delegates to the message sender
 * @param message a json message.  Typically this function is called by others in this object.
 */
ProtocolAdaptor.prototype.sendMessage = function(message) {
    if(this.messageSender) {
        this.messageSender.sendMessage(message);
    } else {
        console.log("Attempt made to send message, but message sender is not set.");
    }
}



// Send an update to the order to the device.  No idea what the update is,
// this is just the comms
/**
 * Sends an update to the order to the device, and causes it to displ ay the change.
 *
 * @param order - the entire order json object
 */
ProtocolAdaptor.prototype.sendShowOrderScreen = function(order) {
    var payload = {
        "order": JSON.stringify(order)
    };
    var lanMessage = protocolAdaptor.messageBuilder.buildShowOrderScreen(payload);
    this.sendMessage(lanMessage);
}

// Send a message to start a transaction
ProtocolAdaptor.prototype.sendTXStart = function(payIntent) {

    // This is how they are doing the payload...
    var payload = {
        "payIntent": payIntent
    };

    var lanMessage = protocolAdaptor.messageBuilder.buildTxStart(payload);
    this.sendMessage(lanMessage);
}

// Verify that the signature is valid
ProtocolAdaptor.prototype.sendSignatureVerified = function(payment) {
    var payload = {};
    payload.verified = true;
    payload.payment = JSON.stringify(payment);

    var lanMessage = protocolAdaptor.messageBuilder.buildSignatureVerified(payload);

    this.sendMessage(lanMessage);
}

// Reject the signature
ProtocolAdaptor.prototype.sendSignatureRejected = function(payment) {
    var payload = {};
    payload.verified = false;
    payload.payment = JSON.stringify(payment);

    var lanMessage = protocolAdaptor.messageBuilder.buildSignatureVerified(payload);

    this.sendMessage(lanMessage);
}

ProtocolAdaptor.prototype.sendFinishCancel = function() {
    var lanMessage = protocolAdaptor.messageBuilder.buildFinishCancel();
    this.sendMessage(lanMessage);
}

ProtocolAdaptor.prototype.sendShowThankYouScreen = function() {
    var lanMessage = protocolAdaptor.messageBuilder.buildShowThankYouScreen();
    this.sendMessage(lanMessage);
}

ProtocolAdaptor.prototype.sendShowWelcomeScreen = function() {
    var lanMessage = protocolAdaptor.messageBuilder.buildShowWelcomeScreen();
    this.sendMessage(lanMessage);
}

ProtocolAdaptor.prototype.sendShowReceiptScreen = function() {
    var lanMessage = protocolAdaptor.messageBuilder.buildShowReceiptScreen();
    this.sendMessage(lanMessage);
}

ProtocolAdaptor.prototype.sendTerminalMessage = function(message) {
    var payload = {"text" : message};
    var lanMessage = protocolAdaptor.messageBuilder.buildTerminalMessage(payload);
    this.sendMessage(lanMessage);
}
