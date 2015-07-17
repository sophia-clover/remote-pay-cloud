Clover Cloud Web Socket Connection Web Application
====================================================

[Clover Cloud Connector JS Docs](https://rawgit.com/clover/remote-pay-cloud/master/src/main/webapp/docs/index.html)

This produces a runnable jar that will serve a web application.  The purpose of this repository is to
illustrate the communication to the device, and stand as a starting point for the protocol integration library.

There are several prerequisites that must be set up for this to work.

The web application is served by Jetty, so you need a JDK installed.

The web application uses javascript WebSocket objects, so the browser you use must support WebSockets. 

[WebSocket Browser Support](http://caniuse.com/#feat=websockets)

## Create a Clover Application

1.  If you do not have an account, create one.
    3.  Go to the server main page http://<clover server>/
    4.  Click the "Developers" link at the top of the page.
    5.  Enter an email, click [Create Account].
        You will get an email at this account to verify the registration.
    6.  You must have a Merchant Gateway for you merchant.  If you don't have one set one up.
6.  Log on to the clover server.
7.  Click [Create New App]
    8.  Give your app a name and click [Create]
    9.  Expand the "Web App" 'App Type' section
    1.  Enter the site url of your app (EX:  http://myserver/myapplication)
    2.  Enter the CORS domain as the same as your app (EX: http://myserver/myapplication)
    3.  Select an App Icon
    4.  Enter a tagline.
    4.  Enter a description.
    6.  Select a picture for the screenshot
    7.  Under 'Modules' select each item.
    8.  Under 'Permissions' select each items 'Read' checkbox, and 'Write' checkbox
    9.  Under 'Availability' check each item.
    1.  Under 'Legal & Privacy' enter a url for your site. (EX:  http://myserver/myapplication/legal_privacy.html)
    2.  Select [Save]
    
## Configure the Example Application    
    
1.  On the "Your Apps" page, find the "App ID:", and copy it.  
2.  In the src/CloverOAuth.js file, replace the value of config.clientId with the value of your new App ID.
2.  In the src/CloverOAuth.js file, ensure the value of config.domain is set to the url of the clover server.
       
       
Make sure the web socket app is installed for your merchant on your device.
    
## Build and run the Example Application
    
You must have maven and a JDK installed.

Build the app
```
mvn package
```
Run the app inside a jetty container
```
java -jar target/dependency/jetty-runner.jar target/*.war
```