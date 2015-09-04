/**
 * Clover API for external Systems
 *
 * @param {CloverConfig} [configuration] - the device that sends and receives messages
 * @constructor
 */
function Clover(configuration) {

    this.device = new WebSocketDevice();
    this.device.messageBuilder = new RemoteMessageBuilder("com.clover.remote.protocol.lan");
    // Echo all messages sent and received.
    this.device.echoAllMessages = false;

    this.configuration = configuration;

    this.sale_payIntentTemplate = {
        "action": "com.clover.remote.protocol.action.START_REMOTE_PROTOCOL_PAY",
        "transactionType": "PAYMENT",
        // "transactionNo": 300010,
        "taxAmount": 0, // tax amount is included in the amount
        "cardEntryMethods": CardEntryMethods.ALL
    };

    this.refund_payIntentTemplate = {
        "action": "com.clover.remote.protocol.action.START_REMOTE_PROTOCOL_PAY",
        "transactionType": "CREDIT",
        // "transactionNo": 300010,
        "taxAmount": 0, // tax amount is included in the amount
        "cardEntryMethods": CardEntryMethods.ALL
    };

    //****************************************
    // Very useful for debugging
    //****************************************
    this.device.on(WebSocketDevice.ALL_MESSAGES,
        function (message) {
            if (message['type'] != 'PONG') {
                console.log(message);
            }
        }
    );

    /**
     * Closes the connection to the Clover device.
     */
    this.close = function () {
        if (this.device) {
            this.device.sendShutdown();
        }
    }


    /**
     * Called to initialize the device for communications.
     *
     *  The device connection is NOT made on completion of this call.  The device connection
     *  will be made once the WebSocketDevice.onopen is called.
     *
     *  If there is no active configuration, then this will try to load the configuration using
     *  Clover.loadPersistedConfiguration.  Once the deviceURL has been derived, an attempt will be made to persist
     *  the configuration using Clover.persistConfiguration.
     *
     *  If there is not enough configuration information to connect to the device, then Clover.incompleteConfiguration
     *  will be called.
     *
     * @param callBackOnDeviceReady - callback function called when the device is ready for operations.
     *  Adheres to error first paradigm.
     */
    this.initDeviceConnection = function (callBackOnDeviceReady) {
        if (callBackOnDeviceReady) {
            this.device.once(LanMethod.DISCOVERY_RESPONSE, function (message) {
                callBackOnDeviceReady(null, message)
            });
        }
        return this.initDeviceConnectionInternal(callBackOnDeviceReady);
    }
    /**
     * Called to initialize the device for communications.
     *
     *  The device connection is NOT made on completion of this call.  The device connection
     *  will be made once the WebSocketDevice.onopen is called.
     * @private
     * @param callBackOnDeviceReady - callback function called when the device is ready for operations.
     */
    this.initDeviceConnectionInternal = function (callBackOnDeviceReady) {
        // Check to see if we have any configuration at all.
        if (!this.configuration) {
            if (!this.loadPersistedConfiguration(callBackOnDeviceReady)) {
                return;
            }
            this.initDeviceConnectionInternal(callBackOnDeviceReady);
        } else if (this.configuration.deviceURL) {
            // We have enough information to contact the device.
            // save the configuration (except for the device url, which always changes)
            // in a cookie.
            this.persistConfiguration();

            // We have the device url, contact the device
            this.contactDevice();
        } else {
            // Otherwise we must have the oauth token to get the information we need at the very least.
            // Either we already have it...
            if (this.configuration.oauthToken) {
                // We need the access token, the domain and the merchantId in order to get the devices
                // We already know that we have the token, but we need to check for the
                // domain and merchantId.
                if (this.configuration.domain && this.configuration.merchantId) {
                    // We need the device id of the device we will contact.
                    // Either we have it...
                    var xmlHttpSupport = new XmlHttpSupport();
                    var inlineEndpointConfig = {"configuration": {}};
                    var me = this;
                    inlineEndpointConfig.getAccessToken = function () {
                        return me.configuration.oauthToken;
                    };
                    inlineEndpointConfig.configuration.domain = this.configuration.domain;
                    var endpoints = new Endpoints(inlineEndpointConfig);

                    if (this.configuration.deviceId) {
                        var noDashesDeviceId = this.configuration.deviceId.replace(/-/g, "");
                        // this is the uuid for the device
                        var xmlHttpSupport = new XmlHttpSupport();
                        // This is the data posted to tell the server we want to create a connection
                        // to the device
                        var deviceContactInfo = {
                            deviceId: noDashesDeviceId,
                            isSilent: true
                        };

                        xmlHttpSupport.postData(endpoints.getAlertDeviceEndpoint(this.configuration.merchantId),
                            function (data) {
                                // The format of the data received is:
                                //{
                                //    'sent': true | false,
                                //    'host': web_socket_host,
                                //    'token': token_to_link_to_the_device
                                //}
                                // Use this data to build the web socket url
                                // Note "!data.hasOwnProperty('sent')" is included to allow for
                                // backwards compatibility.  If the property is NOT included, then
                                // we will assume an earlier version of the protocol on the server,
                                // and assume that the notification WAS SENT.
                                if (!data.hasOwnProperty('sent') || data.sent) {
                                    var url = data.host + '/support/cs?token=' + data.token;
                                    me.device.messageBuilder = new RemoteMessageBuilder(
                                        "com.clover.remote.protocol.websocket");

                                    console.log("Server responded with information on how to contact device. " +
                                        "Opening communication channel...");

                                    // The response to this will be reflected in the device.onopen method (or on error),
                                    // That function will attempt the discovery.
                                    me.configuration.deviceURL = url;
                                    //recurse
                                    me.initDeviceConnectionInternal(callBackOnDeviceReady);
                                } else {
                                    // Should it retry?
                                    // If the callback is defined, call it.
                                    var message = "Device is not connected to push server, cannot create connection";
                                    if (callBackOnDeviceReady) {
                                        callBackOnDeviceReady(new CloverError(CloverError.DEVICE_OFFLINE,
                                            message));
                                    } else {
                                        console.log(message);
                                    }
                                }
                            },
                            function (error) {
                                // TODO: Might want to create a new CloverError here.
                                callBackOnDeviceReady(error);
                                if (callBackOnDeviceReady) {
                                    callBackOnDeviceReady(error);
                                } else {
                                    console.log(error);
                                }
                            }, deviceContactInfo
                        );

                    } else if (this.configuration.deviceSerialId) {
                        // or we need to go get it.  This is a little hard, because the merchant
                        // can have multiple devices.

                        // If there are multiple devices, we need to know which device the user wants
                        // to use.  They can pass the 'serial' number of the device, or a 0 - based index
                        // for the devices, which assumes they know what order the device list will be
                        // returned in.
                        var url = endpoints.getDevicesEndpoint(this.configuration.merchantId);

                        xmlHttpSupport.getData(url,
                            function (devices) {
                                me.handleDevices(devices);
                                // Stations do not support the kiosk/pay display.
                                // If the user has selected one, then print out a (loud) warning
                                if (me.deviceBySerial[me.configuration.deviceSerialId].model == "Clover_C100") {
                                    console.log(
                                        "Warning - Selected device model (" +
                                        me.deviceBySerial[me.configuration.deviceSerialId].model +
                                        ") does not support cloud pay display." +
                                        "  Will attempt to send notification to device, but no response" +
                                        " should be expected.");
                                }
                                // serial' number of the device
                                me.configuration.deviceId =
                                    me.deviceBySerial[me.configuration.deviceSerialId].id;
                                // recurse
                                me.initDeviceConnectionInternal(callBackOnDeviceReady);
                            }
                            , callBackOnDeviceReady
                        );
                    } else {
                        //Nothing left to try.  Either error out or get more info from the user.
                        this.incompleteConfiguration("Cannot determine what device to use for connection." +
                            "  You must provide the configuration.deviceId, or the serial number" +
                            " of the device. " +
                            " You can find the device serial number using the device. Select " +
                            "'Settings > About (Station|Mini|Mobile) > Status', select 'Status' and " +
                            "look for 'Serial number' in the list displayed.", this.configuration,
                            callBackOnDeviceReady);
                        return;

                    }
                } else {
                    // We do not have enough info to initialize.  Error out
                    this.incompleteConfiguration("Incomplete init info.", this.configuration,
                        callBackOnDeviceReady);
                    return;
                }
            } else {
                // or we need to go get it.
                // If we need to go get it, then we will need the clientId
                // and the domain
                if (this.configuration.clientId && this.configuration.domain) {
                    this.cloverOAuth = new CloverOAuth(this.configuration);
                    // This may cause a redirect
                    this.configuration.oauthToken = this.cloverOAuth.getAccessToken();
                    // recurse
                    this.initDeviceConnectionInternal(callBackOnDeviceReady);
                }
            }
        }
    }

    /**
     * Loads the configuration that was stored.  This implementation just grabs the
     * configuration from a cookie.
     *
     * @param callback - the error first callback that will be passed to Clover.incompleteConfiguration
     *  if no configuration could be loaded.
     * @returns {boolean} true if the configuration was loaded.
     */
    this.loadPersistedConfiguration = function (callback) {
        // We have no configuration at all.  Try to get it from a cookie
        if (!this.configurationName)this.configurationName = "CLOVER_DEFAULT";
        this.configuration = Clover.loadConfigurationFromCookie(this.configurationName);
        if (!this.configuration) {
            // fire up a gui to get the values?
            // This could be some server call back or other too.
            this.incompleteConfiguration("No initialization info found in cookie", this.configuration, callback);
            return false;
        }
        return true;
    }

    /**
     * Stores the configuration for later retrieval.  This implementation just drops the
     * configuration into a cookie.
     */
    this.persistConfiguration = function () {
        Clover.writeConfigurationToCookie(this.configuration);
    }


    /**
     * We can override this to pop up a window to let the user enter any missing information.
     *
     * @param {string} message - an error message.  This could be ignored.
     * @param {CloverConfig} [configuration] - the configuration that is incomplete.
     * @param callback - the error first callback.  If defined, then it will be called with
     *  the first parameter as a CloverError.  If not defined, then the CloverError will be thrown.
     */
    this.incompleteConfiguration = function (message, configuration, callback) {
        // If this is used to obtain the configuration information, then the
        // configuration should be updated, and then the 'initDeviceConnection'
        // should be called again to connect to the device.
        var error = new CloverError(CloverError.INCOMPLETE_CONFIGURATION, message);
        if (callback) {
            callback(error);
        } else {
            throw error;
        }
    }

    /**
     * Handle a set of devices.  Sets up an internal map of devices from serial->device
     * @private
     * @param devicesVX
     */
    this.handleDevices = function (devicesVX) {
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
        var i;
        for (i = 0; i < devices.length; i++) {
            this.deviceBySerial[devices[i].serial] = devices[i];
        }
    }

    /**
     * Contacts the device.  Sends DISCOVERY_REQUEST messages for a period of time until a response is received.
     * Currently set to retry 10 times at 3 second intervals
     *
     * @private
     */
    this.contactDevice = function () {
        var me = this;

        this.device.on(LanMethod.DISCOVERY_RESPONSE,
            function (message) {
                // This id is set when the discovery request is sent when the device 'onopen' is called.
                clearInterval(me.device.discoveryTimerId);
                console.log("Device has responded to discovery message.");
                console.log(message);
            }
        );

        this.device.onopen = function () {
            // The connection to the device is open, but we do not yet know if there is anyone at the other end.
            // Send discovery request messages until we get a discovery response.
            me.device.dicoveryMessagesSent = 0;
            me.device.discoveryTimerId =
                setInterval(
                    function () {
                        console.log("Sending 'discovery' message to device.");
                        me.device.sendMessage(me.device.messageBuilder.buildDiscoveryRequest());
                        me.device.dicoveryMessagesSent++;

                        // Arbitrary decision that 10 messages is long enough to wait.
                        if (me.device.dicoveryMessagesSent > 10) {
                            console.log("Something is wrong.  we are getting pong messages, but no discovery response." +
                                "  Shutting down the connection.");
                            me.device.disconnectFromDevice();
                            clearInterval(me.device.discoveryTimerId);
                        }
                    }, 3000
                );
            console.log('device opened');
            console.log("Communication channel open.");
        }
        console.log("Contacting device at " + this.configuration.deviceURL);
        this.device.contactDevice(this.configuration.deviceURL);
    }

    /**
     * Can be used to manually set a function to be called one time when the device gets a DISCOVERY_RESPONSE.
     * @param tellMeWhenDeviceIsReady - callback function called when the device is ready for operations.
     */
    this.notifyWhenDeviceIsReady = function (tellMeWhenDeviceIsReady) {
        this.device.once(LanMethod.DISCOVERY_RESPONSE, tellMeWhenDeviceIsReady);
    }

    /**
     * Sale AKA purchase
     *
     * @param {TransactionRequest} saleInfo - the information for the sale
     * @param {Clover~transactionRequestCallback} saleRequestCallback - the callback that receives the sale completion
     *  information.
     */
    this.sale = function (saleInfo, saleRequestCallback) {
        if (this.verifyValidAmount(saleInfo, saleRequestCallback)) {
            this.internalTx(saleInfo, saleRequestCallback, this.sale_payIntentTemplate, "payment");
        }
    }

    /**
     * Refund AKA credit
     *
     * @param {TransactionRequest} refundInfo - amount is refunded
     * @param {Clover~transactionRequestCallback} refundRequestCallback
     */
    this.refund = function (refundInfo, refundRequestCallback) {
        if (this.verifyValidAmount(refundInfo, refundRequestCallback)) {
            refundInfo.amount = Math.abs(refundInfo.amount) * -1;
            this.internalTx(refundInfo, refundRequestCallback, this.refund_payIntentTemplate, "credit");
        }
    }

    /**
     *
     * @private
     * @param txnInfo
     * @param errorFirstCallback
     * @returns {boolean}
     */
    this.verifyValidAmount = function (txnInfo, errorFirstCallback) {
        if (!txnInfo.hasOwnProperty("amount") || !isInt(txnInfo.amount) || (txnInfo.amount < 0)) {
            errorFirstCallback(CloverError.INVALID_DATA,
                new CloverError("paymentInfo must include 'amount',and  the value must be an integer with " +
                    "a value greater than 0"));
            return false;
        }
        return true;
    }

    /**
     * @private
     * @param {TransactionRequest} txnInfo
     * @param {Clover~transactionRequestCallback} txnRequestCallback
     * @param template
     */
    this.internalTx = function (txnInfo, txnRequestCallback, template, txnName) {
        // Use a template to start with
        var payIntent = template;
        // Do verification of parameters
        if (!txnInfo.hasOwnProperty("tipAmount")) {
            txnInfo["tipAmount"] = 0;
        } else if (!isInt(txnInfo.tipAmount)) {
            txnRequestCallback(new CloverError(CloverError.INVALID_DATA,
                "if paymentInfo has 'tipAmount', the value must be an integer"));
        }
        if (txnInfo.hasOwnProperty("employeeId")) {
            payIntent.employeeId = txnInfo.employeeId;
        }
        if (txnInfo.hasOwnProperty("orderId")) {
            payIntent.orderId = txnInfo.orderId;
        }
        payIntent.amount = txnInfo.amount;
        payIntent.tipAmount = txnInfo.tipAmount;

        // Reserve a reference to this object
        var me = this;
        // We will hold on to the signature since we are not showing it to the user.
        var signature = null;
        //Wire in the handler for completion to be called once.
        /**
         * Wire in automatic signature verification for now
         */
        this.device.once(LanMethod.VERIFY_SIGNATURE,
            function (message) {
                try {
                    var payload = JSON.parse(message.payload);
                    var payment = JSON.parse(payload.payment);
                    // Already an object...hmmm
                    signature = payload.signature;
                    me.device.sendSignatureVerified(payment);
                } catch (error) {
                    var cloverError = new CloverError(LanMethod.VERIFY_SIGNATURE,
                        "Failure attempting to send signature verification", error);
                    txnRequestCallback(cloverError, {
                        "code": "ERROR",
                        "signature": signature,
                        "request": txnInfo
                    });
                }
            }
        );
        this.device.once(LanMethod.FINISH_OK,
            function (message) {
                var payload = JSON.parse(message.payload);
                var txnInfo = JSON.parse(payload[txnName]);//payment, credit
                var callBackPayload = {};
                callBackPayload.request = payIntent;
                callBackPayload[txnName] = txnInfo;
                callBackPayload.signature = signature;
                callBackPayload.code = txnInfo.result;

                txnRequestCallback(null, callBackPayload);
                me.device.sendShowWelcomeScreen();
            }
        );
        this.device.once(LanMethod.FINISH_CANCEL,
            function (message) {
                var callBackPayload = {};
                callBackPayload.request = payIntent;
                callBackPayload.signature = signature;
                callBackPayload.code = "CANCEL";
                txnRequestCallback(null, callBackPayload);
                me.device.sendShowWelcomeScreen();
            }
        );
        try {
            this.device.sendTXStart(payIntent);
        } catch (error) {
            var cloverError = new CloverError(LanMethod.TX_START,
                "Failure attempting to send start transaction", error);
            txnRequestCallback(cloverError, {
                "code": "ERROR",
                "request": txnInfo
            });
        }

    }

    /**
     *
     * @param {Payment} payment - the payment information returned from a call to 'sale'
     * @param {requestCallback} completionCallback
     */
    this.voidTransaction = function (payment, completionCallback) {
        // TODO: Add ACK callback
        this.device.sendPaymentVoid(payment);
    }

    /**
     * Print an array of strings on the device
     *
     * @param {string[]} textLines - an array of strings to print
     */
    this.print = function (textLines, completionCallback) {
        // TODO: Add ACK callback
        device.sendPrintText(textLines);
    }

    /**
     * Not yet implemented
     */
    this.printReceipt = function (completionCallback) {
        completionCallback(new CloverError(CloverError.NOT_IMPLEMENTED, "Not yet implemented"));
    }

    /**
     * Prints an image on the receipt printer of the device.
     *
     * The size of the image should be limited, and the optimal
     * width of the image is 384 pixals.
     *
     * @param img an HTML DOM IMG object.
     */
    this.printImage = function (img, completionCallback) {
        // TODO: Add ACK callback
        this.device.sendPrintImage(img);
    }

    /**
     * Not yet implemented
     */
    this.saleWithCashback = function (saleInfo, saleRequestCallback) {
        completionCallback(new CloverError(CloverError.NOT_IMPLEMENTED, "Not yet implemented"));
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

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

Clover.writeConfigurationToCookie = function (configuration) {
    var cvalue = JSON.stringify(configuration);
    var jsonValue = JSON.parse(cvalue);
    delete jsonValue.deviceURL;
    cvalue = JSON.stringify(jsonValue);

    var exdays = 2;
    if (!this.configurationName)this.configurationName = "CLOVER_DEFAULT";
    setCookie(this.configurationName, cvalue, exdays);
}

Clover.loadConfigurationFromCookie = function (configurationName) {
    // We have no configuration at all.  Try to get it from a cookie
    var configuration = null;
    var cvalue = getCookie(configurationName);
    if (cvalue) {
        configuration = JSON.parse(cvalue);
    }
    return configuration;
}


/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.  This type
 * of callback adheres to the Node.js convention of 'Error-first' callbacks.
 * @see http://fredkschott.com/post/2014/03/understanding-error-first-callbacks-in-node-js/
 *
 * The first argument of the callback is always reserved for an error object.
 * On a successful response, the ‘err’ argument is null. Call the callback and include the successful data only.
 *
 * On an unsuccessful response, the ‘err’ argument is set. Call the callback with an actual error object. The
 * error should describe what happened and include enough information to tell the callback what went wrong. Data
 * can still be returned in the other arguments as well, but generally the error is passed alone.
 *
 * @callback requestCallback
 * @param {Error} [error] - null iff there was no error, else an object that contains a code and a message text
 * @param {Object} [result] - data that results from the function.  This is a hash of information.  There will be a
 *  code within the object that indicates the operation completion status.  This may be null, depending on the
 *  nature of the call, and the error state.
 */

/**
 * A payment
 *
 * @typedef {Object} TransactionRequest
 * @property {integer} amount - the amount of a sale or refund, including tax
 * @property {integer} [tipAmount] - the amount of a tip.  Added to the amount for the total.  Valid for sale operations
 * @property {string} [orderId] - an id for this sale or refund
 * @property {string} [employeeId] - the valid Clover id of an employee recognized by the device.  Represents the
 *  employee making this sale or refund.
 */

/**
 * The response to a sale
 *
 * @typedef {Object} TransactionResponse
 * @property {string} code - the result code for the transaction - "SUCCESS", "CANCEL", "ERROR"
 * @property {Payment} payment - the payment information
 * @property {Credit} credit - the payment information
 * @property {Signature} [signature] - the signature, if present
 * @property {TransactionRequest} [request] - the request that resulted in this response
 */

/**
 * The callback on a sale
 *
 * @callback Clover~transactionRequestCallback
 * @param {Error} [error] - null iff there was no error, else an object that contains a code and a message text
 * @param {TransactionResponse} result - data that results from the function.
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
 * @typedef {Object} Credit
 * @property {integer} [amount] - the amount of the transaction, including tax
 * @property {integer} [createdTime] - the time in milliseconds that the transaction successfully completed
 * @property {Tender} [tender] - refund information
 * @property {Object} [orderRef] - order information. Ex: id - the order id
 * @property {Object} [employee] - employee information. Ex: id - the employee id
 * @property {CardTransaction} [cardTransaction] - successful transaction information
 */

/**
 * @typedef {Object} Tender
 * @property {string} id - the tender id
 * @property {string} label - the label that describes the tender
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


/**
 * The configuration for the Clover api object.  This encapsulates the different ways that the Clover object can
 * be configured for proper access to the device.
 *
 * <p>
 *     Possible configurations:<br/>
 *     <ol>
 *          <li>deviceURL (Only valid when device is in Local Pay Display app configuration)</li>
 *          <li>oauthToken, domain, merchantId, deviceSerialId</li>
 *          <li>clientId, domain, merchantId, deviceId (Requires log in to Clover server)</li>
 *          <li>clientId, domain, merchantId, deviceSerialId (Requires log in to Clover server)</li>
 *     </ol>
 * </p>
 *
 * @typedef CloverConfig
 * @property {string} [deviceURL] - the web socket url to use when connecting to the device.  Optional
 *  if other configuration values allow this to be obtained.
 * @property {string} [oauthToken] - the authentication token used when communicating with the clover cos
 *  server.  Required if deviceURL is not set. Optional if other configuration values allow this
 *  to be obtained.
 * @property {string} [domain] - the url to the clover cos server.
 * @property {string} [merchantId] - the merchant id.
 * @property {string} [deviceSerialId] - the serial id of the device to use.
 * @property {string} [clientId] - the Clover application id to use when obtaining the oauth token.
 *
 */
