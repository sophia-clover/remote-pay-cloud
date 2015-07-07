
/**
 * A base for processing messages received from some device.
 *
 * The object includes a function to map messages to the proper
 * function based on the message 'type' and 'method'.
 *
 * @constructor
 */
function ProtocolAdaptor() {
    this.messageFunctions = null;
}

/**
 * This allows the object to be initialized as opposed to 'subclassed'
 * The method mapping happens after creation.
 *
 */
ProtocolAdaptor.prototype.refreshMessageFunctionMapping = function() {
    this.messageFunctions[LanMethod.DISCOVERY_REQUEST] = this.onDiscoveryRequest;
    this.messageFunctions[LanMethod.DISCOVERY_RESPONSE] = this.onDiscoveryResponse;
    this.messageFunctions[LanMethod.FINISH_CANCEL] = this.onFinishCancel;
    this.messageFunctions[LanMethod.FINISH_OK] = this.onFinishOk;
    this.messageFunctions[LanMethod.KEY_PRESS] = this.onKeyPress;
    this.messageFunctions[LanMethod.ORDER_UPDATE] = this.onOrderUpdate;
    this.messageFunctions[LanMethod.PAYMENT_VOIDED] = this.onPaymentVoided;
    this.messageFunctions[LanMethod.PRINT] = this.onPrint;
    this.messageFunctions[LanMethod.SIGNATURE_VERIFIED] = this.onSignatureVerified;
    this.messageFunctions[LanMethod.TIP_ADDED] = this.onTipAdded;
    this.messageFunctions[LanMethod.TX_START] = this.onTxStart;
    this.messageFunctions[LanMethod.TX_STATE] = this.onTxState;
    this.messageFunctions[LanMethod.UI_STATE] = this.onUIState;
    this.messageFunctions[LanMethod.VERIFY_SIGNATURE] = this.onVerifySignature;
};

/**
 * Map messages to functions based on their 'type' and 'method'
 *
 * @param message a lan message in json format.
 */
ProtocolAdaptor.prototype.onMessage = function(message) {
    if(message.hasOwnProperty("type")) {
        if(message["type"] == "PONG") {
            this.handlePongMessage(message);
        }
        else if(message["type"] == "EVENT") {
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

/*
Each of these functions are defined here to clarify the possible messages that may be received.
 */

ProtocolAdaptor.prototype.onDiscoveryRequest = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onDiscoveryResponse = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onFinishCancel = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onFinishOk = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onKeyPress = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onOrderUpdate = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onPaymentVoided = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onPrint = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onSignatureVerified = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onTipAdded = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onTxStart = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onTxState = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onUIState = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.onVerifySignature = function(message){ this.defaultMessageHandle(message);}
ProtocolAdaptor.prototype.handlePongMessage = function(message){ this.defaultMessageHandle(message);}

