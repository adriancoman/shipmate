# Shipmate 🚢
<img src="shipmate.png" alt="Shipmate" width="200">

Ensures your releases stay on schedule! 🚢

Every day at 10 AM it checks for upcoming releases and takes the following actions:
1. **9 days before release** – Creates a Slack channel and invites mobile developers, QA, and PMs.
2. **3 days before release** – Sends a reminder about the code freeze and alerts you to any incomplete tasks.
3. **Release day** – Sends a final reminder and highlights any pending tasks.

To add people to the release channel automatically, go to the `config.json` file and add their Slack ID and name (to get the ID, authenticate and use this endpoint: https://api.slack.com/methods/users.lookupByEmail). 
## ⚙️ Setup
Built using Node.js. I'll presume you already have basic knowledge and installed node.

Create an `.env` file and add:
```javascript
SLACK_BOT_TOKEN={slack_bot_token}
JIRA_API_TOKEN={jira_api_token}
```

### The Slack token
#### Create a Slack App  

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

## 🚀 Run it
Try it out with `npm run dev`

## 📡 API
The script will run daily and check if there are any releases upcoming.
If you want to run the script manually for a particular release you can do so:
### **POST** `/api/shipmate`

This endpoint creates a new Slack channel with the provided version name and release date.

#### **Request Body**
The request must be sent as **JSON** with the following parameters:

| Parameter     | Type   | Required | Description                                                                                                                                                                                  |
|--------------|--------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `versionName` | string | ✅ Yes    | The name of the version being released (e.g., `"iOS Pago 2.24.0"`). You only need one release per platform. If you append with Android, it will just try to recreate the same channel again. |
| `releaseDate` | string | ✅ Yes    | The release date in `YYYY-MM-DD` format (e.g., `"2025-02-27"`).                                                                                                                              |

#### **Example Request**
```bash
curl -X POST https://your-api.com/api/shipmate \
     -H "Content-Type: application/json" \
     -d '{
           "versionName": "iOS Pago 2.24.0",
           "releaseDate": "2025-02-27"
         }'
```

### **POST** `/api/shipmate/reminder`

This endpoint will send a manual reminder for the selected release. It will try and find a match with a release from Jira, get all the issues and post the issues that are not in the Approved or Done column.

#### **Request Body**
The request must be sent with the following parameters:

| Parameter     | Type   | Required | Description                         |
|--------------|--------|----------|-------------------------------------|
| `versionName` | string | ✅ Yes    | The name of the version being released (e.g., `"iOS Pago 2.24.0"`). You only need one release per platform. If you append with Android, it will just try to recreate the same channel again. |

#### **Example Request**
```bash
curl -X POST https://your-api.com/api/shipmate/reminder \
     -H "Content-Type: application/json" \
     -d '{
           "versionName": "iOS Pago 2.24.0",
         }'
```

### **POST** `/api/shipmate/launch`

This endpoint initiates the launch process by identifying the release scheduled for today and starting the release workflow. If called on a non-release day, it will either send a reminder or create the Slack channel for the release if it hasn't been set up yet.
### **Example Request**
```bash
curl -X POST https://your-api.com/api/shipmate/launch \
     -H "Content-Type: application/json" \
```
