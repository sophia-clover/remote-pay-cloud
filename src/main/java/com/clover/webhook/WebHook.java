package com.clover.webhook;

import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
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

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    doPost(request, response);
  }

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

    // Dump the payload to the output stream.  This can help with debugging, but should not be used
    // in a real implementation.
    response.getWriter().write("The payload was: '" + payload + "'");
  }
}
