package com.clover.webhook;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Class used to handle detailed webhook information.
 *
 * It calls rest services with the information passed in each webhook event.  It requires a class
 * that will provide access tokens for merchants.
 *
 * Created by michaelhampton on 8/26/15.
 */
public class DetailedWebHookMessageHandler implements WebHookMessageHandler {

  /**
   * Replacement key for the server that will be used in rest calls
   */
  public static final String SERVER_KEY = "server";
  /**
   * Replacement key for the access token that will be used in rest calls
   */
  public static final String ACCESS_TKN_KEY = "access_token";

  /*
   * Replacement keys for the object types that will be used in rest calls
   */
  public static final String APP_KEY = "aId";
  public static final String CUSTOMER_KEY = "customerId";
  public static final String ITEM_KEY = "itemId";
  public static final String ORDER_KEY = "orderId";
  public static final String PAYMENT_KEY = "payId";
  public static final String MERCHANT_KEY = "mId";

  /*
   *REST Url templaates for the rest calls.
   * @see https://www.clover.com/api_docs
   */
  public static final String V3_GET_APP_BILLING_INFO =
      "{" + SERVER_KEY + "}/v3/apps/{"+APP_KEY+"}/merchants/{" + MERCHANT_KEY + "}/billing_info?access_token={" + ACCESS_TKN_KEY + "}";
  public static final String V3_GET_CUSTOMER =
      "{" + SERVER_KEY + "}/v3/merchants/{" + MERCHANT_KEY + "}/customers/{"+CUSTOMER_KEY + "}?access_token={" + ACCESS_TKN_KEY + "}";
  public static final String V3_GET_INVENTORY_ITEM =
      "{" + SERVER_KEY + "}/v3/merchants/{" + MERCHANT_KEY + "}/items/{"+ITEM_KEY + "}?access_token={" + ACCESS_TKN_KEY + "}";
  public static final String V3_GET_SINGLE_ORDER =
      "{" + SERVER_KEY + "}/v3/merchants/{" + MERCHANT_KEY + "}/orders/{" + ORDER_KEY + "}?access_token={" + ACCESS_TKN_KEY + "}";
  public static final String V3_GET_PAYMENT =
      "{" + SERVER_KEY + "}/v3/merchants/{" + MERCHANT_KEY + "}/payments/{"+PAYMENT_KEY + "}?access_token={" + ACCESS_TKN_KEY + "}";
  public static final String V3_GET_MERCHANT =
      "{" + SERVER_KEY + "}/v3/merchants/{" + MERCHANT_KEY + "}?access_token={" + ACCESS_TKN_KEY + "}";

  /**
   * Access tokens are specific to the merchant and application.  This interface supplies an access token that is
   * valid given a merchant, or else it returns null.
   */
  AccessTokenService accessTokenService;

  /**
   * A mapping of the object types to the rest url templates
   */
  private static Map<WebHookMessage.ObjectType, String> urlTemplates =
      new HashMap<WebHookMessage.ObjectType, String>();
  /**
   * A mapping of the object types to the replacement variables used in the rest urls.
   */
  private static Map<WebHookMessage.ObjectType, String> objectTypeKeys =
      new HashMap<WebHookMessage.ObjectType, String>();

  /*
  Populate the static mappings.
   */
  static {
    urlTemplates.put(WebHookMessage.ObjectType.A, V3_GET_APP_BILLING_INFO);
    urlTemplates.put(WebHookMessage.ObjectType.C, V3_GET_CUSTOMER);
    urlTemplates.put(WebHookMessage.ObjectType.I, V3_GET_INVENTORY_ITEM);
    urlTemplates.put(WebHookMessage.ObjectType.O, V3_GET_SINGLE_ORDER);
    urlTemplates.put(WebHookMessage.ObjectType.P, V3_GET_PAYMENT);
    urlTemplates.put(WebHookMessage.ObjectType.M, V3_GET_MERCHANT);

    objectTypeKeys.put(WebHookMessage.ObjectType.A, APP_KEY);
    objectTypeKeys.put(WebHookMessage.ObjectType.C, CUSTOMER_KEY);
    objectTypeKeys.put(WebHookMessage.ObjectType.I, ITEM_KEY);
    objectTypeKeys.put(WebHookMessage.ObjectType.O, ORDER_KEY);
    objectTypeKeys.put(WebHookMessage.ObjectType.P, PAYMENT_KEY);
    objectTypeKeys.put(WebHookMessage.ObjectType.M, MERCHANT_KEY);
  }

  /**
   * A template map of variables used in replacements.  This contains the server variable, and
   * is the basis for a copied map that will have added variables based on what is contained in an event.
   */
  private Map<String, String> templateVariableMap = new HashMap<String, String>();

