
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
}

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

