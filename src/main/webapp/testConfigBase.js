/*
 This file contains configuration examples for the Clover object.
 */
var exampleConfigurations =
{
    "sandboxdev_C021UQ52340078" : {
        "clientId" : "3BZPZ6A6FQ8ZM",
        "oauthToken" : "f41035d0-ff33-8662-7ff2-3a6690e0ff14",
        "domain" : "https://sandboxdev.dev.clover.com/",
        "merchantId" : "VKYQ0RVGMYHRR",
        "deviceSerialId" : "C021UQ52340078"
    },
    "lan_1_49" : {
        "deviceURL" : "ws://192.168.1.49:14285"
    }
};
var defaultConfiguration = exampleConfigurations.sandboxdev_C021UQ52340078;
function copyConfig() {
    return {
        "clientId" : defaultConfiguration.clientId,
        "oauthToken" : defaultConfiguration.oauthToken,
        "domain" : defaultConfiguration.domain,
        "merchantId" : defaultConfiguration.merchantId,
        "deviceSerialId" : defaultConfiguration.deviceSerialId,
        "deviceURL" : defaultConfiguration["deviceURL"]
    };
}

