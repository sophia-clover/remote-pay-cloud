Clover Cloud Web Socket Connection Web Application
====================================================
This produces a runnable jar that will serve a web application.  The purpose of this repository is to
illustrate the communication to the device, and stand as a starting point for the protocol integration library.

There are several prerequisites that must be set up for this to work.

The web application is served by Jetty, so you need a JDK installed.

The web application uses javascript WebSocket objects, so the browser you use must support WebSockets. 

[WebSocket Browser Support](http://caniuse.com/#feat=websockets)

## Create a Clover Application

1.  If you do not have an account, create one.
    3.  Go to the server main page http://192.168.0.52:9001/
    4.  Click the "Developers" link at the top of the page.
    5.  Enter an email, click [Create Account]
        *  Note:  If running a local server (DEV environment) you will need to monitor the server logs and find the link to 
        activate your account.  It will be similar to 
        http://192.168.0.52:9001/claim/?email=mike2%40clover.com&claimCode=2ffb0713-c7dd-4cdd-810f-d542210a8791&isDeveloper=true
        Put the link into a browser and fill out the form that comes up.
    6.  You must have a Merchant Gateway for you merchant.  If you don't have one set one up.
        1.  Connect to your local mysql instance and create a new record in the merchant_gateway table using your own 
        merchant id.  You can find this id in the merchant table - it is the id column for your merchant.  
```
select id, name from merchant where name like '%Mike%'
```

This example uses merchant id 1520.

```
insert into merchant_gateway 
(
	merchant_id, 
	payment_processor_id, 
	processor_key_id, 
	stan, 
	config, 
	new_batch_close_enabled
) 
values (
	1520,
	3,
	4,
	0,
	'{"tid":"00000003","mid":"RCTST0000005045","group_id":"10001","token_type":"1174","tcc":"12","supports_tipping":"true","supports_preauth":"true","supports_bulkcapture":"false","cardTypes":["AMEX","MASTERCARD","VISA","DISCOVER"]}',
	false
)
```
Get the id for the record you just created
```
select id from merchant_gateway where merchant_id = 1520
```
Set this id on your merchant record, for my merchant, the result of the above was 1172
```
update merchant set merchant_gateway_id = 1172 where id = 1520
```
6.  Log on to the clover server.
7.  Click [Create New App]
    8.  Give your app a name and click [Create]
    9.  Expand the "Web App" 'App Type' section
    1.  Enter the site url of your app (EX:  http://192.168.0.51:8080)
    2.  Enter the CORS domain as the same as your app (EX:  http://192.168.0.51:8080)
    3.  Select an App Icon
    4.  Enter a tagline.
    4.  Enter a description.
    6.  Select a picture for the screenshot
    7.  Under 'Modules' select each item.
    8.  Under 'Permissions' select each items 'Read' checkbox, and 'Write' checkbox
    9.  Under 'Availability' check each item.
    1.  Under 'Legal & Privacy' enter a url for your site. (EX:  http://192.168.0.51:8080)
    2.  Select [Save]
    
## Configure the Example Application    
    
1.  On the "Your Apps" page, find the "App ID:", and copy it.  
2.  In the src/CloverOAuth.js file, replace the value of config.clientId with the value of your new App ID.
2.  In the src/CloverOAuth.js file, ensure the value of config.domain is set to the url of the clover server.
        
Add items to your merchant using the inventory app.    

Get an inventory item for your merchant
```
select * from item where merchant_id = 1609
```
And fix the getLineItem() in index.html
    
Get the tax rate id for your merchant
```
select * from tax_rate where merchant_id = 1609
```
And fix the getTaxRate() in index.html

Get your employee info
```
select * from account order by id desc
```
and fix getEmployee();

***Working on this...***

Make sure the web socket app is installed for your merchant on your device.

Use the following to install on the device
```
cd /Users/michaelhampton/code/apps/remote-pay/remote-pay/remote-protocol-websocket
```
Increment the version (10 to 11, etc) in both the 3rd argument and in the version
```
gradle -PversionCode=10 assembleReleaseSigned
~/code/apps/android-build/deploy/deploy_app.sh -s true com.clover.remote.protocol.websocket 10 ./build/outputs/apk/com.clover.remote.protocol.websocket-1.0-10-releaseSigned.apk
adb install /Users/michaelhampton/Downloads/com.clover.remote.protocol.websocket-10.apk
```
    
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