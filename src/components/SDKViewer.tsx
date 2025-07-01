
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Code2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const dmsClientChannelCode = `const jwt = require("jsonwebtoken"); //For generating DMS jwt
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

module.exports = DMSClientChannel;`;

export const SDKViewer = () => {
  const { toast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(dmsClientChannelCode);
    toast({
      title: "Code Copied",
      description: "DMS Client Channel code has been copied to clipboard",
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
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Node.js
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                v1.0.0
              </Badge>
            </div>
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
                  <CardTitle className="text-lg">DMSClientChannel.js</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete SDK implementation for DMS integration
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
                  <Button
                    onClick={handleOpenNPM}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on NPM
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px] w-full">
                <pre className="p-6 text-sm bg-gray-50 font-mono leading-relaxed overflow-x-auto">
                  <code className="text-gray-800">{dmsClientChannelCode}</code>
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
                Get started with the DMS Client Channel SDK
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Installation</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <code className="text-sm font-mono">npm install dms-client-channel</code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Usage</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm font-mono leading-relaxed">
{`const DMSClientChannel = require('dms-client-channel');

const dms = new DMSClientChannel({
  API_URL: 'https://your-dms-api-url.com',
  CHANNEL_ID: 'your-channel-id',
  JWT_SECRET: 'your-jwt-secret'
});

// Enable logging
dms.logRequests(true);

// Send a text message
dms.sendTextMessage(
  'customer-123',
  'msg-456',
  'Hello from DMS!',
  'John Doe',
  (response) => {
    console.log('Message sent:', response.status);
  }
);`}
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
