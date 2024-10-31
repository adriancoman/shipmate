const axios = require('axios');
const jiraApiBase = "https://pagojira.atlassian.net/rest/api/3/";
const jiraProject = "project/PAGO/"
const { formatIssues } = require('../utils/helpers');
let JIRA_HEADERS = "";

function setJiraHeaders(jiraHeaders) {
    JIRA_HEADERS = jiraHeaders
}

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

module.exports = { setJiraHeaders, getPendingReleases, getIssueInRelease };
