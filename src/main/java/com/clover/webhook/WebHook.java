package com.clover.webhook;

import com.google.gson.Gson;
import com.google.gson.JsonElement;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;

/**
 * Created by michaelhampton on 8/21/15.
 */
public class WebHook extends javax.servlet.http.HttpServlet {

  private Gson gson = new Gson();

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    doPost(request,response);
  }

  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    String payload = new String();
    // Read the contents of the raw POST data sent in the request and store it
    BufferedReader r = request.getReader();
    String line;
    while((line = r.readLine()) != null)
      payload = payload.concat(line + "\n");
    r.close();
    payload = payload.trim();

    System.out.println("The payload was: '" + payload + "'");

    WebHookMessage webHookEvent = gson.fromJson(payload, WebHookMessage.class);

    System.out.println("The application that sent the event was: '" + webHookEvent.getAppId() + "'");
    Iterator<String> keys =  webHookEvent.getMerchants().keySet().iterator();
    while( keys.hasNext() ) {
      String merchantId = keys.next();
      List<WebHookMessage.Update> updates = webHookEvent.getMerchants().get(merchantId);
      System.out.println("  updates for merchant: '" + merchantId + "'");
      for(int updateIndex=0;updateIndex<updates.size();updateIndex++) {
        WebHookMessage.Update update = updates.get(updateIndex);
        System.out.println("    update["+updateIndex+"].objectId: '" + update.getObjectId() + "'");
        System.out.println("    update["+updateIndex+"].type: '" + update.getType() + "'");
        System.out.println("    update["+updateIndex+"].ts: '" + update.getTs() + "'");
      }
    }
    response.getWriter().write("The payload was: '" + payload + "'");
  }
}
