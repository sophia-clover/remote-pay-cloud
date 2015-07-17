//*********************************************
//
//*********************************************

/**
 * Simple class to use the xmlhttp interface
 *
 * @constructor
 */
function XmlHttpSupport() {
    this.xmlhttp = new XMLHttpRequest();


    this.setXmlHttpCallback = function(xmlhttp, onDataLoaded, onError) {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4)
                if (xmlhttp.status == 200) {
                    // alert("userInfo is " + xmlhttp.responseText );
                    var data = JSON.parse(xmlhttp.responseText);
                    // displayDevices(devices);
                    onDataLoaded(data);
                }
                else {
                    // console.log("error");
                    onError("status returned was not 200");
                }
        }
    }

    /**
     * Make the REST call to get the data
     */
    this.doXmlHttp = function(method, endpoint, onDataLoaded, onError) {
        this.setXmlHttpCallback(this.xmlhttp, onDataLoaded, onError);

        this.xmlhttp.open(method, endpoint, true);
        this.xmlhttp.send();
    }

    this.doXmlHttpSendJson = function(method, sendData, endpoint, onDataLoaded, onError, additionalHeaders) {
        this.setXmlHttpCallback(this.xmlhttp, onDataLoaded, onError);

        this.xmlhttp.open(method, endpoint, true);
        if(additionalHeaders) {
            for (var key in additionalHeaders){
                this.xmlhttp.setRequestHeader(key, additionalHeaders[key]);
            }
        }
        if (sendData) {
            this.xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            var sendDataStr = JSON.stringify(sendData);
            this.xmlhttp.send(sendDataStr);
        }
        else {
            this.xmlhttp.send();
        }
    }
    /**
     * Make the REST call to get the data
     */
    this.postData = function(endpoint, onDataLoaded, onError, sendData, additionalHeaders) {
        this.doXmlHttpSendJson("POST", sendData, endpoint, onDataLoaded, onError, additionalHeaders);
    }

    /**
     * Make the REST call to get the data
     */
    this.getData = function(endpoint, onDataLoaded, onError) {
        this.doXmlHttp("GET", endpoint, onDataLoaded, onError)
    }

    /**
     * Make the REST call to get the data
     */
    this.putData = function(endpoint, onDataLoaded, onError, sendData) {
        this.doXmlHttpSendJson("PUT", sendData, endpoint, onDataLoaded, onError);
    }
    /**
     * Make the REST call to get the data
     */
    this.deleteData = function(endpoint, onDataLoaded, onError) {
        this.doXmlHttp("DELETE", endpoint, onDataLoaded, onError)
    }
}
