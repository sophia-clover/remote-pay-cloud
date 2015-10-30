// The base clover configuration.
var exampleConfigurations =
{
    "sandbox": {
        "clientId" : "3RPTN642FHXTC",
        "oauthToken": "c109f2a0-7bff-ab14-2841-159ed9f01556",
        "domain": "https://sandbox.dev.clover.com/",
        "merchantId": "VKYQ0RVGMYHRR",
        "deviceSerialId": "C030UQ50550081"
    },
    "localhost" : {
        "clientId" : "3RPTN642FHXTC",
        "oauthToken" : "f41035d0-43ee-771c-92a2-721195c00f6a",
        "domain" : "http://192.168.1.123:9001/",
        "merchantId" : "BBFF8NBCXEMDT",
        "deviceSerialId" : "C031UQ52340065"
    },
    "dev1" : {
        "clientId" : "3RPTN642FHXTC",
        "oauthToken" : "f41035d0-43ee-771c-92a2-721195c00f6a",
        "domain" : "https://dev1.dev.clover.com/",
        "merchantId" : "BBFF8NBCXEMDT",
        "deviceSerialId" : "C030UQ50550081"
    },
    "dev1_C031UQ52340045" : {
        "clientId" : "3RPTN642FHXTC",
        "oauthToken" : "f41035d0-43ee-771c-92a2-721195c00f6a",
        "domain" : "https://dev1.dev.clover.com/",
        "merchantId" : "BBFF8NBCXEMDT",
        "deviceSerialId" : "C031UQ52340045"
    }
};
var defaultConfiguration = exampleConfigurations.dev1_C031UQ52340045;
function copyConfig() {
    return {
        "clientId" : defaultConfiguration.clientId,
        "oauthToken" : defaultConfiguration.oauthToken,
        "domain" : defaultConfiguration.domain,
        "merchantId" : defaultConfiguration.merchantId,
        "deviceSerialId" : defaultConfiguration.deviceSerialId
    };
}
var defaultLANconfig = {"deviceURL" : "ws://192.168.1.41:14285"};


