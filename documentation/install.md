# Install Twitter-Chatter

This document describes in detail how to clone this application into your Bluemix space and run it. 
You should have on hand your Twitter credentials.  If you don't have them now, go to 
[Twitter Apps console](https://apps.twitter.com/) and follow the instructions to create a new app 
and obtain the access and consumer tokens.  This application uses them in the form of a JSON object
so you should convert them into a JSON string like the following;

```
{	
  "access_token": "XXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",	
  "access_token_secret": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",	
  "consumer_key": "XXXXXXXXXXXXXXXXXXXXXXx",	
  "consumer_secret": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" 
}
```

## Create Toolchain

1. Click on the Create Toolchain.

[![Deploy to Bluemix](https://developer.ibm.com/devops-services/wp-content/uploads/sites/42/2016/05/create_toolchain_button.png)](https://console.ng.bluemix.net/devops/setup/deploy/?repository=https%3A%2F%2Fgithub.com%2Fjconallen%2Ftwitter-chatter)

2. This will navigate you to Bluemix.  If you haven't logged in yet, log into Bluemix with your
Bluemix ID. 

![](images/DcreenShot1.png)