// The base clover configuration.
var exampleConfigurations =
{
    "production" : {
        "clientId" : "VYM6CYQ9GZRST",
        "domain" : "https://www.clover.com/",
        "configName" : "production"
    },
    "sandbox": {
        "clientId" : "TQCACCW9EDGX2",
        "domain" : "https://sandbox.dev.clover.com/",
        "configName" : "sandbox"
    },
    "dev1" : {
        "clientId" : "5FTA0E29EM826",
        "domain" : "https://dev1.dev.clover.com/",
        "configName" : "dev1"
    },
    "sandboxdev" : {
        "clientId" : "TQCACCW9EDGX2",
        "domain" : "https://sandboxdev.dev.clover.com/",
        "configName" : "sandboxdev"
    }
};
var defaultConfigurationName = "sandboxdev"
var defaultConfiguration = exampleConfigurations[defaultConfigurationName];
function copyConfig() {
    return {
        "clientId" : defaultConfiguration.clientId,
        "oauthToken" : defaultConfiguration.oauthToken,
        "domain" : defaultConfiguration.domain,
        "merchantId" : defaultConfiguration.merchantId,
        "deviceSerialId" : defaultConfiguration.deviceSerialId,
        "deviceURL" : defaultConfiguration["deviceURL"],
        "configName" : defaultConfiguration["configName"]
    };
}


