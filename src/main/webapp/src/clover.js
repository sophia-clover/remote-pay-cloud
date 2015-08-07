
/**
 * Clover API for external Systems
 *
 * @param {Object} device - the device that sends and receives messages
 * @constructor
 */
function Clover(device) {

    this.device = device;

    /**
     * Wire in automatic signature verification for now
     */
    this.device.on(LanMethod.VERIFY_SIGNATURE,
        function (message) {
            var payload = JSON.parse(message.payload);
            var payment = JSON.parse(payload.payment);
            device.sendSignatureVerified(payment);
        }
    );

    /**
     * Sale AKA purchase
     *
     * @param {SaleRequest} saleInfo - the information for the sale
     * @param {requestCallback} completionCallback - the callback that receives the sale completion information.  Two parameters
     *  will be passed to this function: if the payment succeeded, the first will be true, and the second will
     *  be the payment information;  if the payment failed, the first parameter will be false.  If set the responseData
     *  is a payment object.
     */
    this.sale = function(saleInfo, completionCallback) {
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

        //Wire in the handler for completion to be called once.
        this.device.once(LanMethod.FINISH_OK,
            function (message) {
                var payload = JSON.parse(message.payload);
                var payment = JSON.parse(payload.payment);
                completionCallback(true, payment);
            }
        );
        this.device.once(LanMethod.FINISH_CANCEL,
            function (message) {
                completionCallback(false, null);
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
    this.voidSale = function(payment, completionCallback) {

        // TODO: Add ACK callback to void.

        device.sendPaymentVoid(payment);
    }

    /**
     * Print an array of strings on the device
     *
     * @param {string[]} textLines - an array of strings to print
     */
    this.print = function(textLines) {
        device.sendPrintText(textLines);
    }

    /**
     * Not yet implemented
     */
    this.saleWithCashback = function() {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     */
    this.preAuth = function() {
        throw new Error("Not yet implemented");
    };
    /**
     * Not yet implemented
     */
    this.authorize = this.preAuth

    /**
     * Not yet implemented
     */
    this.adjustAuth = function() {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     */
    this.tipAdjust = function() {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     * @type {refund}
     */
    this.refund = function() {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     */
    this.manualRefund = function() {
        throw new Error("Not yet implemented");
    }
    /**
     * Not yet implemented
     */
    this.closeout = function() {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     */
    this.getSiteTotals = function() {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     */
    this.displayMessage = function() {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     */
    this.cancelTxn = function() {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     */
    this.rebootDevice = function() {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     */
    this.echo = function() {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     */
    this.printReceipt = function() {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     */
    this.balance = function() {
        throw new Error("Not yet implemented");
    }

    /**
     * Not yet implemented
     */
    this.getCardData = function() {
        throw new Error("Not yet implemented");
    }
}

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


