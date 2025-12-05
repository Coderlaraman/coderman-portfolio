async function testProfessionalResume() {
  try {
    console.log('🧪 Testing comprehensive professional resume PDF generation...');
    
    const comprehensiveData = {
      fullName: "María González Pérez",
      title: "Ingeniera de Software Senior",
      email: "maria.gonzalez@email.com",
      phone: "+34 600 123 456",
      location: "Madrid, España",
      website: "https://mariagonzalez.dev",
      linkedin: "https://linkedin.com/in/mariagonzalez",
      summary: "Ingeniera de software con más de 8 años de experiencia en desarrollo full-stack. Especializada en aplicaciones web modernas, arquitectura de microservicios y liderazgo técnico. Apasionada por crear soluciones escalables y mentorar a equipos de desarrollo.",
      experience: [
        {
          role: "Senior Full Stack Developer",
          company: "TechCorp Solutions",
          startDate: "2021-03",
          endDate: "Actualidad",
          description: "Lidero el desarrollo de aplicaciones web empresariales usando React, Node.js y AWS. He mejorado el rendimiento de la aplicación en un 40% y reducido los tiempos de carga en un 60%."
        },
        {
          role: "Desarrollador Frontend",
          company: "Digital Innovations",
          startDate: "2019-06",
          endDate: "2021-02",
          description: "Desarrollé interfaces de usuario modernas y responsivas para aplicaciones e-commerce. Implementé un sistema de diseño que mejoró la consistencia visual y redujo el tiempo de desarrollo en un 30%."
        },
        {
          role: "Desarrollador Junior",
          company: "StartUp Lab",
          startDate: "2017-01",
          endDate: "2019-05",
          description: "Participé en el desarrollo de aplicaciones móviles y web para startups emergentes. Contribuí al diseño e implementación de APIs RESTful y bases de datos PostgreSQL."
        }
      ],
      education: [
        {
          degree: "Máster en Ingeniería de Software",
          institution: "Universidad Politécnica de Madrid",
          startDate: "2015-09",
          endDate: "2017-06",
          description: "Especialización en arquitectura de software y sistemas distribuidos. Proyecto final sobre microservicios con calificación de sobresaliente."
        },
        {
          degree: "Grado en Ingeniería Informática",
          institution: "Universidad Complutense de Madrid",
          startDate: "2011-09",
          endDate: "2015-06",
          description: "Formación en desarrollo de software, algoritmos y estructuras de datos. Miembro activo del club de programación competitiva."
        }
      ],
      skills: [
        "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", 
        "AWS", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "Git",
        "Agile", "Scrum", "TDD", "CI/CD", "Microservicios", "GraphQL"
      ],
      languages: [
        { language: "Español", proficiency: "Nativo" },
        { language: "Inglés", proficiency: "Avanzado" },
        { language: "Francés", proficiency: "Intermedio" }
      ],
      projects: [
        {
          name: "Sistema de Gestión Empresarial Cloud",
          technologies: "React, Node.js, AWS, PostgreSQL",
          year: "2023",
          description: "Desarrollé una plataforma empresarial completa que gestiona inventario, ventas y análisis de datos. La solución procesa más de 10,000 transacciones diarias y sirve a 500+ usuarios concurrentes."
        },
        {
          name: "Aplicación de Análisis de Datos",
          technologies: "Python, Pandas, React, D3.js",
          year: "2022",
          description: "Creé una herramienta de visualización de datos que permite a las empresas analizar tendencias de mercado y tomar decisiones informadas. Reduje el tiempo de análisis de datos en un 70%."
        },
        {
          name: "Chatbot Inteligente para Atención al Cliente",
          technologies: "Python, TensorFlow, NLP, Flask",
          year: "2021",
          description: "Implementé un chatbot con procesamiento de lenguaje natural que responde el 85% de consultas de clientes sin intervención humana."
        }
      ]
    };
    
    const response = await fetch('http://localhost:3000/api/resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comprehensiveData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response status text:', response.statusText);
    console.log('✅ Comprehensive professional resume test completed successfully!');
    console.log('📄 Resume ID:', data.id);
    console.log('🎨 PDF should now include:');
    console.log('   • Professional header with photo placeholder');
    console.log('   • Gradient background in professional colors');
    console.log('   • Experience with role as main title, company as subtitle');
    console.log('   • Education with degree as main title, institution as subtitle');
    console.log('   • Skills & Expertise section');
    console.log('   • Languages section with proficiency levels');
    console.log('   • Projects & Achievements section');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProfessionalResume();