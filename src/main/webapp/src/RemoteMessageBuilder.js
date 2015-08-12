
/**
 * Builds messages to pass to the clover device.
 *
 *
 * @see vcom.clover.remote.protocol.RemoteMessage
 * @param {string} packagename -the packagename used in constructing the messages
 * @constructor
 */
function RemoteMessageBuilder(defaultPackageName){

    this.defaultPackageName = defaultPackageName;

    /**
     * Build a message given the inputs
     *
     * @param {string} method - One of the LanMethod constants
     * @param {string} type - one of the RemoteMessageBuilder constants
     * @param {json} payload - the json object payload (not a string)
     * @param {string} packageName - an override of the package name (optional)
     * @returns {json} the constructed message - a json object
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

    /**
     * Builds a transaction start message
     *
     * @param {json} payload - an order object
     * @returns {json} the constructed message
     */
    this.buildTxStart = function(payload) {
        payload.method = LanMethod.TX_START;
        return this.buildRemoteMessage(LanMethod.TX_START, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a discovery request message
     *
     * @returns {json} the constructed message
     */
    this.buildDiscoveryRequest = function() {
        return this.buildRemoteMessage(LanMethod.DISCOVERY_REQUEST);
    }

    /**
     * Builds a signature verified message
     *
     * @param {json} payload - the signature verified object
     * @returns {json} the constructed message
     */
    this.buildSignatureVerified = function(payload) {
        payload.method = LanMethod.SIGNATURE_VERIFIED;
        return this.buildRemoteMessage(LanMethod.SIGNATURE_VERIFIED, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a signature verified message
     *
     * @param {json} payload - the signature verified object
     * @returns {json} the constructed message
     */
    this.buildPaymentVoid = function(payload) {
        payload.method = LanMethod.PAYMENT_VOIDED;
        return this.buildRemoteMessage(LanMethod.PAYMENT_VOIDED, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a terminal message (display message for device)
     *
     * @param {json} payload - the message
     * @returns {json} the constructed message
     */
    this.buildTerminalMessage = function(payload) {
        payload.method = LanMethod.TERMINAL_MESSAGE;
        return this.buildRemoteMessage(LanMethod.TERMINAL_MESSAGE, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a terminal message (display message for device)
     *
     * @param {json} payload - the message
     * @returns {json} the constructed message
     */
    this.buildPrintText = function(payload) {
        payload.method = LanMethod.PRINT_TEXT;
        return this.buildRemoteMessage(LanMethod.PRINT_TEXT, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a terminal message (display message for device)
     *
     * @param {json} payload - the message
     * @returns {json} the constructed message
     */
    this.buildPrintImage = function(payload) {
        payload.method = LanMethod.PRINT_IMAGE;
        return this.buildRemoteMessage(LanMethod.PRINT_IMAGE, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a message to send to the device to make it show the welcome screen
     *
     * @returns {json} the constructed message
     */
    this.buildShowWelcomeScreen = function() {
        return this.buildRemoteMessage(LanMethod.SHOW_WELCOME_SCREEN, RemoteMessageBuilder.COMMAND);
    }

    /**
     * Builds a message to indicate a cancel
     *
     * @returns {json} the constructed message
     */
    this.buildFinishCancel = function() {
        return this.buildRemoteMessage(LanMethod.FINISH_CANCEL, RemoteMessageBuilder.COMMAND);
    }

    /**
     * Builds a message to send to the device to make it show the 'Thank You' screen
     *
     * @returns {json} the constructed message
     */
    this.buildShowThankYouScreen = function() {
        return this.buildRemoteMessage(LanMethod.SHOW_THANK_YOU_SCREEN, RemoteMessageBuilder.COMMAND);
    }

    /**
     * Builds a message to send to the device to make it show the receipt screen form the last order processed
     *
     * @returns {json} the constructed message
     */
    this.buildShowReceiptScreen = function() {
        return this.buildRemoteMessage(LanMethod.SHOW_RECEIPT_SCREEN, RemoteMessageBuilder.COMMAND);
    }

    /**
     * Builds a message to drive the device to show an order on the screen
     *
     * @param {json} payload - an order object
     * @returns {json} the constructed message
     */
    this.buildShowOrderScreen = function(payload) {
        payload.method = LanMethod.SHOW_ORDER_SCREEN;
        return this.buildRemoteMessage(LanMethod.SHOW_ORDER_SCREEN, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * @private
     * @returns {json} the ping message
     */
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
 * The set of messages understood by the clover device
 *
 * @see com.clover.remote.protocol.LanMethod (java API)
 * @constructor
 */
function LanMethod(){};
/** The transaction start method type */
LanMethod.TX_START = "TX_START";
/** The key pressed method type */
LanMethod.KEY_PRESS = "KEY_PRESS";
/** The user interface state change method type */
LanMethod.UI_STATE = "UI_STATE";
/** The transaction state change method type */
LanMethod.TX_STATE = "TX_STATE";
/** The finish ok method type */
LanMethod.FINISH_OK = "FINISH_OK";
/** The finish cancel method type */
LanMethod.FINISH_CANCEL = "FINISH_CANCEL";
/** The discovery request method type */
LanMethod.DISCOVERY_REQUEST = "DISCOVERY_REQUEST";
/** The discovery response method type */
LanMethod.DISCOVERY_RESPONSE = "DISCOVERY_RESPONSE";
/** The tip added method type */
LanMethod.TIP_ADDED = "TIP_ADDED";
/** The verify signature request method type */
LanMethod.VERIFY_SIGNATURE = "VERIFY_SIGNATURE";
/** The signature verification result method type */
LanMethod.SIGNATURE_VERIFIED = "SIGNATURE_VERIFIED";
/** The payment voided method type */
LanMethod.PAYMENT_VOIDED = "PAYMENT_VOIDED";
/** The print payment reuest method type */
LanMethod.PRINT_PAYMENT = "PRINT_PAYMENT";
/** The print merchant payment copy method type */
LanMethod.PRINT_PAYMENT_MERCHANT_COPY = "PRINT_PAYMENT_MERCHANT_COPY";
/** The print credit method type */
LanMethod.PRINT_CREDIT = "PRINT_CREDIT";
/** The print payment declined method type */
LanMethod.PRINT_PAYMENT_DECLINE = "PRINT_PAYMENT_DECLINE";
/** The print credit declined method type */
LanMethod.PRINT_CREDIT_DECLINE = "PRINT_CREDIT_DECLINE";
/** The print text method type */
LanMethod.PRINT_TEXT = "PRINT_TEXT";
/** The print image method type */
LanMethod.PRINT_IMAGE = "PRINT_IMAGE";
/** The terminal message method type */
LanMethod.TERMINAL_MESSAGE = "TERMINAL_MESSAGE";
/** The show welcome screen method type */
LanMethod.SHOW_WELCOME_SCREEN = "SHOW_WELCOME_SCREEN";
/** The show thank you screen method type */
LanMethod.SHOW_THANK_YOU_SCREEN = "SHOW_THANK_YOU_SCREEN";
/** The show last order receipt screen method type */
LanMethod.SHOW_RECEIPT_SCREEN = "SHOW_RECEIPT_SCREEN";
/** The show order screen method type */
LanMethod.SHOW_ORDER_SCREEN = "SHOW_ORDER_SCREEN";
/** The break method type */
LanMethod.BREAK = "BREAK";

// LanMethod.ORDER_UPDATE = "ORDER_UPDATE";
//LanMethod.PRINT = "PRINT";
