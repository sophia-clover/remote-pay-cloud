/**
 * Create/obtain a new id.
 *
 * This is not guaranteed to generate unique ids!
 *
 * The set size is 32^12, so it is not likely that the ids will repeat,
 * but this is done with a random generator, so it is possible
 *
 */
function getNewId() {
    // http://www.crockford.com/wrmg/base32.html
    var BASE_32_DIGITS = [
        '0', '1', '2', '3', '4', '5',
        '6', '7', '8', '9', 'A', 'B',
        'C', 'D', 'E', 'F', 'G', 'H',
        'J', 'K', 'M', 'N', 'P', 'Q',
        'R', 'S', 'T', 'V', 'W', 'X',
        'Y', 'Z'
    ];

// Ok well, not the best, but...
    var id = "";
    for (var index = 0; index < 13; index++) {
        id += BASE_32_DIGITS[Math.floor(Math.random() * 32)];
    }
    return id;
}


function getNewTransactionNo() {
    // Not sure about whatthis can be.
    return Math.floor(Math.random() * 32000);
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}



