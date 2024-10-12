const express = require('express');
const router = express.Router();
const axios = require('axios');

const userList = 'U6L0U3KQD'

const slackApiBase = "https://slack.com/api/";
let SLACK_HEADERS = ""

const jiraApiBase = "https://pagojira.atlassian.net/rest/api/3/";
const jiraProject = "project/PAGO/"
let JIRA_HEADERS = "";

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
    return response.data.channel.id
};

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

async function setChannelTheme(channelId, channelName, releaseDate) {
    await axios.post(
        `${slackApiBase}chat.postMessage`,
        {
            channel: channelId,
            text: `Hello, this is the release channel for the ${channelName} version of the app scheduled to be delivered on: ${releaseDate}. Let's keep all the discussions regarding this release here. There's a reminder set up before code freeze, on the date of the code freeze, before the release and on the day of the release to verify that all the tickets are in order. \nReply to this message with the drivers for the release.`
        },
        {
            headers: SLACK_HEADERS,
        }
    );
}


async function sendMessageToChannel(channelName, message) {
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


router.post('/', async (req, res) => {
    try {
        SLACK_HEADERS = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        }

        const versionName = getReleaseName(req.body.versionName)

        const releaseDate = req.body.releaseDate

        const channelName = `release_${versionName}`;

        const channelId = await createSlackChannel(channelName);

        await addUsersToChannel(channelId, userList);
        await setChannelTheme(channelId, channelName, releaseDate);

        console.log("Finished");
        res.status(200).send({ message: 'Channel created and user added successfully' });
    } catch (error) {
        console.error("Error occurred: ", error);
        res.status(500).send({ error: 'An error occurred while creating the Slack channel' });
    }
});

const formatIssues = (issues) => {
    return issues
        .filter(issue => issue.fields.status.name.toLowerCase() !== 'done' && issue.fields.status.name.toLowerCase() !== 'deployment ready')
        .map(issue => {
            return `<${`https://pagojira.atlassian.net/browse/${issue.key}`}|${issue.key}> - ${issue.fields.summary} - ${issue.fields.status.name}`;
        });
};

const getReleaseName = (versionName) => {
    return versionName
        .toLowerCase()
        .replace("android", "")
        .replace("ios", "")
        .trim()
        .replace(/\s+/g, "_")
        .replace(/\./g, "-");
};


async function getPendingReleases() {
    const order = "releaseDate"
    const status = "unreleased"
    const maxResults = 10

    const response = await axios.get(
        `${jiraApiBase}${jiraProject}version?orderBy=${order}&status=${status}&maxResults=${maxResults}`,
        {
            headers: JIRA_HEADERS,
        }
    );

    return response.data.values.filter((release) => {
        return !release.name.toLowerCase().includes("backend") && !release.name.toLowerCase().includes("sdk")
    })
}

async function getIssueInRelease(versionId) {

    const response = await axios.get(
        `${jiraApiBase}search?jql=fixVersion=${versionId}`,
        {
            headers: JIRA_HEADERS,
        }
    );

    return formatIssues(response.data.issues)
}

router.get('/reminder', async (req, res) => {
    try {
        SLACK_HEADERS = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        }

        JIRA_HEADERS = {
            Authorization: `Basic ${process.env.JIRA_API_TOKEN}`,
        }

        console.log("Getting pending releases")
        const filteredReleases = await getPendingReleases()

        const releaseOne = filteredReleases[0]
        const releaseTwo = filteredReleases[1]

        console.log("Getting issues for the first release")
        const issuesOne = await getIssueInRelease(releaseOne.id)
        const issuesTwo = await getIssueInRelease(releaseTwo.id)

        const issueOneMessage = issuesOne.join('\n')
        const issueTwoMessage = issuesTwo.join('\n')

        const versionName = getReleaseName(req.body.versionName)
        const channelName = `release_${versionName}`;


        console.log("Sending a Slack message")
        if (issuesOne.length > 0) {
            await sendMessageToChannel(channelName, `The following ${issuesOne.length} issues are not resolved:\n ${issueOneMessage}`)
        }
        if (issuesTwo.length > 0) {
            await sendMessageToChannel(channelName, `The following ${issuesTwo.length} issues are not resolved:\n ${issueTwoMessage}`)
        }

        console.log("All done")
        // const formattedMessage = formatIssues(filteredReleases)
        res.status(200).send({ message: 'Message sent' });
    } catch (error) {
        console.error("Error occurred: ", error);
        res.status(500).send({ error: 'An error occurred while creating the Slack channel' });
    }
})

module.exports = router;