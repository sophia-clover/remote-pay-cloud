package com.clover.webhook;

/**
 * Interface that defines a single method to provide security/access tokens for rest calls based on a merchant
 *
 * Created by michaelhampton on 8/26/15.
 */
public interface AccessTokenService {

  /**
   *
   * @param merchantId a merchantId
   * @return a token that can be used in rest calls for this merchant, or null if no token could be obtained.
   */
  String getAccessToken(String merchantId);
}
