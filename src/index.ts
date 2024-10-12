import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 4000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define a simple route
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, this is my Node.js API with TypeScript!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
