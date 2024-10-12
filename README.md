# Shipmate
Helps you ship your releases on time :)

## Setup
Built using nodejs. Create an `.env` file and add:
```javascript
SLACK_BOT_TOKEN={slack_bot_token}
JIRA_API_TOKEN={jira_api_token}
```

### The Slack token
1. Create a Slack App
   To interact with Slack via API, you'll need to create a Slack App with the appropriate permissions.

    
a. <b>Create the App:</b>
Navigate to Slack API: Applications and click on "Create New App".
Choose "From scratch", provide an app name (e.g., JiraReleaseBot), and select your workspace.

b. <b>Set Permissions:</b>
In your app's settings, go to "OAuth & Permissions".
Under "Scopes", add the following Bot Token Scopes:
```
channels:manage – to create channels.
channels:write.invites - to invite people to the channel
users:read - to view the people in a workspace (used for invites)
users:read.email - to invite people to the app, based on their email
chat:write – to send messages if needed.
```
Install the app to your workspace and copy the Bot User OAuth Token (starts with xoxb-).

### The Jira API token:
1. <b>Generate an API Token</b>
   
   Step 1: Navigate to Atlassian API Tokens. 
   
   Step 2: Click "Create API token". 
    
   Step 3: Name your token (e.g., "Jira Automation") and click "Create". 
    
    Step 4: Copy the generated token and store it securely.
2. <b>Encode Your Credentials</b>

Credentials Format: `email:api_token`

Example: `user@example.com:abcd1234efgh5678ijkl`

Command-Line Example:
```bash
echo -n 'user@example.com:abcd1234efgh5678ijkl' | base64
Result: dXNlckBleGFtcGxlLmNvbTphYmNkMTIzNGVmZ2g1Njc4aWprbA==
```