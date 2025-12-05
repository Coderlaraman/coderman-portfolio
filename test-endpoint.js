// Test script to simulate the admin form submission
const testData = {
  fullName: "Jaime Sierra Test",
  title: "Senior Software Engineer",
  email: "test@example.com",
  phone: "+1234567890",
  location: "Test City, Country",
  website: "https://test.com",
  linkedin: "https://linkedin.com/in/test",
  summary: "This is a test summary for the resume.",
  experience: [
    {
      role: "Senior Developer",
      company: "Test Company",
      startDate: "2020-01",
      endDate: "2023-12",
      description: "Developed and maintained web applications."
    }
  ],
  education: [
    {
      institution: "Test University",
      degree: "Bachelor of Science in Computer Science",
      startDate: "2015-09",
      endDate: "2019-06",
      description: "Graduated with honors."
    }
  ]
};

async function testEndpoint() {
  try {
    console.log('🧪 Testing POST /api/resume endpoint...');
    console.log('📤 Sending data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3005/api/resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response status text:', response.statusText);
    
    const responseData = await response.json();
    console.log('📥 Response data:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('✅ Test successful!');
    } else {
      console.log('❌ Test failed!');
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error);
  }
}

testEndpoint();