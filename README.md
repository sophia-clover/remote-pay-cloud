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

### Webhook Example
If you want to use the embedded webhook example, you will need to run the example on a public facing web server.  You 
will need to run the example before you can perform the verification of the web hook. The default address of the webhook
in the example is ```http://<yourserver>/webhook```.  This can be changed by modifying the `web.xml` file.

There are two servlets that are used to demonstrate the webhook functionality.  The webhook servlet echoes the 
information sent to the hook.  It reads merchant authentication tokens from a file on the server running this example.
The second servlet will write merchant authentication tokens to the file.  There is a button on the min Cloud example 
that will allow you to send the current merchant authentication token to be written.

View our [Webhooks Developer Docs](https://docs.clover.com/build/web-apps/webhooks/?region=dev1) for details on how to configure and use webhooks.
    
## Configure the Example Application    
    
Make sure the Cloud Pay Display app is installed for your merchant on your Clover device.
For the main "Cloud Example", you will need the "App Id".  On the "Your Apps" page, find and copy the "App ID".

The "Simple" examples require information that can be obtained by running the "Cloud Example".              
    
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
