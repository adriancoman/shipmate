const getReleaseName = (versionName) => {
    return versionName
        .toLowerCase()
        .replace(/[^a-z0-9_.-]/g, "")
        .replace("android", "")
        .replace("ios", "")
        .trim()
        .replace(/\s+/g, "_")
        .replace(/\./g, "-")
};

const formatIssues = (issues) => {
    const deployNotNeeded = "Deployment not Needed".toLowerCase()
    const deploymentReady = "Deployment Ready".toLowerCase()
    const deploymentDone = "Done".toLowerCase()
    return issues
        .filter(issue => issue.fields.status.name.toLowerCase() !== deploymentDone && issue.fields.status.name.toLowerCase() !== deploymentReady && issue.fields.status.name.toLowerCase() !== deployNotNeeded)
        .map(issue => {
            return `<${`https://pagojira.atlassian.net/browse/${issue.key}`}|${issue.key}> - ${issue.fields.summary} - ${issue.fields.status.name}`;
        });
};

module.exports = { getReleaseName, formatIssues };
