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
    },
    "stg1" : {
        "clientId" : "NWMR4BMTX22WA",
        "domain" : "https://stg1.dev.clover.com/",
        "configName" : "stg1"
    }
};
var defaultConfigurationName = "sandboxdev"
var defaultConfiguration = exampleConfigurations[defaultConfigurationName];

/**
 * An example of a custom handler for dealing with incomplete configuration.
 *
 * @param message
 * @param configuration
 * @param callback
 */
var exampleIncompleteConfigurationHandler = function (message, configuration, callback) {
    // If this is used to obtain the configuration information, then the
    // configuration should be updated, and then the 'initDeviceConnection'
    // should be called again to connect to the device.
    // Figure out what must be entered to make the configuration whole.

    if(confirm("The configuration is incomplete.\n" +
            "You will need to enter some information to continue.\n" +
            "One of the following sets of information must be completed for the examples to work.\n" +
            "Once completed, you may need to log in to Clover with your merchant account.\n" +
            "\n" +
            "There are " + Clover.minimalConfigurationPossibilities.length + " minimal option " +
            "sets to enter information.\n" +
            "You will need to complete one of the sets to continue.\n" +
            "\n" +
            "To continue with the examples, click 'OK', or cancel to abort the test.")) {

        this.configuration = configuration;
        if (!this.configuration) {
            this.configuration = {};
        }
        var configComplete = false;
        for (var configIdx = 0; configIdx < Clover.minimalConfigurationPossibilities.length; configIdx++) {
            var possibleConfig = Clover.minimalConfigurationPossibilities[configIdx];
            configComplete = false;

            var options = possibleConfig.map(function(a) {return a.name;});

            if(confirm("Option set #" + (configIdx+1) + ". To complete this set, you will to " +
                    "enter values for these options - " + options.join(', ') + ".\n" +
                    "\n" +
                    "To complete this option set, click 'OK', or cancel to see the next configuration option.")) {
                var configComplete = true;
                for (var itemIdx = 0; itemIdx < possibleConfig.length; itemIdx++) {
                    if (!this.configuration[possibleConfig[itemIdx]]) {
                        var value = prompt("Please enter a value for " + possibleConfig[itemIdx].description);
                        if (value) {
                            this.configuration[possibleConfig[itemIdx].name] = value;
                        } else {
                            configComplete = false;
                            break;
                        }
                    }
                }
            }
            if (configComplete) {
                break;
            }
        }
        this.initDeviceConnectionInternal(callback);
    } else {
        alert("Test aborted.")
    }
}

/**
 *
 * @param configuration
 * @returns {string}
 */
var exampleIncompleteConfigurationHandlerDIVBuilder = function (configuration) {
    if (!configuration) {
        configuration = {};
    }
    var content = "<p>The configuration is incomplete.<br/>" +
        "You will need to enter some information to continue.<br/>" +
        "One of the following sets of information must be completed for the examples to work.<br/>" +
        "Once completed, you may need to log in to Clover with your merchant account.<br/>" +
        "<br/>" +
        "There are " + Clover.minimalConfigurationPossibilities.length + " minimal option " +
        "sets to enter information.<br/>" +
        "You will need to complete one of the sets to continue.<br/>" +
        "</p>";

    for (var configIdx = 0; configIdx < Clover.minimalConfigurationPossibilities.length; configIdx++) {
        var possibleConfig = Clover.minimalConfigurationPossibilities[configIdx];

        var id_build = [];
        id_build.push("possibleConfig");
        id_build.push(""+configIdx);

        content += "<div id='"+id_build.join('_')+"' class='uiFeedback'>"
        content += "<strong>Option Set #" + (configIdx + 1) + "</strong><br/>"
        id_build.push("form");
        var form_id = id_build.join('_')
        content += "<form id='"+form_id+"'>"

        for (var itemIdx = 0; itemIdx < possibleConfig.length; itemIdx++) {
            var id_build_in = id_build.slice(0);
            id_build_in.push(possibleConfig[itemIdx].name);

            content += "<div id='"+id_build_in.join('_')+"'>";
            content += possibleConfig[itemIdx].name + ": "

            var value = configuration[possibleConfig[itemIdx].name];
            if(!value)value="";
            id_build_in.push("input");
            content += "<input type='text' name='"+possibleConfig[itemIdx].name+"' id='"+id_build_in.join('_')+"' value='"+value+"'/>";
            content += "<p>";
            content += possibleConfig[itemIdx].description;
            content += "</p>";
            content += "</div>";
        }
        content += "</form>";
        id_build.push("button");
        content += "<input type='button' value='Save this Configuration and reload' name='"+id_build.join('_')+"' id='"+id_build.join('_')+
            "' onclick='saveConfig(\"" + form_id + "\")'/>";
        content += "</div>";
    }
    return content;
}

function saveConfig(form_id) {
    var els=document.forms[form_id].elements;
    var l=els.length;
    var formData = {};
    for (var i=0; i<l; i++)
    {
        formData[els[i].name] = els[i].value;
    }
    Clover.writeConfigurationToCookie(formData, true)
    location.reload();
}

