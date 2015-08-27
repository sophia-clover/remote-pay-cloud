package com.clover.webhook;

/**
 * Interface that defines a method fro handling webhookmessages
 *
 * Created by michaelhampton on 8/26/15.
 */

public interface WebHookMessageHandler {
  void handleEvent(WebHookMessage webHookEvent);
}