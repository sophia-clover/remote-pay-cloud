package com.clover.webhook;

import com.google.gson.Gson;



import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;

/**
 * Simple example of receiving web hook messages from Clover.
 * <p/>
 * <p/>
 * Created by michaelhampton on 8/21/15.
 */
public class WebHook extends javax.servlet.http.HttpServlet {

  private Gson gson = new Gson();

  /**
   * A set of handlers for web hook messages.
   */
  private HashSet<WebHookMessageHandler> messageHandlers = new HashSet<WebHookMessageHandler>();

  /**
   * Creates the hook with a simple handler that echoes the messages  received.
   */
  public WebHook() {
    addListener(new DefaultWebHookMessageHandler());
  }

  /**
   * Loads the init parameters for "cloverServer", "accessTokenDirectoryEnvVar" and "accessTokenFileName".
   *
   * The directory for the accessTokenFileName is obtained by getting the accessTokenDirectoryEnvVar and getting the
   * environment value for the KEY obtained from this init parameter.
   *
   * For example, in the web.xml:
   *  <init-param>
   *    <param-name>accessTokenDirectoryEnvVar</param-name>
   *    <param-value>OPENSHIFT_DATA_DIR</param-value>
   *  </init-param>
   *
   *  Then a call is made to get the value of the environment variable 'OPENSHIFT_DATA_DIR'
   *
   *  Once these values are obtained, a DetailedWebHookMessageHandler is created using the values for the server,
   *  and a new FileAccessTokenService that is built using the file pointed to by the values for
   *  "accessTokenDirectoryEnvVar" and "accessTokenFileName"
   *
   * @param config
   * @throws ServletException
   */
  public void init(ServletConfig config)
      throws ServletException {
    super.init(config);
    String cloverServer = config.getInitParameter("cloverServer");
    String accessTokenDirectoryEnvVar = config.getInitParameter("accessTokenDirectoryEnvVar"); // OPENSHIFT_DATA_DIR
    String accessTokenFileName = config.getInitParameter("accessTokenFileName");
    String fileName = System.getenv().get(accessTokenDirectoryEnvVar) + accessTokenFileName;

    File accessTokenFile = new File(fileName);

    AccessTokenService accessTokenService = new FileAccessTokenService(accessTokenFile);

    DetailedWebHookMessageHandler detailedWebHookMessageHandler =
        new DetailedWebHookMessageHandler(cloverServer, accessTokenService);
    addListener(detailedWebHookMessageHandler);
  }

  /**
   *
   * @param handler a listener
   */
  public void addListener(WebHookMessageHandler handler) {
    messageHandlers.add(handler);
  }

  /**
   *
   * @param handler a listener
   */
  public void removeListener(WebHookMessageHandler handler) {
    messageHandlers.remove(handler);
  }

  /**
   * Send events to the listeners
   * @param webHookEvent the event to pass on.
   */
  public void handleEvent(WebHookMessage webHookEvent) {
    for (WebHookMessageHandler handler : messageHandlers) {
      handler.handleEvent(webHookEvent);
    }
  }

  /**
   * Delegate to do post
   * @param request
   * @param response
   * @throws ServletException
   * @throws IOException
   */
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    doPost(request, response);
  }

  /**
   * Read in the passed content, parse the json content into a WebHookMessage, then call
   * com.clover.webhook.WebHook#handleEvent(com.clover.webhook.WebHookMessage).
   *
   * Writes the event to the response stream, which allows the calling system to see the
   * received message; however, the only requirement for the webhook ids to return 200 on success.
   *
   *
   * @param request
   * @param response
   * @throws ServletException
   * @throws IOException
   */
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    String payload = new String();
    // Read the contents of the raw POST data sent in the request and store it
    BufferedReader r = request.getReader();
    String line;
    while ((line = r.readLine()) != null) {
      payload = payload.concat(line + "\n");
    }
    r.close();
    payload = payload.trim();

    System.out.println("The payload was: '" + payload + "'");

    // Web hook messages are sent in json serialized format.  Deserialize the message to a static
    // type java object.
    WebHookMessage webHookEvent = gson.fromJson(payload, WebHookMessage.class);
    handleEvent(webHookEvent);

    // Dump the payload to the output stream.  This can help with debugging, but should not be used
    // in a real implementation.
    response.getWriter().write("The payload was: '" + payload + "'");
  }

  /**
   * A simple class to echo webhookmessage objects.
   */
  class DefaultWebHookMessageHandler implements WebHookMessageHandler {

    public void handleEvent(WebHookMessage webHookEvent) {
      // Print out some info from the static type.
      System.out.println("The application that sent the event was: '" + webHookEvent.getAppId() + "'");
      Iterator<String> keys = webHookEvent.getMerchants().keySet().iterator();
      while (keys.hasNext()) {
        String merchantId = keys.next();
        List<WebHookMessage.Update> updates = webHookEvent.getMerchants().get(merchantId);
        System.out.println("  updates for merchant: '" + merchantId + "'");
        for (int updateIndex = 0; updateIndex < updates.size(); updateIndex++) {
          WebHookMessage.Update update = updates.get(updateIndex);
          System.out.println("    update[" + updateIndex + "].objectId: '" + update.getObjectId() + "'");
          System.out.println("    update[" + updateIndex + "].type: '" + update.getType() + "'");
          System.out.println("    update[" + updateIndex + "].ts: '" + update.getTs() + "'");
        }
      }
    }
  }
}
