
/**
 * Method of card entry
 * @constructor
 */
// com.clover.common2.payments.CardEntryMethods
function CardEntryMethods() {}

// CardEntryMethods.ICC_CONTACT =
CardEntryMethods.MAG_STRIPE = 1;
CardEntryMethods.ICC_CONTACT = 2;
CardEntryMethods.NFC_CONTACTLESS = 4;
CardEntryMethods.MANUAL = 8;

CardEntryMethods.ALL = (
    CardEntryMethods.ICC_CONTACT |
    CardEntryMethods.MAG_STRIPE |
    CardEntryMethods.NFC_CONTACTLESS |
    CardEntryMethods.MANUAL
);
