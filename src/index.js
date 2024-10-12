const express = require('express')
const shipmateRoutes = require('../routes/shipmate')
const dotenv = require('dotenv')

dotenv.config()
const app = express()
const port = process.env.PORT || 4000

// Middleware to parse JSON bodies
app.use(express.json())
app.use('/api/shipmate', shipmateRoutes)

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});
