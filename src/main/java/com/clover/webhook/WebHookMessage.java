package com.clover.webhook;

import java.util.List;
import java.util.Map;

/**
 * Simple Bean representation of a web hook message
 *
 * Created by michaelhampton on 8/24/15.
 */
public class WebHookMessage {
  private String appId;   //The app ID that the webhook was set up for
  private Map<String, List<Update>> merchants; // Map of [“merchantId” -> List of updates]

  public String getVerificationCode() {
    return verificationCode;
  }

  public void setVerificationCode(String verificationCode) {
    this.verificationCode = verificationCode;
  }

  private String verificationCode;

  public String getAppId() {
    return appId;
  }

  public void setAppId(String appId) {
    this.appId = appId;
  }

  public Map<String, List<Update>> getMerchants() {
    return merchants;
  }

  public void setMerchants(Map<String, List<Update>> merchants) {
    this.merchants = merchants;
  }

  enum ObjectType{
    A, // Apps – When your app is installed, uninstalled, or the subscription is changed.
    C, // Customers – When customers are created or updated.
    I, // Inventory – When inventory items are created, updated, or deleted.
    O, // Orders – When orders are created, updated, or deleted.
    P, // Payments – When payments are created or updated.
    M  // Merchants – When merchant properties are changed, or new merchants are added.
  };

  enum UpdateType {
    CREATE,
    UPDATE,
    DELETE
  }

  public static class Update {
    private String objectId; // ObjectType:<Event Object ID>
    private UpdateType type;  // CREATE, UPDATE, or DELETE
    private String ts;  // The time in milliseconds of the update

    public String getObjectId() {
      return objectId;
    }

    public void setObjectId(String objectId) {
      this.objectId = objectId;
    }

    public UpdateType getType() {
      return type;
    }

    public void setType(UpdateType type) {
      this.type = type;
    }

    public String getTs() {
      return ts;
    }

    public void setTs(String ts) {
      this.ts = ts;
    }
  }
}