  /**
   * The format of the 'objectId' in the update message is <Key For Event Type>:<Event Object ID>,
   * these are indexes appropriately named, that are used when the value is split into two pieces.
   * The first piece is the object type, and corresponds to the com.clover.webhook.WebHookMessage.ObjectType enum.
   * The second will be the actual objectId.
   * @link https://docs.clover.com/build/web-apps/webhooks/?region=dev1
   */
  private int OBJECT_TYPE = 0;
  private int OBJECT_ID = 1;

  /**
   * Creates the webhook handler for dealing with webhook messages.
   *
   * @param server the string that represents the base server for rest calls - https://apidev1.dev.clover.com:443
   * @param accessTokenService the service used to look up security tokens by merchantId.
   */
  public DetailedWebHookMessageHandler(String server, AccessTokenService accessTokenService) {
    this.accessTokenService = accessTokenService;
    templateVariableMap.put(SERVER_KEY, server);// ex - https://apidev1.dev.clover.com:443
  }


  /**
   * Handles the webhook message.  This just displays detailed messages about the event,
   * using rest calls.
   *
   * @param webHookEvent
   */
  public void handleEvent(WebHookMessage webHookEvent) {
    // Iterate across merchants
    Map<String, List<WebHookMessage.Update>> merchants = webHookEvent.getMerchants();
    if (merchants != null) {
      Iterator<String> merchantIds = merchants.keySet().iterator();

      while (merchantIds.hasNext()) {
        // Make a copy of the template variable map so we can add to it without mucking with the template.
        Map<String, String> variableMap = new HashMap<String, String>(templateVariableMap);
        // Grab the merchantId
        String merchantId = merchantIds.next();

        // Try to get a access token for this merchant.  If we cannot get it, then we will not be able to make
        // rest calls
        String accessToken = accessTokenService.getAccessToken(merchantId);
        if (null != accessToken) {
          // Put the Access Token into the map for later replacement
          variableMap.put(ACCESS_TKN_KEY, accessToken);

          variableMap.put(MERCHANT_KEY, merchantId);
          // Get the merchant collection of updates
          List<WebHookMessage.Update> updates = webHookEvent.getMerchants().get(merchantId);
          for (int updateIndex = 0; updateIndex < updates.size(); updateIndex++) {
            WebHookMessage.Update update = updates.get(updateIndex);
            // Split the object spec int othe object type and the object id
            String[] objectSpec = update.getObjectId().split(":");
            // Get the type of the object
            WebHookMessage.ObjectType objectType = WebHookMessage.ObjectType.valueOf(objectSpec[OBJECT_TYPE]);
            // Get the object id
            String objectId = objectSpec[OBJECT_ID];
            // Get the replacement key for the object type and put it into the map
            String objectTypeKey = objectTypeKeys.get(objectType);
            // Put the object id int othe replacement map
            variableMap.put(objectTypeKey, objectId);
            // Grab the correct rest url based on the object type
            String urlTemplate = urlTemplates.get(objectType);
            if (null != urlTemplate) {
              // If we have the replacement url (we should), use the replacement map to set the values on it
              // and generate a concrete populated url.
              String restUrl = setVariables(urlTemplate, variableMap);
              // Call the rest service.
              try {
                String detailedData = callRest(restUrl);
                handleDetailedData(detailedData);
              } catch (IOException e) {
                e.printStackTrace();
              }
            }
          }
        } else {
          System.out.println("No access token found for merchant id = " + merchantId);
        }
      }
    }
  }

  /**
   * Do something with the detailed data retrieved from the rest service.
   * @param detailedData
   */
  protected void handleDetailedData(String detailedData) {
    System.out.println("    detailed data for the object: '" + detailedData + "'");
  }

  /**
   * Replaces values in the template string using the values from the passed map.
   * The keys are wrapped with braces {}, and then the value that corresponds to the
   * key is used in the replacement.
   *
   * @param template a template string that has some number of replacement variables denoted by braces
   * @param variableMap a map of keys to values.
   * @return a new string with the replacements made
   */
  private String setVariables(String template, Map<String, String> variableMap) {
    Set<String> keys = variableMap.keySet();
    for (String key : keys) {
      String bracedKey = "\\{" + key + "\\}";

      template = template.replaceAll(bracedKey, variableMap.get(key));
    }
    return template;
  }

  /**
   * Calls a rest service with the "GET" method and an ACCEPT header of application/json
   *
   * @param restUrl the url to call
   * @return the string returned by the call.
   * @throws IOException
   */
  private String callRest(String restUrl) throws IOException {
    URL url = new URL(restUrl);
    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
    conn.setRequestProperty("Accept", "application/json");
    conn.setRequestMethod("GET");

    // read the response
    System.out.println("Response Code: " + conn.getResponseCode());
    InputStream in = new BufferedInputStream(conn.getInputStream());
    String response = org.apache.commons.io.IOUtils.toString(in, "UTF-8");
    return (response);
  }
}
