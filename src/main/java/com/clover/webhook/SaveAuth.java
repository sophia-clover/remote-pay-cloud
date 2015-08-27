package com.clover.webhook;

import com.google.gson.Gson;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

/**
 * Created by michaelhampton on 8/27/15.
 */
public class SaveAuth extends javax.servlet.http.HttpServlet {

  private Gson gson = new Gson();
  FileStore fileStore;

  /**
   * Loads the init parameters for "accessTokenDirectoryEnvVar" and "accessTokenFileName".
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
   * @param config
   * @throws ServletException
   */
  public void init(ServletConfig config)
      throws ServletException {
    super.init(config);
    String accessTokenDirectoryEnvVar = config.getInitParameter("accessTokenDirectoryEnvVar"); // OPENSHIFT_DATA_DIR
    String accessTokenFileName = config.getInitParameter("accessTokenFileName");
    String fileName = System.getenv().get(accessTokenDirectoryEnvVar) + accessTokenFileName;

    File accessTokenFile = new File(fileName);
    fileStore = new FileStore(accessTokenFile);
  }

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

    Map<String, String> map = new HashMap<String, String>();
    map = gson.fromJson(payload, map.getClass()); // format {"BBFF8NBCXEMDT":"16258cd4-3c1b-3b74-1170-37ebd36bb331"}
    Set<String> keys = map.keySet();
    for(String key : keys) {
      fileStore.addEntry(key, map.get(key));
    }
    response.getWriter().write(payload);
  }
}

