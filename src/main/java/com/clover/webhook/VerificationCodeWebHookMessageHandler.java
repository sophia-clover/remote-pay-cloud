package com.clover.webhook;

/**
 * Created by michaelhampton on 1/20/16.
 */
public class VerificationCodeWebHookMessageHandler implements WebHookMessageHandler {
  public void handleEvent(WebHookMessage webHookEvent) {
    if(webHookEvent.getVerificationCode() != null) {
      System.out.println("Got Verification code! Enter this code in the clover system to verify " + webHookEvent.getVerificationCode());
    }
  }
}
