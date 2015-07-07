/**
 * Create/obtain a new id.
 */
function getNewId() {
// Can we just generate this or does it have to come from the server?
// Appears that we do this...how do I gen an id in this odd format?  the Java method
// com.clover.base.Ids#nextBase32Id is used on the server, but it seems a bit involved, why
// was this done? What was wrong with standard uuids?
//         01234567890123
// return "NA6NW8ZPGXAFP";

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

