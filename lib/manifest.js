(function () {
  "use strict";

  window.__BRAND__ = {
    brand: "Abogado Neuquén",
    tagline: "Abogados en Neuquén",

    // Integrantes del equipo. Para sumar profesionales, agregar un objeto acá:
    // el sitio (home y página El equipo) se arma solo a partir de esta lista.
    team: [
      {
        name: "Nicolás Camilo Echevarría",
        role: "Abogado",
        matricula: "Matrícula N° 4085",
        photo: "assets/img/nicolas.jpg",
        focus: "Derecho penal · Nuevas tecnologías aplicadas al proceso",
        bio: [
          "Abogado matriculado en el Colegio de Abogados de Neuquén. Trabaja principalmente en derecho penal, junto a la investigación jurídica y el impacto de las nuevas tecnologías en el sistema de justicia.",
          "Su formación combina el litigio penal con una mirada crítica sobre la prueba: investigaciones de posgrado sobre el estándar probatorio en causas de narcocriminalidad y sobre la predicción de riesgo criminal mediante inteligencia artificial, ambas calificadas con distinción.",
          "A esa formación se suma la experiencia en asesoría legislativa y en la gestión procesal cotidiana: redacción de proyectos, análisis normativo, diligenciamiento y acompañamiento en audiencias."
        ],
        data: [
          ["Matrícula", "N° 4085 — Colegio de Abogados de Neuquén"],
          ["Título de grado", "Abogacía — Universidad Católica de Salta (UCASAL)"],
          ["Diplomatura", "Narcocriminalidad y Microtráfico — UFLO Universidad"],
          ["Diplomatura", "Inteligencia Artificial — Universidad Nacional del Comahue"],
          ["Experiencia", "Asesoría legislativa y gestión procesal"],
          ["Idiomas", "Español · Inglés (conversacional)"]
        ],
        // Certificados propios de este profesional (no se mezclan con los de otros)
        credentials: [
          { title: "Diplomatura en Narcocriminalidad y Microtráfico", issuer: "UFLO Universidad", year: "2025", tag: "Tesis: Distinguido 9", file: "assets/certs/diplomatura-narcocriminalidad.pdf", image: "assets/certs/diplomatura-narcocriminalidad.jpg" },
          { title: "Litigación Penal en Procesos Acusatorios (CPP Federal)", issuer: "Univ. Nacional del Comahue", year: "2024", tag: "Penal", file: "assets/certs/litigacion-penal-acusatoria.pdf", image: "assets/certs/litigacion-penal-acusatoria.jpg" },
          { title: "Justicia Penal en la Era Digital: I.A. y Prueba", issuer: "F.A.M.", year: "2025", tag: "Penal · Tecnología", file: "assets/certs/justicia-penal-era-digital.pdf", image: "assets/certs/justicia-penal-era-digital.jpg" },
          { title: "Juicio por Jurados — Justicia Federal", issuer: "JUTOF", year: "2025", tag: "Penal", file: "assets/certs/juicio-por-jurados.pdf", image: "assets/certs/juicio-por-jurados.jpg" },
          { title: "Una Década del Código Procesal Penal del Neuquén", issuer: "UCASAL", year: "2024", tag: "Procesal penal", file: "assets/certs/codigo-procesal-penal-neuquen.pdf", image: "assets/certs/codigo-procesal-penal-neuquen.jpg" },
          { title: "Inteligencia Artificial aplicada al Derecho", issuer: "CAyPN", year: "2024", tag: "Tecnología", file: "assets/certs/ia-en-el-derecho.pdf", image: "assets/certs/ia-en-el-derecho.jpg" },
          { title: "Posgrado para Jóvenes Profesionales de la Abogacía", issuer: "CAyPN", year: "2025", tag: "Formación", file: "assets/certs/posgrado-jovenes-abogados.pdf", image: "assets/certs/posgrado-jovenes-abogados.jpg" },
          { title: "Seminario sobre Ley Bases", issuer: "CAyPN", year: "2024", tag: "Actualización", file: "assets/certs/ley-bases.pdf", image: "assets/certs/ley-bases.jpg" },
          { title: "Encuentro de Abogacía Joven", issuer: "Colegio de Abogacía", year: "2024", tag: "Formación", file: "assets/certs/abogacia-joven.pdf", image: "assets/certs/abogacia-joven.jpg" },
          { title: "Ciudadanía Italiana — Masterclass Práctica", issuer: "Destreza Digital", year: "2024", tag: "Migratorio", file: "assets/certs/ciudadania-italiana.pdf", image: "assets/certs/ciudadania-italiana.jpg" }
        ]
      }
    ],

    contact: {
      whatsappNumber: "5492994081616",
      whatsappDisplay: "+54 299 408-1616",
      phoneHref: "tel:+542994081616",
      phoneDisplay: "+54 299 408-1616",
      email: "abogacianqn@gmail.com",
      instagram: "https://www.instagram.com/abogadoneuquen/",
      instagramHandle: "@abogadoneuquen",
      location: "Neuquén Capital, Argentina",
      whatsappMessage: "Hola, quisiera solicitar una consulta."
    },

    // Señales de confianza (franja bajo el hero)
    trust: [
      "Abogados matriculados",
      "Foco en Derecho Penal",
      "Formación continua acreditada",
      "Neuquén Capital y provincia"
    ],

    // Área destacada: Derecho Penal, con sus sub-materias
    criminal: {
      title: "Derecho Penal",
      text: "El área que más trabajamos. Defensa técnica y estrategia desde la primera hora, en las causas donde más está en juego.",
      sub: [
        "Delitos contra la integridad sexual",
        "Portación y tenencia de armas",
        "Homicidios y delitos contra la vida",
        "Narcocriminalidad y microtráfico",
        "Defensa penal e imputados",
        "Investigaciones y excarcelaciones"
      ]
    },

    // Demás materias (se atienden todas)
    areas: [
      {
        title: "Derecho Civil",
        text: "Intervenimos en conflictos entre particulares, tanto en la etapa preventiva como en el litigio.",
        sub: ["Contratos y obligaciones", "Daños y perjuicios", "Propiedad y posesión", "Desalojos", "Cobro de sumas de dinero", "Sucesiones"]
      },
      {
        title: "Derecho Laboral",
        text: "Asesoramos y representamos a trabajadores y empleadores en la instancia administrativa y judicial.",
        sub: ["Despidos y indemnizaciones", "Reclamos salariales", "Accidentes y enfermedades laborales", "Registración deficiente", "Negociación y acuerdos"]
      },
      {
        title: "Derecho de Familia",
        text: "Acompañamos procesos familiares con reserva y trato humano, priorizando los acuerdos cuando es posible.",
        sub: ["Divorcios", "Alimentos", "Cuidado personal y régimen de comunicación", "Violencia familiar", "Filiación"]
      },
      {
        title: "Contravencional y Faltas",
        text: "Defensa en procedimientos contravencionales y administrativos ante organismos municipales y provinciales.",
        sub: ["Actas de infracción", "Faltas municipales", "Procedimientos administrativos", "Recursos y descargos"]
      },
      {
        title: "Asesoramiento legal integral",
        text: "Consultas, revisión de documentación y prevención de conflictos antes de que se transformen en un litigio.",
        sub: ["Consultas y opiniones legales", "Revisión y redacción de contratos", "Cartas documento", "Mediaciones", "Acompañamiento permanente"]
      }
    ],

    // Proceso — voz en plural
    process: [
      { num: "01", title: "Consulta", text: "Escuchamos tu caso y evaluamos la situación con claridad, sin tecnicismos." },
      { num: "02", title: "Análisis", text: "Estudiamos el expediente, los plazos y los riesgos concretos que enfrentás." },
      { num: "03", title: "Estrategia", text: "Diseñamos un plan de acción a medida, con objetivos definidos y realistas." },
      { num: "04", title: "Representación", text: "Te acompañamos en cada instancia, audiencia y presentación del proceso." },
      { num: "05", title: "Seguimiento", text: "Informamos el avance de tu causa de forma permanente y transparente." }
    ]
  };
})();
