async function testRegister() {
    try {
        console.log("Attempting to register user...");
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testuser_' + Date.now(),
                email: 'test_' + Date.now() + '@example.com',
                password: 'password123'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Status ${response.status}: ${JSON.stringify(data)}`);
        }

        console.log("Registration Successful:", data);
    } catch (err) {
        console.error("Registration Failed:", err.message);
    }
}

testRegister();
