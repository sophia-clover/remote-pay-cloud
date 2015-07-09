
/**
 * @see vcom.clover.remote.protocol.RemoteMessage
 * @constructor
 */
function RemoteMessageBuilder(defaultPackageName){

    this.defaultPackageName = defaultPackageName;

    /**
     * Build a message given the inputs
     *
     * @param method One of the LanMethod constants
     * @param type one of the RemoteMessageBuilder constants
     * @param payload the json object payload (not a string)
     * @param packageName an override of the package name
     * @returns the constructed message - a json object
     */
    this.buildRemoteMessage = function(method, type, payload, packageName) {
        var lanMessage = {};
        if(method) lanMessage.method = method;
        lanMessage.packageName = this.defaultPackageName; //"com.clover.remote.protocol.websocket";
        if(packageName)lanMessage.packageName = packageName;
        // This is how they are doing the payload...
        if(payload) lanMessage.payload = JSON.stringify(payload);
        lanMessage.type = RemoteMessageBuilder.COMMAND;
        if(type)lanMessage.type = type;
        // There is an 'id' in the java instance, but I do not see it being used right now.
        return lanMessage;
    };

    this.buildTxStart = function(payload) {
        payload.method = LanMethod.TX_START;
        return this.buildRemoteMessage(LanMethod.TX_START, RemoteMessageBuilder.COMMAND, payload);
    }

    this.buildDiscoveryRequest = function() {
        return this.buildRemoteMessage(LanMethod.DISCOVERY_REQUEST);
    }

    this.buildSignatureVerified = function(payload) {
        payload.method = LanMethod.SIGNATURE_VERIFIED;
        return this.buildRemoteMessage(LanMethod.SIGNATURE_VERIFIED, RemoteMessageBuilder.COMMAND, payload);
    }

    this.buildTerminalMessage = function(payload) {
        payload.method = LanMethod.TERMINAL_MESSAGE;
        return this.buildRemoteMessage(LanMethod.TERMINAL_MESSAGE, RemoteMessageBuilder.COMMAND, payload);
    }

    this.buildShowWelcomeScreen = function() {
        return this.buildRemoteMessage(LanMethod.SHOW_WELCOME_SCREEN, RemoteMessageBuilder.COMMAND);
    }

    this.buildFinishCancel = function() {
        return this.buildRemoteMessage(LanMethod.FINISH_CANCEL, RemoteMessageBuilder.COMMAND);
    }

    this.buildShowThankYouScreen = function() {
        return this.buildRemoteMessage(LanMethod.SHOW_THANK_YOU_SCREEN, RemoteMessageBuilder.COMMAND);
    }

    this.buildShowReceiptScreen = function() {
        return this.buildRemoteMessage(LanMethod.SHOW_RECEIPT_SCREEN, RemoteMessageBuilder.COMMAND);
    }

    this.buildShowOrderScreen = function(payload) {
        payload.method = LanMethod.SHOW_ORDER_SCREEN;
        return this.buildRemoteMessage(LanMethod.SHOW_ORDER_SCREEN, RemoteMessageBuilder.COMMAND, payload);
    }

    this.buildPing = function() {
        return this.buildRemoteMessage(null, RemoteMessageBuilder.PING);
    }
}
RemoteMessageBuilder.COMMAND = "COMMAND";
RemoteMessageBuilder.QUERY = "QUERY";
RemoteMessageBuilder.EVENT = "EVENT";
RemoteMessageBuilder.PING = "PING";
RemoteMessageBuilder.PONG = "PONG";

/**
 * @see com.clover.remote.protocol.LanMethod
 * @constructor
 */
function LanMethod(){};
LanMethod.TX_START = "TX_START";
LanMethod.KEY_PRESS = "KEY_PRESS";
LanMethod.UI_STATE = "UI_STATE";
LanMethod.TX_STATE = "TX_STATE";
LanMethod.FINISH_OK = "FINISH_OK";
LanMethod.FINISH_CANCEL = "FINISH_CANCEL";
LanMethod.DISCOVERY_REQUEST = "DISCOVERY_REQUEST";
LanMethod.DISCOVERY_RESPONSE = "DISCOVERY_RESPONSE";
LanMethod.TIP_ADDED = "TIP_ADDED";
LanMethod.VERIFY_SIGNATURE = "VERIFY_SIGNATURE";
LanMethod.SIGNATURE_VERIFIED = "SIGNATURE_VERIFIED";
LanMethod.PAYMENT_VOIDED = "PAYMENT_VOIDED";
LanMethod.PRINT_PAYMENT = "PRINT_PAYMENT";
LanMethod.PRINT_PAYMENT_MERCHANT_COPY = "PRINT_PAYMENT_MERCHANT_COPY";
LanMethod.PRINT_CREDIT = "PRINT_CREDIT";
LanMethod.PRINT_PAYMENT_DECLINE = "PRINT_PAYMENT_DECLINE";
LanMethod.PRINT_CREDIT_DECLINE = "PRINT_CREDIT_DECLINE";
LanMethod.PRINT_TEXT = "PRINT_TEXT";
LanMethod.PRINT_IMAGE = "PRINT_IMAGE";
LanMethod.TERMINAL_MESSAGE = "TERMINAL_MESSAGE";
LanMethod.SHOW_WELCOME_SCREEN = "SHOW_WELCOME_SCREEN";
LanMethod.SHOW_THANK_YOU_SCREEN = "SHOW_THANK_YOU_SCREEN";
LanMethod.SHOW_RECEIPT_SCREEN = "SHOW_RECEIPT_SCREEN";
LanMethod.SHOW_ORDER_SCREEN = "SHOW_ORDER_SCREEN";
LanMethod.BREAK = "BREAK";

// LanMethod.ORDER_UPDATE = "ORDER_UPDATE";
//LanMethod.PRINT = "PRINT";
