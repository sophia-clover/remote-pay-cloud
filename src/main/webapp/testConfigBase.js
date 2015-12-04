// The base clover configuration.
var exampleConfigurations =
{
    "sandbox_C030UQ53460719": {
        "clientId" : "3BZPZ6A6FQ8ZM",
        "oauthToken" : "73d0c70d-1dc2-21ef-66b3-220b2efdc4eb",
        "domain" : "https://sandbox.dev.clover.com/",
        "merchantId" : "VKYQ0RVGMYHRR",
        "deviceSerialId" : "C030UQ53460719"
    },
    "sandbox_booker_C030UQ53460719" : {
        "clientId" : "1VE8EKDBFSHKA",
        "oauthToken" : "211f96ae-2121-00e9-eb50-80995787fefa",
        "domain" : "https://sandbox.dev.clover.com/",
        "merchantId" : "D5PKQ077KW3CY",
        "deviceSerialId" : "C030UQ53460719"
    },
    "localhost_C030UQ50550081" : {
        "clientId" : "3RPTN642FHXTC",
        "oauthToken" : "be4ade2b-01aa-2603-823a-9915a30b8e59",
        "domain" : "http://192.168.1.123:9001/",
        "merchantId" : "BBFF8NBCXEMDT",
        "deviceSerialId" : "C030UQ50550081"
    },
    "localhost_C031UQ52340065" : {
        "clientId" : "930REZDGX0N8T",
        "oauthToken" : "98b9d13f-4339-86d3-7dae-9a16d540ee81",
        "domain" : "http://192.168.1.123:9001/",
        "merchantId" : "BBFF8NBCXEMDT",
        "deviceSerialId" : "C031UQ52340065"
    },
    "sandboxdev_C031UQ52340065" : {
        "clientId" : "3BZPZ6A6FQ8ZM",
        "oauthToken" : "98b9d13f-4339-86d3-7dae-9a16d540ee81",
        "domain" : "https://sandboxdev.dev.clover.com/",
        "merchantId" : "VKYQ0RVGMYHRR",
        "deviceSerialId" : "C031UQ52340065"
    },
    "localhost_C021UQ52340078" : {
        "clientId" : "3RPTN642FHXTC",
        "oauthToken" : "4628c1c1-b329-641b-03fd-4e90f3d1d8a0",
        "domain" : "http://192.168.1.123:9001/",
        "merchantId" : "BBFF8NBCXEMDT",
        "deviceSerialId" : "C021UQ52340078"
    },
    "localhost_sb_C021UQ52340078" : {
        "clientId" : "3BZPZ6A6FQ8ZM",
        "oauthToken" : "0dcb4444-fb6a-5b28-d42c-229b683cb037",
        "domain" : "http://192.168.1.123:9001/",
        "merchantId" : "VKYQ0RVGMYHRR",
        "deviceSerialId" : "C021UQ52340078"
    },
    "dev1_C031UQ52340045" : {
        "clientId" : "3RPTN642FHXTC",
        "oauthToken" : "f41035d0-43ee-771c-92a2-721195c00f6a",
        "domain" : "https://dev1.dev.clover.com/",
        "merchantId" : "BBFF8NBCXEMDT",
        "deviceSerialId" : "C031UQ52340045"
    },
    "dev1_C021UQ52340078" : {
        "clientId" : "3RPTN642FHXTC",
        "oauthToken" : "f41035d0-43ee-771c-92a2-721195c00f6a",
        "domain" : "https://dev1.dev.clover.com/",
        "merchantId" : "BBFF8NBCXEMDT",
        "deviceSerialId" : "C021UQ52340078"
    }
};
var defaultConfiguration = exampleConfigurations.localhost_C030UQ50550081;
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


