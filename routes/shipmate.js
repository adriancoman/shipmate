const express = require('express');
const router = express.Router();

const {
    setSlackHeaders,
    createSlackChannel,
    addUsersToChannel,
    setChannelTheme,
    sendReminderForRelease,
    sendMessageToChannel
} = require('../services/slackService');
const {setJiraHeaders, getPendingReleases, getIssueInRelease} = require('../services/jiraService');
const {getReleaseName} = require('../utils/helpers');

// Adi, Oana, Bogdan, Cristi, AdiP, Alina, Bobby, Cosmin, Gabi, Iulian, Adriana, Denisa, Irina, Alex, Diana, Razvan
// const userList = 'U6L0U3KQD, U6MKY6FV3, U03DGS0LCTY, U8A8NP4RM, U03N5CPQDNW, U05RHBS68JC, U03P2B5HXPW, U041XQY19UK, UQZ8LTE0G, U03B4MRFJ5R, U04LEM0ML2W, UP3BV04HJ, U04H8C72QUU, U3CT0797T, UAJ04USK1, U073RF2B5TR'
const userList = 'U6L0U3KQD'

let SLACK_HEADERS = ""
let JIRA_HEADERS = "";

async function createChannel(versionName, releaseDate) {
    const channelName = `release_${versionName}`;

    console.log(`Attempting to create channel with name ${channelName}`)
    const channelId = await createSlackChannel(channelName);

    await addUsersToChannel(channelId, userList);
    await setChannelTheme(channelId, channelName, releaseDate);
}

router.post('/', async (req, res) => {
    try {
        SLACK_HEADERS = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        }
        setSlackHeaders(SLACK_HEADERS) // <--- i need to initialize this later, it doesn't work when i start the app, dunno why
        const versionName = getReleaseName(req.body.versionName)

        const releaseDate = req.body.releaseDate

        await createChannel(versionName, releaseDate);

        console.log("Finished");
        res.status(200).send({message: 'Channel created and user added successfully'});
    } catch (error) {
        console.error("Error occurred: ", error);
        res.status(500).send({error: 'An error occurred while creating the Slack channel'});
    }
});

async function sendTaskReminders(versionName) {
    console.log("Sending task reminders")

    const releases = await getPendingReleases()

    const releasesThatMatch = releases.filter(release => {
        const toCheckReleaseName = getReleaseName(release.name)
        return toCheckReleaseName === versionName
    })
    console.log(releasesThatMatch)
    if (releasesThatMatch.length > 0) {
        await sendReminderForRelease(releasesThatMatch[0], versionName)
    } else {
        console.log("No matching releases found")
    }
    if (releasesThatMatch.length > 1) {
        await sendReminderForRelease(releasesThatMatch[1], versionName)
    }

    console.log("All done")
}

router.get('/reminder', async (req, res) => {
    try {
        SLACK_HEADERS = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        }
        setSlackHeaders(SLACK_HEADERS)

        JIRA_HEADERS = {
            Authorization: `Basic ${process.env.JIRA_API_TOKEN}`,
        }
        setJiraHeaders(JIRA_HEADERS)

        const versionName = getReleaseName(req.body.versionName)
        console.log(`Looking up issues for ${versionName}`)

        console.log("Getting pending releases")
        await sendTaskReminders(versionName);

        res.status(200).send({message: 'Message sent'});
    } catch (error) {
        console.error("Error occurred: ", error);
        res.status(500).send({error: 'An error occurred while sending the reminder'});
    }
})

router.get('/launch', async (req, res) => {
    JIRA_HEADERS = {
        Authorization: `Basic ${process.env.JIRA_API_TOKEN}`,
    }
    setJiraHeaders(JIRA_HEADERS)

    SLACK_HEADERS = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
    }
    setSlackHeaders(SLACK_HEADERS)

    const releases = await getPendingReleases()

    //format the naming
    releases.map(release => {
        release.name = getReleaseName(release.name)
    })

    //remove Android/iOS duplicates
    const uniqueReleases = releases.filter((release, index, self) =>
        index === self.findIndex((r) => r.name === release.name)
    );

    const nextRelease = uniqueReleases[1]
    const releaseDate = new Date(nextRelease.releaseDate)
    const today = new Date()
    console.log(`Next release is:`)
    console.log(nextRelease)

    const differenceInTime = releaseDate - today;
    const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24))

    console.log(differenceInDays)
    if (differenceInDays === 9) { //monday prev week
        await createChannel(nextRelease.name, releaseDate);
    }

    if (differenceInDays === 2) { // tuesday same week
        await sendTaskReminders(nextRelease.name);
        await sendMessageToChannel(nextRelease.name, `When the code freeze is done, add your builds bellow. Create a separate thread for every issue you may find during testing.`)

    }

    if (differenceInDays === 0) { // release day omg
        await sendTaskReminders(nextRelease.name);
        await sendMessageToChannel(nextRelease.name, `Code freeze period is over. If testing complete, please review that all issues found during the code freeze period are included in the release and let's launch. Awaiting QA and PM approvals.`)
    }
    res.status(200).send({message: 'Done'});
})

module.exports = router;