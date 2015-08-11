Clover Cloud Web Socket Connection Web Application
====================================================
The purpose of this repository is to illustrate the communication of your web application to [Clover Mini](https://www.clover.com/pos-hardware/mini) to allow a merchant's customers to make payments: credit, debit, EMV contact and contactless (including Apple Pay), EBT, and more. This serves as a starting point for the JS SDK protocol integration library. Learn more about Clover integrations at [clover.com/integrations](https://www.clover.com/integrations).

This produces a runnable jar that will serve a web application. There are several prerequisites that must be set up for this to work:
- The web application is served by Jetty, so you need a JDK installed.
- The web application uses JavaScript WebSocket objects, so the browser you use must support WebSockets. See [WebSocket Browser Support](http://caniuse.com/#feat=websockets).
- To complete a transaction end-to-end, we recommend getting a [Clover Mini Dev Kit](http://cloverdevkit.com/collections/devkits/products/clover-mini-dev-kit).

## Create a Clover Application

1.  [Create a Clover developer account](https://docs.clover.com/build/#first-create-your-developer-account) if you do not already have one.
7.  After claiming your account, [create a web app](https://docs.clover.com/build/web-apps/#step-1-create-your-clover-web-app) on your developer dashboard. Make sure to expand the "Web App" 'App Type' section and enter the Site URL and [CORS domain](https://docs.clover.com/build/web-apps/cors/) of your app.
    
## Configure the Example Application    
    
1.  On the "Your Apps" page, find and copy the "App ID".  
2.  In the [src/CloverOAuth.js](src/main/webapp/src/CloverOAuth.js) file, replace the value of `config.clientId` with the value of your App ID.
2.  In the [src/CloverOAuth.js](src/main/webapp/src/CloverOAuth.js) file, ensure the value of `config.domain` is set to the URL of the Clover server.
       
       
Make sure the Cloud Pay Display app is installed for your merchant on your Clover device.
    
## Build and run the Example Application
    
You must have maven and a JDK installed.

Build the app:
```
mvn package
```
Run the app inside a jetty container:
```
java -jar target/dependency/jetty-runner.jar target/*.war
```

## Make a Transaction

###High Level API
To make a payment using the High Level Cloud API
####Create the Clover object.
```
var clover = new Clover(configuration);
```

There are several ways the Clover object can be configured. See the [Clover](https://rawgit.com/clover/remote-pay-cloud/master/src/main/webapp/docs/Clover.html)
documentation for details on the [CloverConfig](https://rawgit.com/clover/remote-pay-cloud/master/src/main/webapp/docs/global.html#CloverConfig)
object and how to set up your connection.

####Start communicating with the device
```
clover.initDeviceConnection();
```

####Tell the device to call your program when it is ready
```
clover.notifyWhenDeviceIsReady(makeASale);
```

####Have your program use the clover object
```
function makeASale() {
  clover.sale({"amount" : 12345, "tipAmount" : 123, "orderId" : "123456789012"}, mySaleResult);
}
```

```
function mySaleResult(success, saleResult) {
  // do something with the result
}
```


View our [documentation](https://rawgit.com/clover/remote-pay-cloud/master/src/main/webapp/docs/index.html) to see the 
details of the JS SDK protocol for showing order details, starting a transaction, and getting a payment response back 
from the Clover device.
