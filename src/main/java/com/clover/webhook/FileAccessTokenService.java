package com.clover.webhook;

import com.google.gson.Gson;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Provides access tokens for merchants based on a file that contains a simple json mapping.
 *
 * If the passed file does not exist, one will be written, with a single entry.
 *
 * Created by michaelhampton on 8/26/15.
 */
public class FileAccessTokenService implements AccessTokenService {

  private static Gson gson = new Gson();
  private File file;
  private Map<String, String> map;
  private long lastReadTime = 0;

  public FileAccessTokenService(File file) {
    this.file = file;

    if(!file.exists()) {

      // Write out one entry as an example, and save the file
      map = new HashMap<String, String>();
      map.put("BBFF8NBCXEMDT", "16258cd4-3c1b-3b74-1170-37ebd36bb331");
      String json = gson.toJson(map);

      FileOutputStream outputStream = null;
      try {
        outputStream = new FileOutputStream(file);
        org.apache.commons.io.IOUtils.write(json, outputStream);
      } catch (FileNotFoundException e) {
        e.printStackTrace();
      } catch (IOException e) {
        e.printStackTrace();
      } finally {
        if (null != outputStream) {
          try {
            outputStream.close();
          } catch (IOException e) {
            e.printStackTrace();
          }
        }
      }
    }
  }

  public String getAccessToken(String merchantId) {

    if(lastReadTime!=file.lastModified()) {
      System.out.println("Reading in file:" + file.getAbsolutePath() );
      lastReadTime = file.lastModified();
      InputStream in = null;
      try {
        in = new FileInputStream(file);
        String response = org.apache.commons.io.IOUtils.toString(in, "UTF-8");
        map = new HashMap<String, String>();
        map = gson.fromJson(response, map.getClass());
      } catch (FileNotFoundException e) {
        e.printStackTrace();
      } catch (IOException e) {
        e.printStackTrace();
      } finally {
        if (null != in) {
          try {
            in.close();
          } catch (IOException e) {
            e.printStackTrace();
          }
        }
      }
    }

    if (null != map) {
      return map.get(merchantId);
    }
    return null;
  }
}
