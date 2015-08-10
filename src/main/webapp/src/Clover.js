/**
 * Clover API for external Systems
 *
 * @param {Object} device - the device that sends and receives messages
 * @constructor
 */
function Clover(configuration) {

    this.device = new WebSocketDevice();
    this.device.messageBuilder = remoteMessageBuilder;
    // Echo all messages sent and received.
    this.device.echoAllMessages = false;

    this.configuration = configuration;

    /**
     *  The deviuce connection is NOT made on completion of this call.  The device connection
     *  will be made once the WebSocketDevice.onopen is called.
     *  @private
     */
    this.initDeviceConnection = function () {
        if (this.configuration.deviceURL) {
            // We have the device url, contact the device
            this.contactDevice();
        } else {
            // Otherwise we must have the oauth token to get the information we need at the very least.
            // Either we already have it...
            if (this.configuration.oauthToken) {
                // We need the device id of the device we will contact.
                // Either we have it...
                if (this.configuration.deviceId) {
                    // this is the uuid for the device

                } else {
                    // or we need to go get it.  This is a little hard, because the merchant
                    // can have multiple devices.

                    // We need the access token, the domain and the merchantId in order to get the devices
                    // We already know that we have the token, but we need to check for the
                    // domain and merchantId.
                    if (this.configuration.domain && this.configuration.merchantId) {
                        var xmlHttpSupport = new XmlHttpSupport();
                        var inlineEndpointConfig = {};
                        var me = this;
                        inlineEndpointConfig.getAccessToken = function () {
                            return me.configuration.oauthToken;
                        };
                        inlineEndpointConfig.configuration.domain = this.configuration.domain;
                        var endpoints = new Endpoints(inlineEndpointConfig);

                        var url = endpoints.getDevicesEndpoint(this.configuration.merchantId);

                        // If there are multiple devices, we need to know which device the user wants
                        // to use.  They can pass the 'serial' number of the device, or a 0 - based index
                        // for the devices, which assumes they know what order the device list will be
                        // returned in.
                        xmlHttpSupport.getData(url,
                            function(devices) {
                                me.handleDevices(devices);
                                if(me.configuration.deviceSerialId) {
                                    // serial' number of the device
                                    me.configuration.deviceId =
                                        me.deviceBySerial[me.configuration.deviceSerialId].id;
                                } else {
                                    //Nothing left to try.  Error out.
                                    throw new Error("Cannot determine what device to use for connection." +
                                        "  You must provide the configuration.deviceId, or the serial number" +
                                        " of the device. " +
                                        " You can find the device serial number using the device. Select " +
                                        "'Settings > About (Station|Mini|Mobile) > Status', select 'Status' and " +
                                        "look for 'Serial number' in the list displayed.");
                                }
                                // recurse
                                initDeviceConnection();
                            }
                            ,console.log
                        );
                    } else {
                        // We do not have enough info to initialize.  Error out
                        throw new Error("Incomplete init info.");
                    }
                }
            } else {
                // or we need to go get it.
                // If we need to go get it, then we will need the clientId
                // and the domain
                if (this.configuration.clientId && this.configuration.domain) {
                    this.cloverOAuth = new CloverOAuth(this.configuration);
                    // This may cause a redirect
                    this.configuration.oauthToken = cloverOAuth.getAccessToken();
                    // recurse
                    this.initDeviceConnection();
                }
            }
        }
    }

    /**
     * Display a set of devices
     * @private
     * @param devicesVX
     */
    this.handleDevices = function(devicesVX) {
        var devices = null;
        this.deviceBySerial = {};
        // depending on the version of the call, the devices might be in a slightly different format.
        // We would need to determine what devices were capable of doing what we want.  This means we
        // need to know if the device has the websocket connection enabled.  The best way to do this is
        // to make a different REST call, but we could filter the devices here.
        if (devicesVX.hasOwnProperty('devices')) {
            devices = devicesVX.devices;
        }
        else if (devicesVX.hasOwnProperty('elements')) {
            devices = devicesVX.elements;
        }
        var out = "";
        var i;
        for (i = 0; i < devices.length; i++) {
            this.deviceBySerial[devices[i].serial] = devices[i];
        }
    }

    /**
     * @private
     */
    this.contactDevice = function () {
        device.contactDevice(this.configuration.deviceURL);
    }

    /**
     * Sale AKA purchase
     *
     * @param {SaleRequest} saleInfo - the information for the sale
     * @param {SaleResponse} saleRequestCallback - the callback that receives the sale completion information.  Two parameters
     *  will be passed to this function: if the payment succeeded, the first will be true, and the second will
     *  be the payment information;  if the payment failed, the first parameter will be false.
     */
    this.sale = function (saleInfo, saleRequestCallback) {
        var payIntent = {
            "action": "com.clover.remote.protocol.action.START_REMOTE_PROTOCOL_PAY",
            "transactionType": "PAYMENT",
            "taxAmount": 0, // tax amount is included in the amount
            "cardEntryMethods": 15
        };
        // Do verification of parameters
        if (!saleInfo.hasOwnProperty("amount") || !isInt(saleInfo["amount"])) {
            throw new Error("paymentInfo must include 'amount', and the value must be an integer");
        }
        if (!saleInfo.hasOwnProperty("tipamount")) {
            saleInfo["tipAmount"] = 0;
        } else if (!isInt(saleInfo["tipamount"])) {
            throw new Error("if paymentInfo has 'tipamount', the value must be an integer");
        }
        if (saleInfo.hasOwnProperty("employeeId")) {
            payIntent.employeeId = saleInfo["employeeId"];
        }
        if (saleInfo.hasOwnProperty("orderid")) {
            payIntent.orderid = saleInfo["orderid"];
        }
        payIntent.amount = saleInfo["amount"];
        payIntent.tipamount = saleInfo["tipamount"];

        var signature = null;
        //Wire in the handler for completion to be called once.
        /**
         * Wire in automatic signature verification for now
         */
        this.device.once(LanMethod.VERIFY_SIGNATURE,
            function (message) {
                var payload = JSON.parse(message.payload);
                var payment = JSON.parse(payload.payment);
                // Already an object...hmmm
                signature = payload.signature;
                device.sendSignatureVerified(payment);
            }
        );
        this.device.once(LanMethod.FINISH_OK,
            function (message) {
                var payload = JSON.parse(message.payload);
                var payment = JSON.parse(payload.payment);
                var callBackPayload = {};
                callBackPayload.payment = payment;
                callBackPayload.signature = signature;

                saleRequestCallback(true, callBackPayload);
            }
        );
        this.device.once(LanMethod.FINISH_CANCEL,
            function (message) {
                saleRequestCallback(false, null);
            }
        );
        this.device.sendTXStart(payIntent);
    }

    /**
     *
     * @param {Object} payment - the payment information returned from a call to 'sale'
     * @param {requestCallback} completionCallback - TODO: the callback that receives the sale completion information.
     *  Two parameters
     *  will be passed to this function: if the void succeeded, the first will be true, and the second will
     *  be any additional information;  if the void failed, the first parameter will be false.
     */
    this.voidTransaction = function (payment, completionCallback) {

        // TODO: Add ACK callback to void.

        device.sendPaymentVoid(payment);
    }

    /**
     * Print an array of strings on the device
     *
     * @param {string[]} textLines - an array of strings to print
     */
    this.print = function (textLines) {
        device.sendPrintText(textLines);
    }

    /**
     * Not yet implemented
     */
    this.printReceipt = function () {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     */
    this.printImage = function (img) {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     */
    this.saleWithCashback = function () {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     */
    this.refund = function () {
        throw new Error("Not yet implemented");
    }

    //////////

    //
    //
    ///**
    // * Not yet implemented
    // */
    //this.preAuth = function() {
    //    throw new Error("Not yet implemented");
    //};
    ///**
    // * Not yet implemented
    // */
    //this.authorize = this.preAuth
    //
    ///**
    // * Not yet implemented
    // */
    //this.adjustAuth = function() {
    //    throw new Error("Not yet implemented");
    //}
    //
    ///**
    // * Not yet implemented
    // */
    //this.tipAdjust = function() {
    //    throw new Error("Not yet implemented");
    //}
    //
    ///**
    // * Not yet implemented
    // */
    //this.manualRefund = function() {
    //    throw new Error("Not yet implemented");
    //}
    ///**
    // * Not yet implemented
    // */
    //this.closeout = function() {
    //    throw new Error("Not yet implemented");
    //}
    //
    ///**
    // * Not yet implemented
    // */
    //this.getSiteTotals = function() {
    //    throw new Error("Not yet implemented");
    //}
    //
    ///**
    // * Not yet implemented
    // */
    //this.displayMessage = function() {
    //    throw new Error("Not yet implemented");
    //}
    //
    ///**
    // * Not yet implemented
    // */
    //this.cancelTxn = function() {
    //    throw new Error("Not yet implemented");
    //}
    //
    ///**
    // * Not yet implemented
    // */
    //this.rebootDevice = function() {
    //    throw new Error("Not yet implemented");
    //}
    //
    ///**
    // * Not yet implemented
    // */
    //this.echo = function() {
    //    throw new Error("Not yet implemented");
    //}
    //
    ///**
    // * Not yet implemented
    // */
    //this.balance = function() {
    //    throw new Error("Not yet implemented");
    //}
    //
    ///**
    // * Not yet implemented
    // */
    //this.getCardData = function() {
    //    throw new Error("Not yet implemented");
    //}
}

/**
 * @private
 * @param value
 * @returns {boolean}
 */
function isInt(value) {
    var x;
    if (isNaN(value)) {
        return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
}


/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {boolean} success
 * @param {Object} [responseData]
 */

/**
 * A payment
 *
 * @typedef {Object} SaleRequest
 * @property {integer} amount - the amount of a sale, including tax
 * @property {integer} tipamount - the amount of a tip.  Added to the amount for the total.
 * @property {string} orderid - an id for this sale
 * @property {string} employeeid - the employee making this sale.
 */

/**
 * The response to a sale
 *
 * @typedef {Object} SaleResponse
 * @property {string} result - the result code for the transaction - "SUCCESS", "CANCEL"
 * @property {Payment} - the payment information
 * @property {Signature} - the signature, if present
 */

/**
 * The callback on a sale
 *
 * @callback saleRequestCallback
 * @param {boolean} success
 * @param {SaleResponse} [responseData]
 */

/**
 * @typedef {Object} Payment
 * @property {string} result - the result code for the transaction - "SUCCESS", "CANCEL"
 * @property {integer} [createdTime] - the time in milliseconds that the transaction successfully completed
 * @property {CardTransaction} [cardTransaction] - successful transaction information
 * @property {integer} [amount] - the amount of the transaction, including tax
 * @property {integer} [tipAmount] - added tip amount
 * @property {Object} [order] - order information. Ex: id - the order id
 * @property {Object} [employee] - employee information. Ex: id - the employee id
 */

/**
 * @typedef {Object} CardTransaction
 * @property {integer} authcode - the authorization code
 * @property {string} entryType - SWIPED, KEYED, VOICE, VAULTED, OFFLINE_SWIPED, OFFLINE_KEYED, EMV_CONTACT,
 *  EMV_CONTACTLESS, MSD_CONTACTLESS, PINPAD_MANUAL_ENTRY
 * @property {Object} extra - additional information on the transaction.  EX: cvmResult - "SIGNATURE"
 * @property {string} state - PENDING, CLOSED
 * @property {string} referenceId
 * @property {string} type - AUTH, PREAUTH, PREAUTHCAPTURE, ADJUST, VOID, VOIDRETURN, RETURN, REFUND,
 *  NAKEDREFUND, GETBALANCE, BATCHCLOSE, ACTIVATE, BALANCE_LOCK, LOAD, CASHOUT, CASHOUT_ACTIVE_STATUS,
 *  REDEMPTION, REDEMPTION_UNLOCK, RELOAD
 * @property {integer} transactionNo
 * @property {integer} last4 - the last 4 digits of the card
 * @property {string} cardType - VISA, MC, AMEX, DISCOVER, DINERS_CLUB, JCB, MAESTRO, SOLO, LASER,
 *  CHINA_UNION_PAY, CARTE_BLANCHE, UNKNOWN, GIFT_CARD, EBT
 *
 */

/**
 * @typedef {Object} Signature
 * @property {Stroke[]} strokes - the strokes of the signature.  A series of points representing a single contiguous
 *  line
 * @property {integer} height - the pixal height of the canvas area needed to correctly represent the signature
 * @property {integer} width - the pixal width of the canvas area needed to correctly represent the signature
 *
 */

/**
 * @typedef {Object} Stroke - A series of points representing a single contiguous line
 * @property {Point[]} points
 */

/**
 * @typedef {Object} Point
 * @property {integer} x - the x coordinate location of the point in pixals
 * @property {integer} y - the y coordinate location of the point in pixals
 */



