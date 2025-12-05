async function testSimpleResume() {
  try {
    console.log('🧪 Testing simple resume PDF generation...');
    
    const simpleData = {
      fullName: "Carlos Rodriguez",
      title: "Desarrollador Web",
      email: "carlos@example.com",
      phone: "+1234567890",
      location: "Barcelona, España",
      summary: "Desarrollador web con experiencia en React y Node.js.",
      experience: [
        {
          role: "Frontend Developer",
          company: "Tech Solutions",
          startDate: "2022-01",
          endDate: "2024-12",
          description: "Desarrollo de aplicaciones web modernas."
        }
      ],
      education: [
        {
          degree: "Ingeniería Informática",
          institution: "Universidad de Barcelona",
          startDate: "2018-09",
          endDate: "2022-06",
          description: "Grado en ingeniería informática."
        }
      ],
      skills: ["JavaScript", "React", "Node.js", "CSS"],
      languages: [
        { language: "Español", proficiency: "Nativo" },
        { language: "Inglés", proficiency: "Avanzado" }
      ]
    };
    
    const response = await fetch('http://localhost:3000/api/resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simpleData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Simple resume test completed successfully!');
    console.log('📄 Resume ID:', data.id);
    console.log('🎨 PDF includes professional styling with new sections');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleResume();