
/**
 * Utility to centralize endpoints.
 *
 * It might be a good idea to have a single hard endpoint defined in this file that loads the "real"
 * endpoints from the server.  That way the server could conceivably change them, and this would not
 * have to change.
 *
 * @param cloverOAuth - used to obtain the access token and the domain for building the endpoints. If
 *  we change this to load endpoints, the access token will still be needed, and the initial endpoint will
 *  still a domain/url to use as well.
 * @constructor - just does setup, no major funtionality.
 */
function Endpoints(cloverOAuth) {

    /**
     * The object that provides the access token and the configurtion with the domain.
     */
    this.cloverOAuth = cloverOAuth;

    /**
     *
     */
    this.getLineItemEndpoint = function(merchantId, orderId, lineItemId) {
        var variables = {};
        variables[Endpoints.MERCHANT_V3_KEY] = merchantId;
        variables[Endpoints.ORDER_ID_KEY] = orderId;
        variables[Endpoints.LINE_ITEM_ID_KEY] = lineItemId;
        variables[Endpoints.ACCESS_TOKEN_KEY] = this.cloverOAuth.getAccessToken();
        return this.cloverOAuth.configuration.domain +
            this.setVariables(Endpoints.LINE_ITEM_ID_PATH + Endpoints.ACCESS_TOKEN_SUFFIX, variables);
    }

    /**
     *
     */
    this.getOrderEndpoint = function(merchantId, orderId) {
        var variables = {};
        variables[Endpoints.MERCHANT_V3_KEY] = merchantId;
        variables[Endpoints.ORDER_ID_KEY] = orderId;
        variables[Endpoints.ACCESS_TOKEN_KEY] = this.cloverOAuth.getAccessToken();
        return this.cloverOAuth.configuration.domain +
            this.setVariables(Endpoints.ORDER_ID_PATH + Endpoints.ACCESS_TOKEN_SUFFIX, variables);
    }

    this.getDevicesEndpoint = function(merchantId) {
        var variables = {};
        variables[Endpoints.MERCHANT_V3_KEY] = merchantId;
        variables[Endpoints.ACCESS_TOKEN_KEY] = this.cloverOAuth.getAccessToken();
        return this.cloverOAuth.configuration.domain +
            this.setVariables(Endpoints.DEVICE_PATH + Endpoints.ACCESS_TOKEN_SUFFIX, variables);
    }

    // Build the endpoint to send the message tothe server to let the device know we want to talk to it.
    this.getAlertDeviceEndpoint = function(merchantId) {
        var variables = {};
        variables[Endpoints.MERCHANT_V3_KEY] = merchantId;
        variables[Endpoints.ACCESS_TOKEN_KEY] = this.cloverOAuth.getAccessToken();
        return this.cloverOAuth.configuration.domain +
            this.setVariables(Endpoints.REMOTE_PAY_PATH + Endpoints.ACCESS_TOKEN_SUFFIX, variables);
    }

    this.setVariables = function(template, variableMap) {
        for( var key in variableMap) {
            var bracedKey = new RegExp(this.escapeRegExp("{"+key+"}"),"g");

            template = template.replace(bracedKey, variableMap[key] );
        }
        return template;
    }

    this.escapeRegExp = function(stringToGoIntoTheRegex) {
        return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
}

/*
Definitions of the endpoint templates and keys are below.  They are relative.
 */
Endpoints.ACCESS_TOKEN_KEY = "axsTkn";
Endpoints.ACCESS_TOKEN_SUFFIX = "?access_token={"+Endpoints.ACCESS_TOKEN_KEY+"}";

Endpoints.ACCOUNT_V3_KEY = "acntId";
Endpoints.ACCOUNT_V3_PATH = "v3/accounts/{"+Endpoints.ACCOUNT_V3_KEY+"}";
Endpoints.DEVELOPER_V3_KEY = "dId";
Endpoints.DEVELOPER_V3_PATH = "v3/developers/{"+Endpoints.DEVELOPER_V3_KEY+"}";
Endpoints.RESELLER_V3_KEY = "rId";
Endpoints.RESELLER_V3_PATH = "v3/resellers/{"+Endpoints.RESELLER_V3_KEY+"}";

Endpoints.MERCHANT_V2_KEY = "mId";
Endpoints.MERCHANT_V2_PATH = "v2/merchant/{"+Endpoints.MERCHANT_V2_KEY +"}";
Endpoints.MERCHANT_V3_KEY = "mId";
Endpoints.MERCHANT_V3_PATH = "v3/merchants/{"+Endpoints.MERCHANT_V3_KEY +"}";
Endpoints.APPS_V3_KEY = "appId";
Endpoints.APPS_V3_PATH = "v3/apps/{"+Endpoints.APPS_V3_KEY+"}";

Endpoints.ORDER_PATH = Endpoints.MERCHANT_V3_PATH + "/orders";
Endpoints.ORDER_ID_KEY = "appId";
Endpoints.ORDER_ID_PATH = Endpoints.ORDER_PATH + "/{"+Endpoints.ORDER_ID_KEY+"}";

Endpoints.LINE_ITEM_PATH = Endpoints.ORDER_ID_PATH + "/line_items";
Endpoints.LINE_ITEM_ID_KEY = "lniId";
Endpoints.LINE_ITEM_ID_PATH = Endpoints.LINE_ITEM_PATH + "/{"+Endpoints.LINE_ITEM_ID_KEY+"}";

Endpoints.DEVICE_PATH = Endpoints.MERCHANT_V3_PATH + "/devices";
Endpoints.DEVICE_ID_KEY = "devId";
Endpoints.DEVICE_ID_PATH = Endpoints.DEVICE_PATH + "/{"+Endpoints.DEVICE_ID_KEY+"}";

Endpoints.REMOTE_PAY_PATH = Endpoints.MERCHANT_V2_PATH + "/remote_pay";
