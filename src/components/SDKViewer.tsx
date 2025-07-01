
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { Copy, ExternalLink, Code2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const implementations = {
  nodejs: {
    name: 'Node.js',
    extension: '.js',
    badge: 'Node.js',
    color: 'bg-green-100 text-green-800',
    code: `const jwt = require("jsonwebtoken"); //For generating DMS jwt
const axios = require('axios'); //For making requests

class DMSClientChannel {
  /**
   * Private class config variables
   */
  #API_URL;
  #CHANNEL_ID;
  #JWT_SECRET;
  #LOGGING_ENABLED;

  constructor(config) {
    this.#API_URL = config.API_URL;
    this.#CHANNEL_ID = config.CHANNEL_ID;
    this.#JWT_SECRET = config.JWT_SECRET;
    this.#LOGGING_ENABLED = false; //set logging to false by default
  }

  /**
   * onTypingIndicator
   * Returns the customer id recieved from the dms event
   * @public
   */
  onTypingIndicator(customer_id) {}

  /**
   * onCsrEndSession
   * Returns the customer id recieved from the dms event
   * @public
   */
  onCsrEndSession(customer_id) {}

  /**
   * onTextMessage
   * Returns the message object recieved from the dms
   * @public
   */
  onTextMessage(message) {}

  /**
   * onMenuMessage
   * Returns the message object recieved from the dms
   * @public
   */
  onMenuMessage(message) {}

  /**
   * onCarouselMessage
   * Returns the message object recieved from the dms
   * @public
   */
  onCarouselMessage(message) {}

  /**
   * onUrlLinkMessage
   * Returns the message object recieved from the dms
   * @public
   */
  onUrlLinkMessage(message) {}

  /**
   * onWaitTime
   * Returns the wait time recieved from the dms event
   * @public
   */
  onWaitTime(message) {}

  /**
   * logRequests
   * Sets the logging logging status
   * @public
   * @param status {Boolean}
   */
  logRequests(status) {
    status ? (this.#LOGGING_ENABLED = true) : (this.#LOGGING_ENABLED = false);
  }

  /**
   * onRequest
   * @public
   * @param req
   * @param callback
   */
  onRequest(req, callback) {
    try {
      //Get the jwt from request
      let token = this.#getToken(req);

      //Check if jwt is valid
      let verified = this.#validateToken(token);

      //Console Logging
      if (this.#LOGGING_ENABLED) {
        let log_prefix = "onRequest - ";
        console.log(log_prefix + "Token", token);
        console.log(log_prefix + "verified", verified);
        console.log(log_prefix + "Message recieved from DMS:", req.body);
      }

      if (verified) {
        //Send a message to webex teams, microsoft teams, slack etc.
        this.#runMessageCallbacks(req.body);

        //Return 200 ok  status
        callback(200, "success");
        return;
      } else {
        //Return 403 forbidden. invalid request signature
        callback(403, "forbidden");
        return;
      }
    } catch (err) {
      callback(401, err);
      return;
    }
  }

  /**
   * returns the request token from a DMS http request
   * @private
   * @param req {Object}
   */
  #getToken(req) {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    )
      return req.headers.authorization.split(" ")[1];
    return null;
  }

  /**
   * Verifies a DMS request token using class instance configs.
   * Returns the boolean represeting the DMS token verification outcome status
   * @private
   * @param req_token
   */
  #validateToken(req_token) {
    //Return if there's no token
    if (!req_token) {
      console.log("No token in request");
      return false;
    }

    //Max age of token should be less than 5mins
    let options = {
      maxAge: 300, //300ms = 5mins
      algorithms: ["HS256"],
    };

    try {
      //Verify token
      const { iat, iss } = jwt.verify(req_token, this.#JWT_SECRET, options);

      //Console Logging
      if (this.#LOGGING_ENABLED) {
        let log_prefix = "validateToken - ";
        console.log(log_prefix + "iss: ", iss);
        console.log(log_prefix + "iat: ", iat);
        console.log(log_prefix + "channel id: ", this.#CHANNEL_ID);
      }

      if (iss === this.#CHANNEL_ID) {
        if (this.#LOGGING_ENABLED) {
          console.log("valid token - validateToken()");
        }
        return true;
      } else {
        if (this.#LOGGING_ENABLED) {
          console.log("invalid token - validateToken()");
        }
        return false;
      }
    } catch (err) {
      console.log("error - validateToken()", err);
      return false; //invalid token
    }
  }

  /**
   * @private
   * @param message
   */
  #runMessageCallbacks(message) {
    let callback = null;
    let callback_args = message; //set to message by default as it's used in most instances

    switch (message.type) {
      case "typing_indicator":
        callback = this.onTypingIndicator;
        callback_args = message.customer_id;
        break;
      case "csr_end_session":
        callback = this.onCsrEndSession;
        callback_args = message.customer_id;
        break;
      case "text":
        callback = this.onTextMessage;
        break;
      case "menu":
        callback = this.onMenuMessage;
        break;
      case "carousel":
        callback = this.onCarouselMessage;
        break;
      case "link_button":
        callback = this.onUrlLinkMessage;
        break;
      case "wait_time":
        callback = this.onWaitTime;
        break;

      default:
        return; // return if message type is not detected.
    }
    //Check if callback is a valid function and pass in args
    if (callback && typeof callback === "function") {
      callback(callback_args);
    }
  }

  /**
   * Calls the DMS message API
   * Sends a single text message to DMS
   * @public
   * @param customer_id {String}
   * @param message_id {String}
   * @param message_text {String}
   * @param customer_name {String}
   */
  sendTextMessage = async (
    customer_id,
    message_id,
    message_text,
    customer_name,
    callback
  ) => {
    let message = {
      type: "text",
      customer_id: customer_id,
      customer_name: customer_name,
      message_id: message_id,
      text: [message_text],
    };

    //Forward the formatted message to Digital Messageing.
    try {
      //Set request headers
      let options = this.#generateRequestOptions();

      //Make outbound call to Pega
      let response = await axios.post(this.#API_URL, message, options);

      //Console Logging
      if (this.#LOGGING_ENABLED) {
        let log_prefix = "sendTextMessage - ";
        console.log(log_prefix + "Request Headers: ", options);
        console.log(log_prefix + "Request Message: ", message);
        console.log(
          log_prefix + "DMS messaging API response: ",
          response.status
        );
      }

      //Check if callback is a valid function and pass in args
      if (callback && typeof callback === "function") {
        callback(response);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Calls the DMS message API
   * Sends a message to DMS
   * @public
   * @param message {Object} - should be a valid DMS messaging object
   */
  sendMessage = async (message, callback) => {
    //Forward the formatted message to Digital Messageing.
    try {
      //Set request headers
      let options = this.#generateRequestOptions();

      //Make outbound call to Pega
      let response = await axios.post(this.#API_URL, message, options);

      //Console Logging
      if (this.#LOGGING_ENABLED) {
        let log_prefix = "sendMessage - ";
        console.log(log_prefix + "Request Headers: ", options);
        console.log(log_prefix + "Request Message: ", message);
        console.log(
          log_prefix + "DMS messaging API response: ",
          response.status
        );
      }
      //Check if callback is a valid function and pass in args
      if (callback && typeof callback === "function") {
        callback(response);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Calls the DMS message API
   * Sends the typing indicator
   * @public
   * @param customer_id {String}
   */
  sendTypingIndicator = async (customer_id, callback) => {
    try {
      let message = {
        type: "typing_indicator",
        customer_id: customer_id,
      };

      let options = this.#generateRequestOptions();

      //Make outbound call to DMS/Pega
      let response = await axios.post(this.#API_URL, message, options);
      //Console Logging
      if (this.#LOGGING_ENABLED) {
        let log_prefix = "sendTypingIndicator - ";
        console.log(log_prefix + "Request Headers: ", options);
        console.log(log_prefix + "Request Message: ", message);
        console.log(
          log_prefix + "DMS messaging API response: ",
          response.status
        );
      }

      //Check if callback is a valid function and pass in args
      if (callback && typeof callback === "function") {
        callback(response);
      }
    } catch (err) {
      console.log(err);
    }
  };

  sendWaitTime = async (customer_id, waitTime, callback) => {
    try {
      let message = {
        type: "wait_time",
        customer_id: customer_id,
        waitTime: waitTime,
      };

      let options = this.#generateRequestOptions();

      //Make outbound call to DMS/Pega
      let response = await axios.post(this.#API_URL, message, options);
      //Console Logging
      if (this.#LOGGING_ENABLED) {
        let log_prefix = "sendWaitTime - ";
        console.log(log_prefix + "Request Headers: ", options);
        console.log(log_prefix + "Request Message: ", message);
        console.log(
          log_prefix + "DMS messaging API response: ",
          response.status
        );
      }

      //Check if callback is a valid function and pass in args
      if (callback && typeof callback === "function") {
        callback(response);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * returns the DMS messaging API request header using DMS config set in class instance
   * @private
   */
  #generateRequestOptions() {
    try {
      //Generate token for DMS API request
      var token = jwt.sign(
        {
          iss: this.#CHANNEL_ID,
        },
        this.#JWT_SECRET,
        { algorithm: "HS256" }
      );

      const options = {
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + token,
          connection_id: this.#CHANNEL_ID,
        },
      };

      return options;
    } catch (err) {
      console.log(err);
    }
  }
}//END CLASS

module.exports = DMSClientChannel;`
  },
  java: {
    name: 'Java',
    extension: '.java',
    badge: 'Java',
    color: 'bg-orange-100 text-orange-800',
    code: `import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.client.methods.CloseableHttpResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import java.util.Date;
import java.util.function.Consumer;

public class DMSClientChannel {
    private String apiUrl;
    private String channelId;
    private String jwtSecret;
    private boolean loggingEnabled;
    private ObjectMapper objectMapper;
    
    public DMSClientChannel(DMSConfig config) {
        this.apiUrl = config.getApiUrl();
        this.channelId = config.getChannelId();
        this.jwtSecret = config.getJwtSecret();
        this.loggingEnabled = false;
        this.objectMapper = new ObjectMapper();
    }
    
    // Event handlers (override these methods)
    public void onTypingIndicator(String customerId) {}
    public void onCsrEndSession(String customerId) {}
    public void onTextMessage(Map<String, Object> message) {}
    public void onMenuMessage(Map<String, Object> message) {}
    public void onCarouselMessage(Map<String, Object> message) {}
    public void onUrlLinkMessage(Map<String, Object> message) {}
    public void onWaitTime(Map<String, Object> message) {}
    
    public void logRequests(boolean status) {
        this.loggingEnabled = status;
    }
    
    public void onRequest(HttpRequest request, Consumer<HttpResponse> callback) {
        try {
            String token = getToken(request);
            boolean verified = validateToken(token);
            
            if (loggingEnabled) {
                System.out.println("onRequest - Token: " + token);
                System.out.println("onRequest - verified: " + verified);
                System.out.println("onRequest - Message received from DMS: " + request.getBody());
            }
            
            if (verified) {
                runMessageCallbacks(request.getBodyAsMap());
                callback.accept(new HttpResponse(200, "success"));
            } else {
                callback.accept(new HttpResponse(403, "forbidden"));
            }
        } catch (Exception err) {
            callback.accept(new HttpResponse(401, err.getMessage()));
        }
    }
    
    private String getToken(HttpRequest request) {
        String authHeader = request.getHeader("authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
    
    private boolean validateToken(String reqToken) {
        if (reqToken == null) {
            System.out.println("No token in request");
            return false;
        }
        
        try {
            Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(reqToken)
                .getBody();
                
            String iss = claims.getIssuer();
            Date iat = claims.getIssuedAt();
            
            if (loggingEnabled) {
                System.out.println("validateToken - iss: " + iss);
                System.out.println("validateToken - iat: " + iat);
                System.out.println("validateToken - channel id: " + channelId);
            }
            
            // Check if token is older than 5 minutes
            long tokenAge = (System.currentTimeMillis() - iat.getTime()) / 1000;
            if (tokenAge > 300) {
                return false;
            }
            
            if (channelId.equals(iss)) {
                if (loggingEnabled) {
                    System.out.println("valid token - validateToken()");
                }
                return true;
            } else {
                if (loggingEnabled) {
                    System.out.println("invalid token - validateToken()");
                }
                return false;
            }
        } catch (JwtException err) {
            System.out.println("error - validateToken(): " + err.getMessage());
            return false;
        }
    }
    
    private void runMessageCallbacks(Map<String, Object> message) {
        String messageType = message.get("type").toString();
        
        switch (messageType) {
            case "typing_indicator":
                onTypingIndicator(message.get("customer_id").toString());
                break;
            case "csr_end_session":
                onCsrEndSession(message.get("customer_id").toString());
                break;
            case "text":
                onTextMessage(message);
                break;
            case "menu":
                onMenuMessage(message);
                break;
            case "carousel":
                onCarouselMessage(message);
                break;
            case "link_button":
                onUrlLinkMessage(message);
                break;
            case "wait_time":
                onWaitTime(message);
                break;
        }
    }
    
    public void sendTextMessage(String customerId, String messageId, 
                               String messageText, String customerName, 
                               Consumer<HttpResponse> callback) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "text");
        message.put("customer_id", customerId);
        message.put("customer_name", customerName);
        message.put("message_id", messageId);
        message.put("text", new String[]{messageText});
        
        sendMessage(message, callback);
    }
    
    public void sendMessage(Map<String, Object> message, Consumer<HttpResponse> callback) {
        try {
            CloseableHttpClient httpClient = HttpClients.createDefault();
            HttpPost httpPost = new HttpPost(apiUrl);
            
            // Set headers
            Map<String, String> headers = generateRequestOptions();
            for (Map.Entry<String, String> header : headers.entrySet()) {
                httpPost.setHeader(header.getKey(), header.getValue());
            }
            
            // Set body
            String jsonMessage = objectMapper.writeValueAsString(message);
            httpPost.setEntity(new StringEntity(jsonMessage));
            
            CloseableHttpResponse response = httpClient.execute(httpPost);
            
            if (loggingEnabled) {
                System.out.println("sendMessage - Request Headers: " + headers);
                System.out.println("sendMessage - Request Message: " + message);
                System.out.println("sendMessage - DMS messaging API response: " + response.getStatusLine().getStatusCode());
            }
            
            if (callback != null) {
                callback.accept(new HttpResponse(response.getStatusLine().getStatusCode(), "success"));
            }
            
            response.close();
            httpClient.close();
        } catch (Exception err) {
            System.out.println("Error in sendMessage: " + err.getMessage());
        }
    }
    
    public void sendTypingIndicator(String customerId, Consumer<HttpResponse> callback) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "typing_indicator");
        message.put("customer_id", customerId);
        
        sendMessage(message, callback);
    }
    
    public void sendWaitTime(String customerId, int waitTime, Consumer<HttpResponse> callback) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "wait_time");
        message.put("customer_id", customerId);
        message.put("waitTime", waitTime);
        
        sendMessage(message, callback);
    }
    
    private Map<String, String> generateRequestOptions() {
        try {
            String token = Jwts.builder()
                .setIssuer(channelId)
                .signWith(SignatureAlgorithm.HS256, jwtSecret)
                .compact();
                
            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Type", "application/json");
            headers.put("authorization", "Bearer " + token);
            headers.put("connection_id", channelId);
            
            return headers;
        } catch (Exception err) {
            System.out.println("Error generating request options: " + err.getMessage());
            return new HashMap<>();
        }
    }
    
    // Helper classes
    public static class DMSConfig {
        private String apiUrl;
        private String channelId;
        private String jwtSecret;
        
        public DMSConfig(String apiUrl, String channelId, String jwtSecret) {
            this.apiUrl = apiUrl;
            this.channelId = channelId;
            this.jwtSecret = jwtSecret;
        }
        
        // Getters
        public String getApiUrl() { return apiUrl; }
        public String getChannelId() { return channelId; }
        public String getJwtSecret() { return jwtSecret; }
    }
    
    public static class HttpRequest {
        private Map<String, String> headers;
        private String body;
        
        public String getHeader(String name) { return headers.get(name); }
        public String getBody() { return body; }
        public Map<String, Object> getBodyAsMap() {
            // Implementation would parse JSON body to Map
            return new HashMap<>();
        }
    }
    
    public static class HttpResponse {
        private int statusCode;
        private String message;
        
        public HttpResponse(int statusCode, String message) {
            this.statusCode = statusCode;
            this.message = message;
        }
        
        public int getStatusCode() { return statusCode; }
        public String getMessage() { return message; }
    }
}`
  },
  python: {
    name: 'Python',
    extension: '.py',
    badge: 'Python',
    color: 'bg-blue-100 text-blue-800',
    code: `import jwt
import requests
import json
import time
from typing import Dict, Any, Callable, Optional

class DMSClientChannel:
    """
    DMS Client Channel SDK for Python
    Integrates with Pega's Digital Messaging Service
    """
    
    def __init__(self, config: Dict[str, str]):
        """
        Initialize the DMS Client Channel
        
        Args:
            config: Dictionary containing API_URL, CHANNEL_ID, and JWT_SECRET
        """
        self._api_url = config['API_URL']
        self._channel_id = config['CHANNEL_ID']
        self._jwt_secret = config['JWT_SECRET']
        self._logging_enabled = False
    
    # Event handlers (override these methods)
    def on_typing_indicator(self, customer_id: str) -> None:
        """Handle typing indicator events"""
        pass
    
    def on_csr_end_session(self, customer_id: str) -> None:
        """Handle CSR end session events"""
        pass
    
    def on_text_message(self, message: Dict[str, Any]) -> None:
        """Handle text message events"""
        pass
    
    def on_menu_message(self, message: Dict[str, Any]) -> None:
        """Handle menu message events"""
        pass
    
    def on_carousel_message(self, message: Dict[str, Any]) -> None:
        """Handle carousel message events"""
        pass
    
    def on_url_link_message(self, message: Dict[str, Any]) -> None:
        """Handle URL link message events"""
        pass
    
    def on_wait_time(self, message: Dict[str, Any]) -> None:
        """Handle wait time events"""
        pass
    
    def log_requests(self, status: bool) -> None:
        """
        Enable or disable request logging
        
        Args:
            status: Boolean to enable/disable logging
        """
        self._logging_enabled = status
    
    def on_request(self, request: Dict[str, Any], callback: Callable[[int, str], None]) -> None:
        """
        Handle incoming DMS requests
        
        Args:
            request: Request object containing headers and body
            callback: Callback function to return response
        """
        try:
            token = self._get_token(request)
            verified = self._validate_token(token)
            
            if self._logging_enabled:
                print(f"onRequest - Token: {token}")
                print(f"onRequest - verified: {verified}")
                print(f"onRequest - Message received from DMS: {request.get('body')}")
            
            if verified:
                self._run_message_callbacks(request.get('body', {}))
                callback(200, "success")
            else:
                callback(403, "forbidden")
                
        except Exception as err:
            callback(401, str(err))
    
    def _get_token(self, request: Dict[str, Any]) -> Optional[str]:
        """Extract JWT token from request headers"""
        headers = request.get('headers', {})
        auth_header = headers.get('authorization', '')
        
        if auth_header.startswith('Bearer '):
            return auth_header[7:]
        return None
    
    def _validate_token(self, req_token: Optional[str]) -> bool:
        """
        Validate JWT token
        
        Args:
            req_token: JWT token to validate
            
        Returns:
            Boolean indicating if token is valid
        """
        if not req_token:
            print("No token in request")
            return False
        
        try:
            # Decode and verify token
            payload = jwt.decode(
                req_token, 
                self._jwt_secret, 
                algorithms=["HS256"],
                options={"verify_exp": False}  # We'll check age manually
            )
            
            iss = payload.get('iss')
            iat = payload.get('iat')
            
            if self._logging_enabled:
                print(f"validateToken - iss: {iss}")
                print(f"validateToken - iat: {iat}")
                print(f"validateToken - channel id: {self._channel_id}")
            
            # Check if token is older than 5 minutes (300 seconds)
            if iat and (time.time() - iat) > 300:
                if self._logging_enabled:
                    print("Token expired - validateToken()")
                return False
            
            if iss == self._channel_id:
                if self._logging_enabled:
                    print("valid token - validateToken()")
                return True
            else:
                if self._logging_enabled:
                    print("invalid token - validateToken()")
                return False
                
        except jwt.InvalidTokenError as err:
            print(f"error - validateToken(): {err}")
            return False
    
    def _run_message_callbacks(self, message: Dict[str, Any]) -> None:
        """Route messages to appropriate callback handlers"""
        message_type = message.get('type')
        
        if message_type == 'typing_indicator':
            self.on_typing_indicator(message.get('customer_id'))
        elif message_type == 'csr_end_session':
            self.on_csr_end_session(message.get('customer_id'))
        elif message_type == 'text':
            self.on_text_message(message)
        elif message_type == 'menu':
            self.on_menu_message(message)
        elif message_type == 'carousel':
            self.on_carousel_message(message)
        elif message_type == 'link_button':
            self.on_url_link_message(message)
        elif message_type == 'wait_time':
            self.on_wait_time(message)
    
    def send_text_message(self, customer_id: str, message_id: str, 
                         message_text: str, customer_name: str, 
                         callback: Optional[Callable] = None) -> None:
        """
        Send a text message to DMS
        
        Args:
            customer_id: Customer identifier
            message_id: Message identifier
            message_text: Text content to send
            customer_name: Customer name
            callback: Optional callback function
        """
        message = {
            'type': 'text',
            'customer_id': customer_id,
            'customer_name': customer_name,
            'message_id': message_id,
            'text': [message_text]
        }
        
        self.send_message(message, callback)
    
    def send_message(self, message: Dict[str, Any], callback: Optional[Callable] = None) -> None:
        """
        Send a message to DMS
        
        Args:
            message: Message object to send
            callback: Optional callback function
        """
        try:
            headers = self._generate_request_options()
            
            response = requests.post(
                self._api_url,
                json=message,
                headers=headers
            )
            
            if self._logging_enabled:
                print(f"sendMessage - Request Headers: {headers}")
                print(f"sendMessage - Request Message: {message}")
                print(f"sendMessage - DMS messaging API response: {response.status_code}")
            
            if callback:
                callback(response)
                
        except Exception as err:
            print(f"Error in sendMessage: {err}")
    
    def send_typing_indicator(self, customer_id: str, callback: Optional[Callable] = None) -> None:
        """
        Send typing indicator to DMS
        
        Args:
            customer_id: Customer identifier
            callback: Optional callback function
        """
        message = {
            'type': 'typing_indicator',
            'customer_id': customer_id
        }
        
        self.send_message(message, callback)
    
    def send_wait_time(self, customer_id: str, wait_time: int, callback: Optional[Callable] = None) -> None:
        """
        Send wait time to DMS
        
        Args:
            customer_id: Customer identifier
            wait_time: Wait time in seconds
            callback: Optional callback function
        """
        message = {
            'type': 'wait_time',
            'customer_id': customer_id,
            'waitTime': wait_time
        }
        
        self.send_message(message, callback)
    
    def _generate_request_options(self) -> Dict[str, str]:
        """
        Generate request headers with JWT token
        
        Returns:
            Dictionary of headers for API requests
        """
        try:
            token = jwt.encode(
                {'iss': self._channel_id},
                self._jwt_secret,
                algorithm='HS256'
            )
            
            return {
                'Content-Type': 'application/json',
                'authorization': f'Bearer {token}',
                'connection_id': self._channel_id
            }
            
        except Exception as err:
            print(f"Error generating request options: {err}")
            return {}

# Example usage:
# config = {
#     'API_URL': 'https://your-dms-api-url.com',
#     'CHANNEL_ID': 'your-channel-id',
#     'JWT_SECRET': 'your-jwt-secret'
# }
# 
# dms = DMSClientChannel(config)
# dms.log_requests(True)
# 
# dms.send_text_message(
#     'customer-123',
#     'msg-456', 
#     'Hello from Python DMS!',
#     'John Doe'
# )`
  },
  csharp: {
    name: 'C#',
    extension: '.cs',
    badge: 'C#',
    color: 'bg-purple-100 text-purple-800',
    code: `using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Newtonsoft.Json;

namespace DMSClientChannel
{
    public class DMSClientChannel
    {
        private readonly string _apiUrl;
        private readonly string _channelId;
        private readonly string _jwtSecret;
        private bool _loggingEnabled;
        private readonly HttpClient _httpClient;
        
        public DMSClientChannel(DMSConfig config)
        {
            _apiUrl = config.ApiUrl;
            _channelId = config.ChannelId;
            _jwtSecret = config.JwtSecret;
            _loggingEnabled = false;
            _httpClient = new HttpClient();
        }
        
        // Event handlers (virtual methods to be overridden)
        public virtual void OnTypingIndicator(string customerId) { }
        public virtual void OnCsrEndSession(string customerId) { }
        public virtual void OnTextMessage(Dictionary<string, object> message) { }
        public virtual void OnMenuMessage(Dictionary<string, object> message) { }
        public virtual void OnCarouselMessage(Dictionary<string, object> message) { }
        public virtual void OnUrlLinkMessage(Dictionary<string, object> message) { }
        public virtual void OnWaitTime(Dictionary<string, object> message) { }
        
        public void LogRequests(bool status)
        {
            _loggingEnabled = status;
        }
        
        public void OnRequest(HttpRequestMessage request, Action<HttpResponseMessage> callback)
        {
            try
            {
                var token = GetToken(request);
                var verified = ValidateToken(token);
                
                if (_loggingEnabled)
                {
                    Console.WriteLine($"onRequest - Token: {token}");
                    Console.WriteLine($"onRequest - verified: {verified}");
                    Console.WriteLine($"onRequest - Message received from DMS: {request.Content}");
                }
                
                if (verified)
                {
                    // Parse request body and run callbacks
                    var bodyContent = request.Content.ReadAsStringAsync().Result;
                    var message = JsonConvert.DeserializeObject<Dictionary<string, object>>(bodyContent);
                    RunMessageCallbacks(message);
                    
                    var response = new HttpResponseMessage(System.Net.HttpStatusCode.OK);
                    callback(response);
                }
                else
                {
                    var response = new HttpResponseMessage(System.Net.HttpStatusCode.Forbidden);
                    callback(response);
                }
            }
            catch (Exception err)
            {
                var response = new HttpResponseMessage(System.Net.HttpStatusCode.Unauthorized);
                callback(response);
            }
        }
        
        private string GetToken(HttpRequestMessage request)
        {
            if (request.Headers.Authorization != null && 
                request.Headers.Authorization.Scheme == "Bearer")
            {
                return request.Headers.Authorization.Parameter;
            }
            return null;
        }
        
        private bool ValidateToken(string reqToken)
        {
            if (string.IsNullOrEmpty(reqToken))
            {
                Console.WriteLine("No token in request");
                return false;
            }
            
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_jwtSecret);
                
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _channelId,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(5)
                };
                
                SecurityToken validatedToken;
                var principal = tokenHandler.ValidateToken(reqToken, validationParameters, out validatedToken);
                
                var jwtToken = (JwtSecurityToken)validatedToken;
                var iss = jwtToken.Issuer;
                var iat = jwtToken.IssuedAt;
                
                if (_loggingEnabled)
                {
                    Console.WriteLine($"validateToken - iss: {iss}");
                    Console.WriteLine($"validateToken - iat: {iat}");
                    Console.WriteLine($"validateToken - channel id: {_channelId}");
                }
                
                if (iss == _channelId)
                {
                    if (_loggingEnabled)
                    {
                        Console.WriteLine("valid token - validateToken()");
                    }
                    return true;
                }
                else
                {
                    if (_loggingEnabled)
                    {
                        Console.WriteLine("invalid token - validateToken()");
                    }
                    return false;
                }
            }
            catch (Exception err)
            {
                Console.WriteLine($"error - validateToken(): {err.Message}");
                return false;
            }
        }
        
        private void RunMessageCallbacks(Dictionary<string, object> message)
        {
            if (!message.ContainsKey("type")) return;
            
            var messageType = message["type"].ToString();
            
            switch (messageType)
            {
                case "typing_indicator":
                    OnTypingIndicator(message["customer_id"].ToString());
                    break;
                case "csr_end_session":
                    OnCsrEndSession(message["customer_id"].ToString());
                    break;
                case "text":
                    OnTextMessage(message);
                    break;
                case "menu":
                    OnMenuMessage(message);
                    break;
                case "carousel":
                    OnCarouselMessage(message);
                    break;
                case "link_button":
                    OnUrlLinkMessage(message);
                    break;
                case "wait_time":
                    OnWaitTime(message);
                    break;
            }
        }
        
        public async Task SendTextMessageAsync(string customerId, string messageId, 
                                             string messageText, string customerName, 
                                             Action<HttpResponseMessage> callback = null)
        {
            var message = new Dictionary<string, object>
            {
                ["type"] = "text",
                ["customer_id"] = customerId,
                ["customer_name"] = customerName,
                ["message_id"] = messageId,
                ["text"] = new[] { messageText }
            };
            
            await SendMessageAsync(message, callback);
        }
        
        public async Task SendMessageAsync(Dictionary<string, object> message, 
                                         Action<HttpResponseMessage> callback = null)
        {
            try
            {
                var headers = GenerateRequestOptions();
                var jsonContent = JsonConvert.SerializeObject(message);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
                
                // Set headers
                foreach (var header in headers)
                {
                    _httpClient.DefaultRequestHeaders.Remove(header.Key);
                    _httpClient.DefaultRequestHeaders.Add(header.Key, header.Value);
                }
                
                var response = await _httpClient.PostAsync(_apiUrl, content);
                
                if (_loggingEnabled)
                {
                    Console.WriteLine($"sendMessage - Request Headers: {JsonConvert.SerializeObject(headers)}");
                    Console.WriteLine($"sendMessage - Request Message: {JsonConvert.SerializeObject(message)}");
                    Console.WriteLine($"sendMessage - DMS messaging API response: {response.StatusCode}");
                }
                
                callback?.Invoke(response);
            }
            catch (Exception err)
            {
                Console.WriteLine($"Error in sendMessage: {err.Message}");
            }
        }
        
        public async Task SendTypingIndicatorAsync(string customerId, Action<HttpResponseMessage> callback = null)
        {
            var message = new Dictionary<string, object>
            {
                ["type"] = "typing_indicator",
                ["customer_id"] = customerId
            };
            
            await SendMessageAsync(message, callback);
        }
        
        public async Task SendWaitTimeAsync(string customerId, int waitTime, Action<HttpResponseMessage> callback = null)
        {
            var message = new Dictionary<string, object>
            {
                ["type"] = "wait_time",
                ["customer_id"] = customerId,
                ["waitTime"] = waitTime
            };
            
            await SendMessageAsync(message, callback);
        }
        
        private Dictionary<string, string> GenerateRequestOptions()
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_jwtSecret);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Issuer = _channelId,
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };
                
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);
                
                return new Dictionary<string, string>
                {
                    ["Content-Type"] = "application/json",
                    ["authorization"] = $"Bearer {tokenString}",
                    ["connection_id"] = _channelId
                };
            }
            catch (Exception err)
            {
                Console.WriteLine($"Error generating request options: {err.Message}");
                return new Dictionary<string, string>();
            }
        }
        
        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
    
    public class DMSConfig
    {
        public string ApiUrl { get; set; }
        public string ChannelId { get; set; }
        public string JwtSecret { get; set; }
        
        public DMSConfig(string apiUrl, string channelId, string jwtSecret)
        {
            ApiUrl = apiUrl;
            ChannelId = channelId;
            JwtSecret = jwtSecret;
        }
    }
}

// Example usage:
// var config = new DMSConfig(
//     "https://your-dms-api-url.com",
//     "your-channel-id", 
//     "your-jwt-secret"
// );
// 
// var dms = new DMSClientChannel(config);
// dms.LogRequests(true);
// 
// await dms.SendTextMessageAsync(
//     "customer-123",
//     "msg-456",
//     "Hello from C# DMS!",
//     "John Doe"
// );`
  },
  php: {
    name: 'PHP',
    extension: '.php',
    badge: 'PHP',
    color: 'bg-indigo-100 text-indigo-800',
    code: `<?php

require_once 'vendor/autoload.php';
use Firebase\\JWT\\JWT;
use Firebase\\JWT\\Key;
use GuzzleHttp\\Client;
use GuzzleHttp\\Exception\\RequestException;

class DMSClientChannel {
    private $apiUrl;
    private $channelId;
    private $jwtSecret;
    private $loggingEnabled;
    private $httpClient;
    
    public function __construct($config) {
        $this->apiUrl = $config['API_URL'];
        $this->channelId = $config['CHANNEL_ID'];
        $this->jwtSecret = $config['JWT_SECRET'];
        $this->loggingEnabled = false;
        $this->httpClient = new Client();
    }
    
    // Event handlers (override these methods in subclass)
    public function onTypingIndicator($customerId) {}
    public function onCsrEndSession($customerId) {}
    public function onTextMessage($message) {}
    public function onMenuMessage($message) {}
    public function onCarouselMessage($message) {}
    public function onUrlLinkMessage($message) {}
    public function onWaitTime($message) {}
    
    public function logRequests($status) {
        $this->loggingEnabled = $status;
    }
    
    public function onRequest($request, $callback) {
        try {
            $token = $this->getToken($request);
            $verified = $this->validateToken($token);
            
            if ($this->loggingEnabled) {
                error_log("onRequest - Token: " . $token);
                error_log("onRequest - verified: " . ($verified ? 'true' : 'false'));
                error_log("onRequest - Message received from DMS: " . json_encode($request['body']));
            }
            
            if ($verified) {
                $this->runMessageCallbacks($request['body']);
                $callback(200, "success");
            } else {
                $callback(403, "forbidden");
            }
        } catch (Exception $err) {
            $callback(401, $err->getMessage());
        }
    }
    
    private function getToken($request) {
        if (isset($request['headers']['authorization'])) {
            $authHeader = $request['headers']['authorization'];
            if (strpos($authHeader, 'Bearer ') === 0) {
                return substr($authHeader, 7);
            }
        }
        return null;
    }
    
    private function validateToken($reqToken) {
        if (!$reqToken) {
            error_log("No token in request");
            return false;
        }
        
        try {
            $decoded = JWT::decode($reqToken, new Key($this->jwtSecret, 'HS256'));
            
            $iss = $decoded->iss ?? null;
            $iat = $decoded->iat ?? null;
            
            if ($this->loggingEnabled) {
                error_log("validateToken - iss: " . $iss);
                error_log("validateToken - iat: " . $iat);
                error_log("validateToken - channel id: " . $this->channelId);
            }
            
            // Check if token is older than 5 minutes (300 seconds)
            if ($iat && (time() - $iat) > 300) {
                if ($this->loggingEnabled) {
                    error_log("Token expired - validateToken()");
                }
                return false;
            }
            
            if ($iss === $this->channelId) {
                if ($this->loggingEnabled) {
                    error_log("valid token - validateToken()");
                }
                return true;
            } else {
                if ($this->loggingEnabled) {
                    error_log("invalid token - validateToken()");
                }
                return false;
            }
        } catch (Exception $err) {
            error_log("error - validateToken(): " . $err->getMessage());
            return false;
        }
    }
    
    private function runMessageCallbacks($message) {
        $messageType = $message['type'] ?? null;
        
        switch ($messageType) {
            case 'typing_indicator':
                $this->onTypingIndicator($message['customer_id']);
                break;
            case 'csr_end_session':
                $this->onCsrEndSession($message['customer_id']);
                break;
            case 'text':
                $this->onTextMessage($message);
                break;
            case 'menu':
                $this->onMenuMessage($message);
                break;
            case 'carousel':
                $this->onCarouselMessage($message);
                break;
            case 'link_button':
                $this->onUrlLinkMessage($message);
                break;
            case 'wait_time':
                $this->onWaitTime($message);
                break;
        }
    }
    
    public function sendTextMessage($customerId, $messageId, $messageText, $customerName, $callback = null) {
        $message = [
            'type' => 'text',
            'customer_id' => $customerId,
            'customer_name' => $customerName,
            'message_id' => $messageId,
            'text' => [$messageText]
        ];
        
        $this->sendMessage($message, $callback);
    }
    
    public function sendMessage($message, $callback = null) {
        try {
            $headers = $this->generateRequestOptions();
            
            $response = $this->httpClient->post($this->apiUrl, [
                'json' => $message,
                'headers' => $headers
            ]);
            
            if ($this->loggingEnabled) {
                error_log("sendMessage - Request Headers: " . json_encode($headers));
                error_log("sendMessage - Request Message: " . json_encode($message));
                error_log("sendMessage - DMS messaging API response: " . $response->getStatusCode());
            }
            
            if ($callback) {
                $callback($response);
            }
        } catch (RequestException $err) {
            error_log("Error in sendMessage: " . $err->getMessage());
        }
    }
    
    public function sendTypingIndicator($customerId, $callback = null) {
        $message = [
            'type' => 'typing_indicator',
            'customer_id' => $customerId
        ];
        
        $this->sendMessage($message, $callback);
    }
    
    public function sendWaitTime($customerId, $waitTime, $callback = null) {
        $message = [
            'type' => 'wait_time',
            'customer_id' => $customerId,
            'waitTime' => $waitTime
        ];
        
        $this->sendMessage($message, $callback);
    }
    
    private function generateRequestOptions() {
        try {
            $payload = [
                'iss' => $this->channelId,
                'iat' => time()
            ];
            
            $token = JWT::encode($payload, $this->jwtSecret, 'HS256');
            
            return [
                'Content-Type' => 'application/json',
                'authorization' => 'Bearer ' . $token,
                'connection_id' => $this->channelId
            ];
        } catch (Exception $err) {
            error_log("Error generating request options: " . $err->getMessage());
            return [];
        }
    }
}

// Example usage:
// $config = [
//     'API_URL' => 'https://your-dms-api-url.com',
//     'CHANNEL_ID' => 'your-channel-id',
//     'JWT_SECRET' => 'your-jwt-secret'
// ];
// 
// $dms = new DMSClientChannel($config);
// $dms->logRequests(true);
// 
// $dms->sendTextMessage(
//     'customer-123',
//     'msg-456',
//     'Hello from PHP DMS!',
//     'John Doe'
// );

?>`
  },
  ruby: {
    name: 'Ruby',
    extension: '.rb',
    badge: 'Ruby',
    color: 'bg-red-100 text-red-800',
    code: `require 'jwt'
require 'net/http'
require 'json'
require 'uri'

class DMSClientChannel
  def initialize(config)
    @api_url = config[:API_URL]
    @channel_id = config[:CHANNEL_ID]
    @jwt_secret = config[:JWT_SECRET]
    @logging_enabled = false
  end
  
  # Event handlers (override these methods)
  def on_typing_indicator(customer_id); end
  def on_csr_end_session(customer_id); end
  def on_text_message(message); end
  def on_menu_message(message); end
  def on_carousel_message(message); end
  def on_url_link_message(message); end
  def on_wait_time(message); end
  
  def log_requests(status)
    @logging_enabled = status
  end
  
  def on_request(request, callback)
    begin
      token = get_token(request)
      verified = validate_token(token)
      
      if @logging_enabled
        puts "onRequest - Token: #{token}"
        puts "onRequest - verified: #{verified}"
        puts "onRequest - Message received from DMS: #{request[:body]}"
      end
      
      if verified
        run_message_callbacks(request[:body])
        callback.call(200, "success")
      else
        callback.call(403, "forbidden")
      end
    rescue => err
      callback.call(401, err.message)
    end
  end
  
  private
  
  def get_token(request)
    auth_header = request.dig(:headers, :authorization)
    return nil unless auth_header
    
    if auth_header.start_with?('Bearer ')
      auth_header[7..-1]
    else
      nil
    end
  end
  
  def validate_token(req_token)
    unless req_token
      puts "No token in request"
      return false
    end
    
    begin
      decoded_token = JWT.decode(req_token, @jwt_secret, true, { algorithm: 'HS256' })
      payload = decoded_token[0]
      
      iss = payload['iss']
      iat = payload['iat']
      
      if @logging_enabled
        puts "validateToken - iss: #{iss}"
        puts "validateToken - iat: #{iat}"
        puts "validateToken - channel id: #{@channel_id}"
      end
      
      # Check if token is older than 5 minutes (300 seconds)
      if iat && (Time.now.to_i - iat) > 300
        puts "Token expired - validateToken()" if @logging_enabled
        return false
      end
      
      if iss == @channel_id
        puts "valid token - validateToken()" if @logging_enabled
        true
      else
        puts "invalid token - validateToken()" if @logging_enabled
        false
      end
    rescue JWT::DecodeError => err
      puts "error - validateToken(): #{err.message}"
      false
    end
  end
  
  def run_message_callbacks(message)
    message_type = message['type']
    
    case message_type
    when 'typing_indicator'
      on_typing_indicator(message['customer_id'])
    when 'csr_end_session'
      on_csr_end_session(message['customer_id'])
    when 'text'
      on_text_message(message)
    when 'menu'
      on_menu_message(message)
    when 'carousel'
      on_carousel_message(message)
    when 'link_button'
      on_url_link_message(message)
    when 'wait_time'
      on_wait_time(message)
    end
  end
  
  public
  
  def send_text_message(customer_id, message_id, message_text, customer_name, callback = nil)
    message = {
      type: 'text',
      customer_id: customer_id,
      customer_name: customer_name,
      message_id: message_id,
      text: [message_text]
    }
    
    send_message(message, callback)
  end
  
  def send_message(message, callback = nil)
    begin
      uri = URI(@api_url)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == 'https'
      
      request = Net::HTTP::Post.new(uri)
      request['Content-Type'] = 'application/json'
      
      # Set headers
      headers = generate_request_options
      headers.each { |key, value| request[key] = value }
      
      request.body = message.to_json
      
      response = http.request(request)
      
      if @logging_enabled
        puts "sendMessage - Request Headers: #{headers}"
        puts "sendMessage - Request Message: #{message}"
        puts "sendMessage - DMS messaging API response: #{response.code}"
      end
      
      callback.call(response) if callback
    rescue => err
      puts "Error in sendMessage: #{err.message}"
    end
  end
  
  def send_typing_indicator(customer_id, callback = nil)
    message = {
      type: 'typing_indicator',
      customer_id: customer_id
    }
    
    send_message(message, callback)
  end
  
  def send_wait_time(customer_id, wait_time, callback = nil)
    message = {
      type: 'wait_time',
      customer_id: customer_id,
      waitTime: wait_time
    }
    
    send_message(message, callback)
  end
  
  private
  
  def generate_request_options
    begin
      payload = {
        iss: @channel_id,
        iat: Time.now.to_i
      }
      
      token = JWT.encode(payload, @jwt_secret, 'HS256')
      
      {
        'Content-Type' => 'application/json',
        'authorization' => "Bearer #{token}",
        'connection_id' => @channel_id
      }
    rescue => err
      puts "Error generating request options: #{err.message}"
      {}
    end
  end
end

# Example usage:
# config = {
#   API_URL: 'https://your-dms-api-url.com',
#   CHANNEL_ID: 'your-channel-id',
#   JWT_SECRET: 'your-jwt-secret'
# }
# 
# dms = DMSClientChannel.new(config)
# dms.log_requests(true)
# 
# dms.send_text_message(
#   'customer-123',
#   'msg-456',
#   'Hello from Ruby DMS!',
#   'John Doe'
# )`
  }
};

export const SDKViewer = () => {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState('nodejs');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(implementations[selectedLanguage].code);
    toast({
      title: "Code Copied",
      description: `${implementations[selectedLanguage].name} code has been copied to clipboard`,
    });
  };

  const handleOpenNPM = () => {
    window.open('https://www.npmjs.com/package/dms-client-channel', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code2 className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle className="text-2xl text-gray-900">DMS Client Channel SDK</CardTitle>
                <p className="text-gray-600 mt-1">
                  Reference implementation for integrating with Pega's Digital Messaging Service
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={implementations[selectedLanguage].color}>
                {implementations[selectedLanguage].badge}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                v1.0.0
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Language Toggles */}
      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg mb-4">Select Programming Language</CardTitle>
          <div className="flex flex-wrap gap-2">
            {Object.entries(implementations).map(([key, impl]) => (
              <Toggle
                key={key}
                pressed={selectedLanguage === key}
                onPressedChange={() => setSelectedLanguage(key)}
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white"
              >
                {impl.name}
              </Toggle>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* SDK Content */}
      <Tabs defaultValue="code" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            Source Code
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documentation
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="code">
          <Card className="border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    DMSClientChannel{implementations[selectedLanguage].extension}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete SDK implementation for DMS integration in {implementations[selectedLanguage].name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </Button>
                  {selectedLanguage === 'nodejs' && (
                    <Button
                      onClick={handleOpenNPM}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on NPM
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px] w-full">
                <pre className="p-6 text-sm bg-gray-50 font-mono leading-relaxed overflow-x-auto">
                  <code className="text-gray-800">{implementations[selectedLanguage].code}</code>
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Quick Start Guide</CardTitle>
              <p className="text-gray-600">
                Get started with the DMS Client Channel SDK in {implementations[selectedLanguage].name}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Installation</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <code className="text-sm font-mono">
                    {selectedLanguage === 'nodejs' && 'npm install dms-client-channel'}
                    {selectedLanguage === 'python' && 'pip install PyJWT requests'}
                    {selectedLanguage === 'java' && 'Add dependencies for JWT and HTTP client to your pom.xml'}
                    {selectedLanguage === 'csharp' && 'Install-Package System.IdentityModel.Tokens.Jwt'}
                    {selectedLanguage === 'php' && 'composer require firebase/php-jwt guzzlehttp/guzzle'}
                    {selectedLanguage === 'ruby' && 'gem install jwt'}
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Usage</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm font-mono leading-relaxed">
{selectedLanguage === 'nodejs' && `const DMSClientChannel = require('dms-client-channel');

const dms = new DMSClientChannel({
  API_URL: 'https://your-dms-api-url.com',
  CHANNEL_ID: 'your-channel-id',
  JWT_SECRET: 'your-jwt-secret'
});

dms.logRequests(true);
dms.sendTextMessage('customer-123', 'msg-456', 'Hello!', 'John');`}

{selectedLanguage === 'python' && `from dms_client_channel import DMSClientChannel

config = {
    'API_URL': 'https://your-dms-api-url.com',
    'CHANNEL_ID': 'your-channel-id',
    'JWT_SECRET': 'your-jwt-secret'
}

dms = DMSClientChannel(config)
dms.log_requests(True)
dms.send_text_message('customer-123', 'msg-456', 'Hello!', 'John')`}

{selectedLanguage === 'java' && `DMSConfig config = new DMSConfig(
    "https://your-dms-api-url.com",
    "your-channel-id",
    "your-jwt-secret"
);

DMSClientChannel dms = new DMSClientChannel(config);
dms.logRequests(true);
dms.sendTextMessage("customer-123", "msg-456", "Hello!", "John", null);`}

{selectedLanguage === 'csharp' && `var config = new DMSConfig(
    "https://your-dms-api-url.com",
    "your-channel-id", 
    "your-jwt-secret"
);

var dms = new DMSClientChannel(config);
dms.LogRequests(true);
await dms.SendTextMessageAsync("customer-123", "msg-456", "Hello!", "John");`}

{selectedLanguage === 'php' && `$config = [
    'API_URL' => 'https://your-dms-api-url.com',
    'CHANNEL_ID' => 'your-channel-id',
    'JWT_SECRET' => 'your-jwt-secret'
];

$dms = new DMSClientChannel($config);
$dms->logRequests(true);
$dms->sendTextMessage('customer-123', 'msg-456', 'Hello!', 'John');`}

{selectedLanguage === 'ruby' && `config = {
  API_URL: 'https://your-dms-api-url.com',
  CHANNEL_ID: 'your-channel-id',
  JWT_SECRET: 'your-jwt-secret'
}

dms = DMSClientChannel.new(config)
dms.log_requests(true)
dms.send_text_message('customer-123', 'msg-456', 'Hello!', 'John')`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Key Methods</h3>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600">sendTextMessage()</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Send a text message to a specific customer through DMS
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600">sendTypingIndicator()</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Send typing indicator to show agent is typing
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600">onRequest()</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Handle incoming requests from DMS with JWT validation
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600">logRequests()</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Enable or disable detailed logging for debugging
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
