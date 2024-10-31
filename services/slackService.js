const axios = require('axios');
const slackApiBase = "https://slack.com/api/";
const { getIssueInRelease } = require('../services/jiraService');
let SLACK_HEADERS = ""

async function sendReminderForRelease(release, versionName) {
    console.log(`Getting issues for the release: ${release.name}`)
    const issueList = await getIssueInRelease(release.id)
    const issueMessage = issueList.join('\n')
    console.log("Sending a Slack message")
    if (issueList.length > 0) {
        await sendMessageToChannel(versionName, `The following ${issueList.length} issues are not resolved for the ${release.name} release:\n${issueMessage}`)
    } else {
        await sendMessageToChannel(versionName, `All the issues for the ${release.name} release are done. Good job.`)
    }
}

function setSlackHeaders(slackHeaders) {
    SLACK_HEADERS = slackHeaders
}

const createSlackChannel = async (name) => {
    const response = await axios.post(
        `${slackApiBase}conversations.create`,
        {
            name,
            is_private: false,
        },
        {
            headers: SLACK_HEADERS,
        }
    );
    console.log(response.data)
    return response.data.channel.id
};

async function setChannelTheme(channelId, channelName, releaseDate) {
    await axios.post(
        `${slackApiBase}chat.postMessage`,
        {
            channel: channelId,
            text: `Hello, this is the release channel for the ${channelName} version of the app scheduled to be delivered on: ${releaseDate}. Let's keep all the discussions regarding this release here. There's a reminder set on the date of the code freeze and on the day of the release to verify that all the tickets are in order. \nReply to this message with the drivers for the release.`
        },
        {
            headers: SLACK_HEADERS,
        }
    );
}

const addUsersToChannel = async (channelId, users) => {
    await axios.post(
        `${slackApiBase}conversations.invite`,
        {
            channel: channelId,
            users,
        },
        {
            headers: SLACK_HEADERS,
        }
    );
};

async function sendMessageToChannel(releaseName, message) {
    const channelName = `release_${releaseName}`;
    const response = await axios.post(
        `${slackApiBase}chat.postMessage`,
        {
            channel: channelName,
            text: message
        },
        {
            headers: SLACK_HEADERS,
        }
    );
}

module.exports = { setSlackHeaders, createSlackChannel, addUsersToChannel, sendReminderForRelease, setChannelTheme, sendMessageToChannel };
