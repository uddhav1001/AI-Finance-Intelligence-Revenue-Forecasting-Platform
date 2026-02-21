const { spawn } = require('child_process');
const path = require('path');

const testSpawn = () => {
    const scriptPath = path.join(__dirname, '..', 'scripts', 'forecast_revenue.py');
    console.log(`Script Path: ${scriptPath}`);

    const pythonProcess = spawn('python', [scriptPath]);

    const mockData = [
        { "date": "2026-02-11", "amount": 100 },
        { "date": "2026-02-14", "amount": 150 },
        { "date": "2026-02-14", "amount": 200 }
    ];

    let dataString = '';

    pythonProcess.stdout.on('data', (data) => {
        console.log(`STDOUT data received: ${data.length} bytes`);
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        if (code !== 0) {
            console.error("Failed.");
        } else {
            console.log("Success!");
            try {
                const result = JSON.parse(dataString);
                console.log("Parsed JSON length:", result.length);
                if (result.length > 0) {
                    console.log("First item:", result[0]);
                } else {
                    console.log("Empty result:", result);
                }
            } catch (e) {
                console.error("JSON Parse Error:", e);
                console.log("Raw Output:", dataString);
            }
        }
    });

    pythonProcess.stdin.write(JSON.stringify(mockData));
    pythonProcess.stdin.end();

    pythonProcess.on('error', (err) => {
        console.error("Failed to spawn python:", err);
    });
};

testSpawn();
