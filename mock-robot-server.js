const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 9090;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

// This is our in-memory "database" for the mock server
const mockTaskLog = [];
let nextTaskId = 1;

/**
 * MOCK: /api/trigger.php endpoint
 * It receives the task and message and saves them to our mock database.
 */
app.post('/api/trigger.php', (req, res) => {
    console.log('================================================');
    console.log('🤖 MOCK /trigger.php: Request Received!');
    console.log('================================================');
    console.log('BODY:', req.body);

    if (req.body.task) {
        const newTask = {
            log_id: nextTaskId++,
            task_name: req.body.task,
            message: req.body.message || 'No message provided', // Save the message
            start_time: new Date().toISOString(),
            pi_status: 'PENDING',
            unity_status: 'PENDING',
            // ... other fields
        };
        
        mockTaskLog.unshift(newTask); // Add to the beginning of the array
        
        console.log(`\n✅ SUCCESS: Task saved to mock DB. Responding with ID: ${newTask.log_id}`);
        res.status(200).send(newTask.log_id.toString());
    } else {
        console.log('\n❌ ERROR: "task" field was missing.');
        res.status(400).send('Error: Missing task field.');
    }
    console.log('================================================\n');
});

/**
 * MOCK: /api/fetch_log.php endpoint
 * It returns the contents of our mock database.
 */
app.get('/api/fetch_log.php', (req, res) => {
    console.log('🤖 MOCK /fetch_log.php: Request Received! Sending log data.');
    // Return the last 10 tasks, just like the real script
    res.status(200).json(mockTaskLog.slice(0, 10));
});


app.listen(PORT, () => {
    console.log(`🤖 Mock Robot API server is running on http://localhost:${PORT}`);
});