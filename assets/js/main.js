// Dr. Gabriel Galeb — navigation, translations and before/after comparison.
(() => {
  'use strict';

  const translations = {
    pt: {
      meta: {
        title: 'Dr. Gabriel Galeb | Transplante Capilar em Alphaville, SP',
        description: 'Dr. Gabriel Galeb, médico cirurgião capilar em Alphaville, Barueri, na Grande São Paulo. Transplante capilar masculino, MMP capilar e avaliação personalizada.',
        ogDescription: 'Ciência, arte e precisão na restauração capilar em Alphaville, Barueri. Conheça o Dr. Gabriel Galeb e resultados reais de pacientes.',
        locale: 'pt_BR',
      },
      accessibility: {
        skip: 'Ir para o conteúdo principal',
        contactInfo: 'Informações de contato',
        home: 'Página inicial Dr. Gabriel Galeb',
        primaryNav: 'Navegação principal',
        languageSelector: 'Selecionar idioma',
        openMenu: 'Abrir menu',
        closeMenu: 'Fechar menu',
        achievements: 'Experiência do Dr. Gabriel Galeb',
        credentials: 'Credenciais do Dr. Gabriel Galeb',
        caseNavigation: 'Navegação entre casos',
        previousCase: 'Caso anterior',
        nextCase: 'Próximo caso',
        comparisonSlider: 'Comparar antes e depois',
        chooseCase: 'Escolher caso',
        caseButton: 'Exibir caso {case}',
      },
      topbar: { location: 'Alphaville · Barueri · SP', specialty: 'Cirurgia e restauração capilar' },
      brand: { subtitle: 'Transplante Capilar · São Paulo' },
      nav: { doctor: 'O Médico', solutions: 'Soluções', results: 'Resultados', simulator: 'Simulador IA', journey: 'Jornada', testimonials: 'Depoimentos', contact: 'Contato' },
      actions: { scheduleShort: 'Agendar', scheduleEvaluation: 'Agendar Avaliação', seeResults: 'Ver Resultados', learnMore: 'Saiba Mais', scheduleConsultation: 'Agendar Consulta' },
      hero: {
        eyebrow: 'Transplante Capilar · Alphaville · São Paulo',
        title: 'Recupere sua confiança.<br><em>Renove sua identidade.</em>',
        body: 'Ciência, arte e precisão em uma abordagem personalizada para restauração capilar.',
        tagline: '+1.000 procedimentos · +10 anos de experiência',
      },
      doctor: { role: 'Médico Cirurgião Capilar' },
      stats: { procedures: 'Procedimentos', experience: 'Anos de experiência' },
      images: { doctorHero: 'Dr. Gabriel Galeb em atendimento clínico', doctorAbout: 'Retrato do Dr. Gabriel Galeb' },
      about: {
        eyebrow: 'O Médico',
        title: 'Ciência, arte e precisão na <em>restauração capilar.</em>',
        body: 'O Dr. Gabriel Galeb dedica sua carreira à excelência técnica e ao detalhismo estético. Sua abordagem combina inovação cirúrgica com um olhar artístico, garantindo resultados que respeitam a anatomia natural e devolvem a autoestima de forma definitiva.',
        credentialAmerican: 'Membro da Sociedade Americana de Cirurgia Capilar e Estética',
        membership: 'Membro',
        credentialBrazilian: 'Sociedade Brasileira de Cirurgia Capilar',
        credentialMba: 'Gestão em Saúde pela Faculdade Israelita Albert Einstein',
        credentialFellow: 'Restauração Capilar pela ASAHRS',
      },
      services: {
        eyebrow: 'Soluções',
        title: 'Soluções <em>sob medida</em>.',
        intro: 'Planejamento individual para alinhar expectativas, indicação clínica e resultados.',
        serviceTag: 'Tratamento',
        firstStep: 'Primeiro passo',
        transplantTitle: 'Transplante Capilar <em>Masculino</em>',
        transplantPlain: 'Transplante Capilar Masculino',
        transplantBody: 'Técnica FUE avançada para restauração capilar com foco em densidade e naturalidade.',
        mmpTitle: 'MMP <em>Capilar</em>',
        mmpBody: 'Microinfusão de ativos para combater o afinamento e promover o vigor capilar.',
        evaluationTitle: 'Avaliação <em>Personalizada</em>',
        evaluationBody: 'Consulta detalhada para compreender cada caso e alinhar expectativas e possibilidades.',
      },
      results: {
        eyebrow: 'Resultados',
        title: 'Resultados <em>antes e depois</em>.',
        intro: 'A excelência técnica refletida na transformação real de pacientes da clínica.',
        before: 'Antes',
        after: 'Depois',
        sliderInstruction: 'Arraste a linha para comparar a imagem de antes com a de depois.',
        note: 'Cada organismo responde de forma individual. A avaliação médica é essencial para entender as possibilidades de cada caso.',
      },
      gallery: { eyebrow: 'Galeria', title: 'O resultado, <em>sem distrações</em>.', intro: 'Uma galeria dedicada somente às imagens de depois.' },
      simulator: {
        badge: 'Nova tecnologia', eyebrow: 'Simulador Capilar IA',
        title: 'Veja uma possibilidade<br><em>antes da sua avaliação.</em>',
        body: 'Conheça a nova experiência de simulação visual do Dr. Gabriel Galeb. Em um acesso individual e protegido, envie uma fotografia, explore até cinco prévias personalizadas e compartilhe seu interesse com a equipe.',
        benefitAccount: 'Cadastro com solicitação de contato', benefitUses: 'Até cinco simulações por conta', benefitPrivacy: 'Imagens privadas e protegidas',
        cta: 'Criar minha simulação', opensTab: 'Abre em uma nova aba segura',
        disclaimer: 'A simulação é ilustrativa, não substitui avaliação médica e não representa previsão ou garantia de resultado. O cadastro é necessário antes do uso.',
        previewPrivate: 'Acesso individual', previewLabel: 'Prévia visual ilustrativa', previewAlt: 'Representação gráfica da experiência de simulação capilar',
        previewCaption: 'Representação da experiência digital. A prévia real é criada a partir da fotografia enviada pelo próprio usuário.',
      },
      diffs: {
        eyebrow: 'A diferença', title: 'O padrão que nos <em>distingue</em>.',
        personalTitle: 'Atendimento Personalizado', personalBody: 'Cuidado humanizado e exclusivo desenhado para cada paciente.',
        planningTitle: 'Planejamento Individual', planningBody: 'Arquitetura capilar baseada nas proporções únicas do seu rosto.',
        techTitle: 'Tecnologia Avançada', techBody: 'Técnicas FUE e MMP sofisticadas para um cuidado preciso.',
        naturalTitle: 'Resultados Naturais', naturalBody: 'Harmonia estética entre densidade e direção capilar natural.',
        followupTitle: 'Acompanhamento Completo', followupBody: 'Assistência médica dedicada do primeiro contato ao pós-operatório.',
      },
      journey: {
        eyebrow: 'A jornada', title: 'Sua jornada de <em>transformação</em>.',
        consultTitle: 'Consulta Inicial', consultBody: 'Avaliação detalhada do couro cabeludo e definição da estratégia personalizada.',
        planTitle: 'Planejamento', planBody: 'Mapeamento preciso da área doadora e receptora para máxima naturalidade.',
        procedureTitle: 'Procedimento', procedureBody: 'Realização do transplante com técnica FUE avançada e foco no conforto.',
        recoveryTitle: 'Recuperação', recoveryBody: 'Protocolos de pós-operatório para favorecer a cicatrização ideal.',
        resultTitle: 'Resultado Final', resultBody: 'Evolução natural dos fios, resgatando identidade e confiança.',
      },
      testimonials: {
        eyebrow: 'Depoimentos', title: 'Experiências que <em>falam por si</em>.',
        rafaelQuote: 'O resultado superou todas as minhas expectativas. A precisão técnica do Dr. Gabriel é aliada a um senso artístico raro na restauração capilar moderna.',
        marceloQuote: 'Desde a primeira consulta senti total confiança. O atendimento é primoroso e o acompanhamento pós-operatório faz toda a diferença para o resultado final.',
        andreQuote: 'A naturalidade foi o ponto alto. Ninguém percebe que fiz um procedimento, apenas comentam que pareço mais renovado e com uma imagem revigorada.',
      },
      cta: { eyebrow: 'Próximo passo', title: 'Pronto para <em>começar</em>?', body: 'Recupere sua identidade com planejamento personalizado e resultados de excelência. Atendimento em Alphaville, Barueri, na Grande São Paulo.' },
      footer: { summary: 'Ciência, arte e precisão na restauração capilar, com atendimento personalizado em Alphaville, Barueri.', procedures: 'Procedimentos', specializedTreatment: 'Tratamento Especializado', contact: 'Contato', location: 'Localização', rights: 'Todos os direitos reservados.' },
      ui: {
        case: 'Caso', of: 'de', beforeAlt: 'Caso {case} antes do procedimento capilar', afterAlt: 'Caso {case} depois do procedimento capilar', galleryAlt: 'Resultado do caso {case}', caseChanged: 'Caso {case} exibido.', valueText: '{value}% da imagem de depois visível',
      },
      whatsapp: {
        schedule: 'Olá Dr. Gabriel, gostaria de agendar uma avaliação.',
        transplant: 'Olá Dr. Gabriel, gostaria de saber mais sobre transplante capilar masculino.',
        mmp: 'Olá Dr. Gabriel, gostaria de saber mais sobre MMP capilar.',
      },
    },
    es: {
      meta: {
        title: 'Dr. Gabriel Galeb | Trasplante Capilar en Alphaville, SP',
        description: 'Dr. Gabriel Galeb, médico cirujano capilar en Alphaville, Barueri, Gran São Paulo. Trasplante capilar masculino, MMP capilar y evaluación personalizada.',
        ogDescription: 'Ciencia, arte y precisión en restauración capilar en Alphaville, Barueri. Conoce al Dr. Gabriel Galeb y resultados reales de pacientes.',
        locale: 'es_ES',
      },
      accessibility: {
        skip: 'Ir al contenido principal', contactInfo: 'Información de contacto', home: 'Página de inicio del Dr. Gabriel Galeb', primaryNav: 'Navegación principal', languageSelector: 'Seleccionar idioma', openMenu: 'Abrir menú', closeMenu: 'Cerrar menú', achievements: 'Experiencia del Dr. Gabriel Galeb', credentials: 'Credenciales del Dr. Gabriel Galeb', caseNavigation: 'Navegación entre casos', previousCase: 'Caso anterior', nextCase: 'Siguiente caso', comparisonSlider: 'Comparar antes y después', chooseCase: 'Elegir caso', caseButton: 'Mostrar caso {case}',
      },
      topbar: { location: 'Alphaville · Barueri · SP', specialty: 'Cirugía y restauración capilar' },
      brand: { subtitle: 'Trasplante Capilar · São Paulo' },
      nav: { doctor: 'El Médico', solutions: 'Soluciones', results: 'Resultados', simulator: 'Simulador IA', journey: 'Proceso', testimonials: 'Testimonios', contact: 'Contacto' },
      actions: { scheduleShort: 'Agendar', scheduleEvaluation: 'Agendar Evaluación', seeResults: 'Ver Resultados', learnMore: 'Saber Más', scheduleConsultation: 'Agendar Consulta' },
      hero: { eyebrow: 'Trasplante Capilar · Alphaville · São Paulo', title: 'Recupera tu confianza.<br><em>Renueva tu identidad.</em>', body: 'Ciencia, arte y precisión en un enfoque personalizado para la restauración capilar.', tagline: '+1.000 procedimientos · +10 años de experiencia' },
      doctor: { role: 'Médico Cirujano Capilar' },
      stats: { procedures: 'Procedimientos', experience: 'Años de experiencia' },
      images: { doctorHero: 'Dr. Gabriel Galeb durante una atención clínica', doctorAbout: 'Retrato del Dr. Gabriel Galeb' },
      about: {
        eyebrow: 'El Médico', title: 'Ciencia, arte y precisión en la <em>restauración capilar.</em>', body: 'El Dr. Gabriel Galeb dedica su carrera a la excelencia técnica y al detalle estético. Su enfoque combina innovación quirúrgica con una mirada artística, logrando resultados que respetan la anatomía natural y recuperan la autoestima de forma definitiva.', credentialAmerican: 'Miembro de la Sociedad Americana de Cirugía Capilar y Estética', membership: 'Miembro', credentialBrazilian: 'Sociedad Brasileña de Cirugía Capilar', credentialMba: 'Gestión de Salud por la Facultad Israelita Albert Einstein', credentialFellow: 'Restauración Capilar por ASAHRS',
      },
      services: {
        eyebrow: 'Soluciones', title: 'Soluciones <em>a medida</em>.', intro: 'Planificación individual para alinear expectativas, indicación clínica y resultados.', serviceTag: 'Tratamiento', firstStep: 'Primer paso', transplantTitle: 'Trasplante Capilar <em>Masculino</em>', transplantPlain: 'Trasplante Capilar Masculino', transplantBody: 'Técnica FUE avanzada para restauración capilar con foco en densidad y naturalidad.', mmpTitle: 'MMP <em>Capilar</em>', mmpBody: 'Microinfusión de activos para combatir el afinamiento y favorecer el vigor capilar.', evaluationTitle: 'Evaluación <em>Personalizada</em>', evaluationBody: 'Consulta detallada para comprender cada caso y alinear expectativas y posibilidades.',
      },
      results: { eyebrow: 'Resultados', title: 'Resultados <em>antes y después</em>.', intro: 'La excelencia técnica reflejada en la transformación real de pacientes de la clínica.', before: 'Antes', after: 'Después', sliderInstruction: 'Arrastra la línea para comparar la imagen de antes con la de después.', note: 'Cada organismo responde de forma individual. La evaluación médica es esencial para comprender las posibilidades de cada caso.' },
      gallery: { eyebrow: 'Galería', title: 'El resultado, <em>sin distracciones</em>.', intro: 'Una galería dedicada únicamente a las imágenes de después.' },
      simulator: {
        badge: 'Nueva tecnología', eyebrow: 'Simulador Capilar IA',
        title: 'Visualiza una posibilidad<br><em>antes de tu evaluación.</em>',
        body: 'Conoce la nueva experiencia de simulación visual del Dr. Gabriel Galeb. En un acceso individual y protegido, sube una fotografía, explora hasta cinco vistas previas personalizadas y comparte tu interés con el equipo.',
        benefitAccount: 'Registro con solicitud de contacto', benefitUses: 'Hasta cinco simulaciones por cuenta', benefitPrivacy: 'Imágenes privadas y protegidas',
        cta: 'Crear mi simulación', opensTab: 'Se abre en una nueva pestaña segura',
        disclaimer: 'La simulación es ilustrativa, no sustituye una evaluación médica y no representa una predicción ni garantía de resultados. Es necesario registrarse antes de usarla.',
        previewPrivate: 'Acceso individual', previewLabel: 'Vista previa visual ilustrativa', previewAlt: 'Representación gráfica de la experiencia de simulación capilar',
        previewCaption: 'Representación de la experiencia digital. La vista previa real se crea a partir de la fotografía enviada por el propio usuario.',
      },
      diffs: {
        eyebrow: 'La diferencia', title: 'El estándar que nos <em>distingue</em>.', personalTitle: 'Atención Personalizada', personalBody: 'Cuidado humano y exclusivo diseñado para cada paciente.', planningTitle: 'Planificación Individual', planningBody: 'Arquitectura capilar basada en las proporciones únicas de tu rostro.', techTitle: 'Tecnología Avanzada', techBody: 'Técnicas FUE y MMP sofisticadas para un cuidado preciso.', naturalTitle: 'Resultados Naturales', naturalBody: 'Armonía estética entre densidad y dirección natural del cabello.', followupTitle: 'Seguimiento Completo', followupBody: 'Asistencia médica dedicada desde el primer contacto hasta el posoperatorio.',
      },
      journey: {
        eyebrow: 'El proceso', title: 'Tu proceso de <em>transformación</em>.', consultTitle: 'Consulta Inicial', consultBody: 'Evaluación detallada del cuero cabelludo y definición de una estrategia personalizada.', planTitle: 'Planificación', planBody: 'Mapeo preciso de las áreas donante y receptora para máxima naturalidad.', procedureTitle: 'Procedimiento', procedureBody: 'Trasplante con técnica FUE avanzada y foco en la comodidad.', recoveryTitle: 'Recuperación', recoveryBody: 'Protocolos posoperatorios para favorecer una cicatrización ideal.', resultTitle: 'Resultado Final', resultBody: 'Evolución natural del cabello, recuperando identidad y confianza.',
      },
      testimonials: {
        eyebrow: 'Testimonios', title: 'Experiencias que <em>hablan por sí solas</em>.', rafaelQuote: 'El resultado superó todas mis expectativas. La precisión técnica del Dr. Gabriel se une a un sentido artístico poco común en la restauración capilar moderna.', marceloQuote: 'Desde la primera consulta sentí total confianza. La atención es excelente y el seguimiento posoperatorio marca toda la diferencia en el resultado final.', andreQuote: 'La naturalidad fue lo más destacado. Nadie nota que me hice un procedimiento; solo comentan que me veo más renovado y con una imagen revitalizada.',
      },
      cta: { eyebrow: 'Siguiente paso', title: '¿Listo para <em>comenzar</em>?', body: 'Recupera tu identidad con planificación personalizada y resultados de excelencia. Atención en Alphaville, Barueri, Gran São Paulo.' },
      footer: { summary: 'Ciencia, arte y precisión en restauración capilar, con atención personalizada en Alphaville, Barueri.', procedures: 'Procedimientos', specializedTreatment: 'Tratamiento Especializado', contact: 'Contacto', location: 'Ubicación', rights: 'Todos los derechos reservados.' },
      ui: { case: 'Caso', of: 'de', beforeAlt: 'Caso {case} antes del procedimiento capilar', afterAlt: 'Caso {case} después del procedimiento capilar', galleryAlt: 'Resultado del caso {case}', caseChanged: 'Caso {case} mostrado.', valueText: '{value}% de la imagen de después visible' },
      whatsapp: { schedule: 'Hola Dr. Gabriel, me gustaría agendar una evaluación.', transplant: 'Hola Dr. Gabriel, me gustaría saber más sobre el trasplante capilar masculino.', mmp: 'Hola Dr. Gabriel, me gustaría saber más sobre MMP capilar.' },
    },
    en: {
      meta: {
        title: 'Dr. Gabriel Galeb | Hair Transplant in Alphaville, SP',
        description: 'Dr. Gabriel Galeb, hair restoration surgeon in Alphaville, Barueri, Greater São Paulo. Male hair transplant, MMP hair treatment and personalized assessment.',
        ogDescription: 'Science, artistry and precision in hair restoration in Alphaville, Barueri. Meet Dr. Gabriel Galeb and see real patient results.',
        locale: 'en_US',
      },
      accessibility: {
        skip: 'Skip to main content', contactInfo: 'Contact information', home: 'Dr. Gabriel Galeb home page', primaryNav: 'Primary navigation', languageSelector: 'Select language', openMenu: 'Open menu', closeMenu: 'Close menu', achievements: 'Dr. Gabriel Galeb’s experience', credentials: 'Dr. Gabriel Galeb’s credentials', caseNavigation: 'Case navigation', previousCase: 'Previous case', nextCase: 'Next case', comparisonSlider: 'Compare before and after', chooseCase: 'Choose a case', caseButton: 'Show case {case}',
      },
      topbar: { location: 'Alphaville · Barueri · SP', specialty: 'Hair surgery and restoration' },
      brand: { subtitle: 'Hair Transplant · São Paulo' },
      nav: { doctor: 'The Doctor', solutions: 'Solutions', results: 'Results', simulator: 'AI Simulator', journey: 'Journey', testimonials: 'Testimonials', contact: 'Contact' },
      actions: { scheduleShort: 'Book', scheduleEvaluation: 'Book an Assessment', seeResults: 'See Results', learnMore: 'Learn More', scheduleConsultation: 'Book a Consultation' },
      hero: { eyebrow: 'Hair Transplant · Alphaville · São Paulo', title: 'Restore your confidence.<br><em>Renew your identity.</em>', body: 'Science, artistry and precision in a personalized approach to hair restoration.', tagline: '1,000+ procedures · 10+ years of experience' },
      doctor: { role: 'Hair Restoration Surgeon' },
      stats: { procedures: 'Procedures', experience: 'Years of experience' },
      images: { doctorHero: 'Dr. Gabriel Galeb during a clinical appointment', doctorAbout: 'Portrait of Dr. Gabriel Galeb' },
      about: {
        eyebrow: 'The Doctor', title: 'Science, artistry and precision in <em>hair restoration.</em>', body: 'Dr. Gabriel Galeb has dedicated his career to technical excellence and aesthetic detail. His approach combines surgical innovation with an artistic eye, delivering results that respect natural anatomy and restore self-confidence.', credentialAmerican: 'Member of the American Society of Aesthetic and Hair Restoration Surgeons', membership: 'Member', credentialBrazilian: 'Brazilian Society of Hair Surgery', credentialMba: 'Healthcare Management at Faculdade Israelita Albert Einstein', credentialFellow: 'Hair Restoration through ASAHRS',
      },
      services: {
        eyebrow: 'Solutions', title: 'Solutions <em>tailored to you</em>.', intro: 'Individual planning to align expectations, clinical indication and results.', serviceTag: 'Treatment', firstStep: 'First step', transplantTitle: 'Male <em>Hair Transplant</em>', transplantPlain: 'Male Hair Transplant', transplantBody: 'Advanced FUE hair restoration focused on density and natural-looking results.', mmpTitle: '<em>MMP</em> Hair Treatment', mmpBody: 'Microinfusion of active ingredients to address thinning and support hair strength.', evaluationTitle: 'Personalized <em>Assessment</em>', evaluationBody: 'A detailed consultation to understand each case and align expectations with possibilities.',
      },
      results: { eyebrow: 'Results', title: '<em>Before and after</em> results.', intro: 'Technical excellence reflected in real patient transformations at the clinic.', before: 'Before', after: 'After', sliderInstruction: 'Drag the line to compare the before and after images.', note: 'Every person responds differently. A medical assessment is essential to understand what may be possible in each case.' },
      gallery: { eyebrow: 'Gallery', title: 'The result, <em>without distractions</em>.', intro: 'A gallery dedicated exclusively to the after images.' },
      simulator: {
        badge: 'New technology', eyebrow: 'AI Hair Simulator',
        title: 'Visualize a possibility<br><em>before your assessment.</em>',
        body: 'Discover Dr. Gabriel Galeb’s new visual simulation experience. In an individual, protected account, upload a photograph, explore up to five personalized previews, and share your interest with the team.',
        benefitAccount: 'Registration with a callback request', benefitUses: 'Up to five simulations per account', benefitPrivacy: 'Private, protected images',
        cta: 'Create my simulation', opensTab: 'Opens in a new secure tab',
        disclaimer: 'The simulation is illustrative, does not replace a medical assessment, and is not a prediction or guarantee of results. Registration is required before use.',
        previewPrivate: 'Individual access', previewLabel: 'Illustrative visual preview', previewAlt: 'Graphic representation of the hair simulation experience',
        previewCaption: 'Representation of the digital experience. The actual preview is created from the photograph uploaded by the user.',
      },
      diffs: {
        eyebrow: 'The difference', title: 'The standard that <em>sets us apart</em>.', personalTitle: 'Personalized Care', personalBody: 'Thoughtful, individual care designed for every patient.', planningTitle: 'Individual Planning', planningBody: 'Hairline architecture based on the unique proportions of your face.', techTitle: 'Advanced Technology', techBody: 'Sophisticated FUE and MMP techniques for precise care.', naturalTitle: 'Natural Results', naturalBody: 'Aesthetic harmony between density and natural hair direction.', followupTitle: 'Complete Follow-up', followupBody: 'Dedicated medical support from first contact through postoperative care.',
      },
      journey: {
        eyebrow: 'The journey', title: 'Your <em>transformation journey</em>.', consultTitle: 'Initial Consultation', consultBody: 'Detailed scalp assessment and definition of a personalized strategy.', planTitle: 'Planning', planBody: 'Precise mapping of donor and recipient areas for maximum naturalness.', procedureTitle: 'Procedure', procedureBody: 'Advanced FUE transplantation with a focus on comfort.', recoveryTitle: 'Recovery', recoveryBody: 'Postoperative protocols designed to support ideal healing.', resultTitle: 'Final Result', resultBody: 'Natural hair development that restores identity and confidence.',
      },
      testimonials: {
        eyebrow: 'Testimonials', title: 'Experiences that <em>speak for themselves</em>.', rafaelQuote: 'The result exceeded all my expectations. Dr. Gabriel’s technical precision is paired with an artistic sensibility rarely seen in modern hair restoration.', marceloQuote: 'I felt completely confident from the first consultation. The care is outstanding, and the postoperative follow-up makes all the difference to the final result.', andreQuote: 'Naturalness was the highlight. No one can tell I had a procedure; they only say I look refreshed and revitalized.',
      },
      cta: { eyebrow: 'Next step', title: 'Ready to <em>begin</em>?', body: 'Restore your identity with personalized planning and excellent results. Appointments in Alphaville, Barueri, Greater São Paulo.' },
      footer: { summary: 'Science, artistry and precision in hair restoration, with personalized care in Alphaville, Barueri.', procedures: 'Procedures', specializedTreatment: 'Specialized Treatment', contact: 'Contact', location: 'Location', rights: 'All rights reserved.' },
      ui: { case: 'Case', of: 'of', beforeAlt: 'Case {case} before the hair procedure', afterAlt: 'Case {case} after the hair procedure', galleryAlt: 'Result for case {case}', caseChanged: 'Case {case} displayed.', valueText: '{value}% of the after image visible' },
      whatsapp: { schedule: 'Hello Dr. Gabriel, I would like to book an assessment.', transplant: 'Hello Dr. Gabriel, I would like to learn more about male hair transplantation.', mmp: 'Hello Dr. Gabriel, I would like to learn more about MMP hair treatment.' },
    },
  };

  const supportedLanguages = ['pt', 'es', 'en'];
  const htmlLanguage = { pt: 'pt-BR', es: 'es', en: 'en' };
  const caseStudies = Array.from({ length: 6 }, (_, index) => {
    const caseNumber = String(index + 1).padStart(2, '0');
    return {
      before: `/assets/img/case-${caseNumber}-before.webp`,
      after: `/assets/img/case-${caseNumber}-after.webp`,
    };
  });

  let currentLanguage = 'pt';
  let currentCase = 0;

  const getTranslation = (key, language = currentLanguage) => {
    const value = key.split('.').reduce((node, segment) => node?.[segment], translations[language]);
    if (typeof value === 'string') return value;
    return key.split('.').reduce((node, segment) => node?.[segment], translations.pt) ?? key;
  };

  const format = (template, values) => Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );

  const twoDigitCase = (index) => String(index + 1).padStart(2, '0');

  const comparison = document.querySelector('[data-comparison]');
  const beforeImage = comparison?.querySelector('[data-before-image]');
  const afterImage = comparison?.querySelector('[data-after-image]');
  const comparisonRange = comparison?.querySelector('[data-comparison-range]');
  const comparisonCounter = document.getElementById('comparisonCounter');
  const comparisonLive = comparison?.querySelector('[data-comparison-live]');
  const comparisonDots = [...document.querySelectorAll('[data-case-index]')];

  const setComparisonValue = (value) => {
    if (!comparisonRange || !comparison) return;
    const normalizedValue = Math.min(100, Math.max(0, Number(value)));
    comparisonRange.value = String(normalizedValue);
    comparison.querySelector('.comparison-frame')?.style.setProperty('--reveal', `${normalizedValue}%`);
    comparisonRange.setAttribute('aria-valuetext', format(getTranslation('ui.valueText'), { value: normalizedValue }));
  };

  const updateCaseCopy = (announce = false) => {
    const caseNumber = twoDigitCase(currentCase);
    if (comparisonCounter) comparisonCounter.textContent = `${getTranslation('ui.case')} ${caseNumber} ${getTranslation('ui.of')} ${String(caseStudies.length).padStart(2, '0')}`;
    if (beforeImage) beforeImage.alt = format(getTranslation('ui.beforeAlt'), { case: caseNumber });
    if (afterImage) afterImage.alt = format(getTranslation('ui.afterAlt'), { case: caseNumber });
    comparisonDots.forEach((dot, index) => {
      const isActive = index === currentCase;
      dot.classList.toggle('is-active', isActive);
      if (isActive) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
      dot.setAttribute('aria-label', format(getTranslation('accessibility.caseButton'), { case: twoDigitCase(index) }));
    });
    if (announce && comparisonLive) comparisonLive.textContent = format(getTranslation('ui.caseChanged'), { case: caseNumber });
  };

  const preloadCase = (index) => {
    const normalizedIndex = (index + caseStudies.length) % caseStudies.length;
    for (const source of Object.values(caseStudies[normalizedIndex])) {
      const image = new Image();
      image.src = source;
    }
  };

  const showCase = (index, announce = true) => {
    currentCase = (index + caseStudies.length) % caseStudies.length;
    const selectedCase = caseStudies[currentCase];
    if (beforeImage) beforeImage.src = selectedCase.before;
    if (afterImage) afterImage.src = selectedCase.after;
    setComparisonValue(50);
    updateCaseCopy(announce);
    preloadCase(currentCase + 1);
    preloadCase(currentCase - 1);
  };

  const updateMetadata = () => {
    document.title = getTranslation('meta.title');
    document.querySelector('meta[name="description"]')?.setAttribute('content', getTranslation('meta.description'));
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', getTranslation('meta.title'));
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', getTranslation('meta.ogDescription'));
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', getTranslation('meta.locale'));
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', getTranslation('meta.title'));
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', getTranslation('meta.ogDescription'));
  };

  const updateWhatsAppLinks = () => {
    document.querySelectorAll('[data-wa]').forEach((link) => {
      const messageKey = link.dataset.wa;
      const message = getTranslation(`whatsapp.${messageKey}`);
      link.href = `https://wa.me/5511940757575?text=${encodeURIComponent(message)}`;
    });
  };

  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  const setMenuOpen = (isOpen) => {
    if (!menuToggle || !navLinks) return;
    navLinks.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', getTranslation(isOpen ? 'accessibility.closeMenu' : 'accessibility.openMenu'));
    const icon = menuToggle.querySelector('[aria-hidden="true"]');
    if (icon) icon.textContent = isOpen ? '×' : '☰';
  };

  const applyLanguage = (language, updateUrl = false) => {
    if (!supportedLanguages.includes(language)) return;
    currentLanguage = language;
    document.documentElement.lang = htmlLanguage[language];

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = getTranslation(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach((element) => {
      element.innerHTML = getTranslation(element.dataset.i18nHtml);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
      element.setAttribute('aria-label', getTranslation(element.dataset.i18nAria));
    });
    document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
      element.alt = getTranslation(element.dataset.i18nAlt);
    });
    document.querySelectorAll('[data-lang]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === language));
    });
    document.querySelectorAll('[data-case-caption]').forEach((caption) => {
      caption.textContent = `${getTranslation('ui.case')} ${String(caption.dataset.caseCaption).padStart(2, '0')}`;
    });
    document.querySelectorAll('[data-case-alt]').forEach((image) => {
      image.alt = format(getTranslation('ui.galleryAlt'), { case: String(image.dataset.caseAlt).padStart(2, '0') });
    });

    updateMetadata();
    updateWhatsAppLinks();
    updateCaseCopy(false);
    setComparisonValue(comparisonRange?.value ?? 50);
    setMenuOpen(navLinks?.classList.contains('open') ?? false);

    try { localStorage.setItem('gabriel-language', language); } catch { /* Storage can be disabled. */ }
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (language === 'pt') url.searchParams.delete('lang');
      else url.searchParams.set('lang', language);
      history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
  };

  menuToggle?.addEventListener('click', () => setMenuOpen(!navLinks?.classList.contains('open')));
  navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav') && navLinks?.classList.contains('open')) setMenuOpen(false);
  });
  window.matchMedia('(min-width: 1121px)').addEventListener('change', (event) => {
    if (event.matches) setMenuOpen(false);
  });

  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => applyLanguage(button.dataset.lang, true));
  });

  comparisonRange?.addEventListener('input', (event) => setComparisonValue(event.target.value));
  comparison?.querySelector('[data-case-prev]')?.addEventListener('click', () => showCase(currentCase - 1));
  comparison?.querySelector('[data-case-next]')?.addEventListener('click', () => showCase(currentCase + 1));
  comparisonDots.forEach((dot) => dot.addEventListener('click', () => showCase(Number(dot.dataset.caseIndex))));

  document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
    link.addEventListener('click', () => {
      try { console.info('[Gabriel Site] WhatsApp CTA click'); } catch { /* Console may be unavailable. */ }
    });
  });

  const queryLanguage = new URLSearchParams(window.location.search).get('lang');
  let storedLanguage = null;
  try { storedLanguage = localStorage.getItem('gabriel-language'); } catch { /* Storage can be disabled. */ }
  const initialLanguage = supportedLanguages.includes(queryLanguage)
    ? queryLanguage
    : (supportedLanguages.includes(storedLanguage) ? storedLanguage : 'pt');

  applyLanguage(initialLanguage);
  showCase(0, false);
})();
