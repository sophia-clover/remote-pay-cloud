package com.clover.webhook;

import java.io.File;
import java.util.Map;

/**
 * Provides access tokens for merchants based on a file that contains a simple json mapping.
 *
 * If the passed file does not exist, one will be written, with a single entry.
 *
 * Created by michaelhampton on 8/26/15.
 */
public class FileAccessTokenService implements AccessTokenService {

  private FileStore fileStore;

  public FileAccessTokenService(File file) {
    fileStore = new FileStore(file);
  }

  public String getAccessToken(String merchantId) {
    Map<String, String> map = fileStore.read();

    if (null != map) {
      return map.get(merchantId);
    }
    return null;
  }
}
