const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const cron = require('node-cron');
const { router: shipmateRoutes, commenceReleaseChecks } = require('../routes/shipmate');

const app = express()
const port = process.env.PORT || 4311

// Middleware to parse JSON bodies
app.use(express.json())
app.use('/api/shipmate', shipmateRoutes)

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});

//every min for testing
// cron.schedule('* * * * *', async () => {

//10 am daily for prod
cron.schedule('0 10 * * *', async () => {
    try {
        await commenceReleaseChecks();
        console.log("Task ran");
    } catch (error) {
        console.error("Error:", error);
    }
});
