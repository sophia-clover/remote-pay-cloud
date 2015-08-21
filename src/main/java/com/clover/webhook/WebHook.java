package com.clover.webhook;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Date;

/**
 * Created by michaelhampton on 8/21/15.
 */
public class WebHook extends javax.servlet.http.HttpServlet {

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

    response.getWriter().write("The payload was: '" + payload + "'");
  }
}
