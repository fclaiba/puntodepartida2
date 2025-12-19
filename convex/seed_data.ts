
export type SectionType = 'politica' | 'economia' | 'internacional' | 'local' | 'opinion' | 'extrategia';

export type NewsSection = SectionType;

export const NewsSections: NewsSection[] = [
    'politica',
    'economia',
    'internacional',
    'local',
    'opinion'
];

export interface NewsArticle {
    id: string;
    title: string;
    section: NewsSection;
    imageUrl: string;
    description: string;
    content: string;
    author: string;
    date: string;
    readTime: number;
    featured?: boolean;
    publishDate?: string;
}

export interface AcademicArticle {
    id: string;
    title: string;
    author: string;
    authorBio: string;
    pageStart: number;
    pageEnd: number;
    abstract: string;
    keywords: string[];
    content: string;
    references?: string[];
}

export interface ExtrateguiaVolume {
    id: string;
    volumeNumber: number;
    title: string;
    editorialTitle: string;
    publishDate: string;
    description: string;
    editorial: string;
    pdfUrl: string;
    coverImageUrl: string;
    pageCount: number;
    articles: AcademicArticle[];
}

export const initialNewsArticles: NewsArticle[] = [
    {
        id: '1',
        title: 'Crisis política: Nuevas medidas económicas generan debate en el Congreso Nacional',
        section: 'politica',
        imageUrl: 'https://images.unsplash.com/photo-1672087431374-1f70330dfcb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmdlbnRpbmElMjBwb2xpdGljcyUyMGNpdHl8ZW58MXx8fHwxNzYxMDE1MzMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'El gobierno presenta un paquete de reformas que busca frenar la inflación y dinamizar la economía en medio de fuertes críticas de la oposición',
        content: `El Congreso Nacional fue escenario de intensos debates durante toda la jornada de ayer, cuando el oficialismo presentó un paquete integral de medidas económicas destinadas a combatir la inflación y reactivar la economía del país.

La propuesta, que incluye modificaciones en el sistema tributario, incentivos a la producción y nuevos controles de precios, generó reacciones encontradas entre los legisladores. Mientras el oficialismo defiende las medidas como "necesarias y urgentes", la oposición las califica de "insuficientes y contraproducentes".

El ministro de Economía compareció ante el pleno legislativo para defender la iniciativa, argumentando que "estas medidas son el resultado de meses de análisis técnico y consenso con diversos sectores productivos". Sin embargo, varios economistas independientes expresaron sus dudas sobre la efectividad del plan.

Los principales puntos del paquete incluyen:
- Reducción gradual de subsidios a los servicios públicos
- Incentivos fiscales para PyMEs que generen nuevos empleos
- Control de precios en productos de la canasta básica
- Apertura comercial selectiva para determinados sectores

La ciudadanía observa con atención el desarrollo de estos acontecimientos, mientras los mercados financieros mostraron una reacción moderadamente positiva ante el anuncio.

Organizaciones sociales y sindicatos convocaron para la próxima semana a una jornada de movilización en caso de que las medidas afecten el poder adquisitivo de los trabajadores.`,
        author: 'María Rodríguez',
        date: '2025-10-26',
        readTime: 5,
        featured: true
    },
    {
        id: '2',
        title: 'Cumbre internacional aborda el cambio climático y los nuevos acuerdos globales',
        section: 'internacional',
        imageUrl: 'https://images.unsplash.com/photo-1650984661525-7e6b1b874e47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcm5hdGlvbmFsJTIwbmV3cyUyMHdvcmxkfGVufDF8fHx8MTc2MTAxNTMzMHww&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Líderes mundiales se reúnen para discutir estrategias urgentes frente al calentamiento global',
        content: `En una cumbre histórica celebrada en Ginebra, más de 150 líderes mundiales se reunieron para abordar la crisis climática que amenaza al planeta. El encuentro, que se extenderá durante tres días, busca establecer compromisos más ambiciosos que los del Acuerdo de París.

Las naciones desarrolladas se comprometieron a aumentar significativamente el financiamiento para países en desarrollo, destinado a la transición energética y la adaptación al cambio climático. Se espera alcanzar un fondo de $500 mil millones anuales para 2030.

Los científicos presentes en la cumbre presentaron datos alarmantes: las emisiones globales de gases de efecto invernadero alcanzaron niveles récord el año pasado, y el tiempo para evitar consecuencias catastróficas se está agotando.

Entre las propuestas más destacadas se encuentran:
- Eliminación progresiva de combustibles fósiles para 2050
- Inversión masiva en energías renovables
- Protección de ecosistemas críticos como la Amazonía
- Impuestos al carbono a nivel global

Las organizaciones ambientalistas saludaron algunos anuncios pero advierten que "las palabras deben transformarse en acciones concretas inmediatas".`,
        author: 'Carlos Méndez',
        date: '2025-10-26',
        readTime: 4,
        featured: true
    },
    {
        id: '3',
        title: 'El Banco Central ajusta las tasas de interés en respuesta a la inflación',
        section: 'economia',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29ub215JTIwZmluYW5jZXxlbnwxfHx8fDE3NjEwMTUzMzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Decisión busca controlar la inflación que alcanzó el 8.5% en el último trimestre',
        content: `El Banco Central anunció hoy un incremento de 50 puntos básicos en la tasa de interés de referencia, llevándola al 7.5%, en un esfuerzo por contener la inflación que ha mostrado persistencia en los últimos meses.

La medida, esperada por los analistas económicos, busca enfriar la demanda agregada y anclar las expectativas inflacionarias que se han desviado del objetivo del 3% establecido por la autoridad monetaria.

El presidente del Banco Central justificó la decisión señalando que "es necesario actuar con firmeza para preservar el poder adquisitivo de la moneda y garantizar la estabilidad financiera del país".

El sector empresarial expresó preocupación por el posible impacto en el crédito y la inversión, mientras que economistas debaten si la medida será suficiente o si se requerirán ajustes adicionales en los próximos meses.

Los analistas proyectan que la inflación comenzará a ceder en el segundo trimestre del próximo año, aunque persiste incertidumbre sobre la magnitud y velocidad de la desaceleración.`,
        author: 'Laura Fernández',
        date: '2025-10-26',
        readTime: 4,
        featured: true
    },
    {
        id: '4',
        title: 'Municipio inaugura nuevo centro cultural en el barrio Sur',
        section: 'local',
        imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdWx0dXJhbCUyMGNlbnRlciUyMGJ1aWxkaW5nfGVufDF8fHx8MTc2MTAxNTMzMHww&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'El espacio ofrecerá talleres gratuitos de arte, música y teatro para toda la comunidad',
        content: `Con una ceremonia que contó con la presencia de autoridades locales y vecinos, se inauguró el nuevo Centro Cultural Barrio Sur, un espacio de 1.200 metros cuadrados dedicado a promover el acceso a la cultura en la zona.

El centro cuenta con salas de teatro, talleres de arte, biblioteca comunitaria y espacios para presentaciones musicales. La inversión total alcanzó los 2.5 millones de pesos y forma parte de un plan más amplio de desarrollo cultural para los barrios de la periferia.

"Este espacio es un sueño hecho realidad para nuestra comunidad", expresó la presidenta de la asociación vecinal. "Nuestros jóvenes tendrán acceso a actividades culturales de calidad sin necesidad de trasladarse al centro de la ciudad".

La programación inicial incluye talleres de pintura, música, danza contemporánea y teatro, todos con cupos limitados y gratuitos para los residentes del barrio. También se organizarán ciclos de cine y presentaciones de artistas locales.

El intendente destacó el compromiso del municipio con la descentralización de la oferta cultural y anunció que se prevé la apertura de dos centros similares en otros barrios durante el próximo año.`,
        author: 'Roberto Paz',
        date: '2025-10-25',
        readTime: 3,
        featured: false
    },
    {
        id: '5',
        title: 'La necesidad de reformar el sistema educativo en la era digital',
        section: 'opinion',
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBkaWdpdGFsfGVufDF8fHx8MTc2MTAxNTMzMHww&ixlib=rb-4.1.0&q=80&w=1080',
        description: 'Por Gabriela Moreno. El modelo tradicional de enseñanza ya no responde a las demandas del siglo XXI',
        content: `Estamos frente a una paradoja educativa: mientras la tecnología avanza a pasos agigantados y transforma todos los aspectos de nuestra vida, nuestras aulas permanecen ancladas en métodos pedagógicos del siglo XIX.

La pandemia de COVID-19 aceleró la digitalización forzada de la educación, pero esta transformación fue más reactiva que planificada. Ahora, con la perspectiva que dan los años transcurridos, es momento de pensar seriamente en una reforma integral del sistema educativo.

No se trata simplemente de incorporar tablets o pizarras digitales. La verdadera revolución educativa implica repensar qué enseñamos, cómo lo enseñamos y, fundamentalmente, para qué lo enseñamos. Las competencias del futuro no son las mismas que las del pasado.

El pensamiento crítico, la creatividad, la capacidad de colaboración y la alfabetización digital deberían ocupar un lugar central en el currículo. Sin embargo, seguimos priorizando la memorización de contenidos que están a un clic de distancia en cualquier dispositivo.

La resistencia al cambio no proviene solo de limitaciones presupuestarias. Existe un componente cultural, una inercia institucional que dificulta la innovación pedagógica. Los docentes, formados en un paradigma tradicional, necesitan apoyo y capacitación continua para adaptarse a nuevas metodologías.

Es imperativo que el debate sobre educación trascienda las diferencias políticas y se convierta en una política de Estado. El futuro de nuestros jóvenes, y por extensión el de nuestra sociedad, depende de las decisiones que tomemos hoy en materia educativa.`,
        author: 'Gabriela Moreno',
        date: '2025-10-25',
        readTime: 5,
        featured: false
    }
];

export const extrateguiaVolumes: ExtrateguiaVolume[] = [
    {
        id: 'vol1',
        volumeNumber: 1,
        title: 'Volumen I',
        editorialTitle: 'Fundamentos de la Civilización Occidental',
        publishDate: '2025-01-15',
        description: 'Primera edición de EXTRATEGIA, explorando los pilares fundamentales que sostienen la civilización occidental: democracia, estado de derecho, y libertad individual.',
        editorial: `Bienvenidos al primer volumen de EXTRATEGIA, un espacio de reflexión intelectual donde el pensamiento se encuentra con la estrategia.\n\nEn un momento histórico donde la civilización occidental enfrenta desafíos sin precedentes, resulta imperativo volver a los fundamentos que han sostenido nuestra tradición de libertad, razón y progreso. Este primer volumen reúne cuatro ensayos fundamentales que exploran las raíces de nuestra civilización.\n\nDesde la democracia ateniense hasta el liberalismo moderno, pasando por el derecho romano y la Ilustración, estos trabajos académicos buscan iluminar el presente mediante el entendimiento riguroso del pasado.\n\nInvitamos al lector a un ejercicio de pensamiento crítico, donde cada página es una oportunidad para comprender mejor los principios que nos definen como sociedad libre.`,
        pdfUrl: '#',
        coverImageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
        pageCount: 120,
        articles: [
            {
                id: 'vol1-art1',
                title: 'El Legado Griego: Democracia y Filosofía',
                author: 'Dr. Alberto Sánchez',
                authorBio: 'Doctor en Filosofía por la Universidad de Salamanca. Especialista en pensamiento clásico griego y teoría política. Autor de múltiples obras sobre democracia antigua.',
                pageStart: 5,
                pageEnd: 27,
                abstract: 'Este ensayo explora las raíces filosóficas y políticas de la democracia ateniense, analizando cómo los principios desarrollados en la Grecia clásica continúan influenciando el pensamiento político contemporáneo. Se examina la relación entre filosofía socrática, instituciones democráticas y el concepto de ciudadanía activa.',
                keywords: ['Democracia', 'Grecia Antigua', 'Filosofía Política', 'Ciudadanía', 'Sócrates', 'Platón'],
                content: `# El Legado Griego: Democracia y Filosofía

## Introducción

La democracia ateniense del siglo V a.C. representa uno de los experimentos políticos más fascinantes de la historia humana. No fue solamente un sistema de gobierno, sino una forma completa de vida cívica que integraba participación política, deliberación racional y compromiso ciudadano en una síntesis única.

Cuando Pericles pronunció su célebre oración fúnebre, no estaba simplemente elogiando a los caídos en combate. Estaba articulando una visión completa de la vida civilizada, donde la libertad individual y la responsabilidad colectiva se encontraban en un equilibrio dinámico. "Nuestra constitución", declaró, "se llama democracia porque el poder no está en manos de unos pocos, sino de la mayoría".

## El Nacimiento de la Razón Pública

La democracia ateniense fue posible gracias a una revolución intelectual que comenzó con los presocráticos. Cuando Tales de Mileto propuso que el mundo podía explicarse mediante causas naturales en lugar de caprichos divinos, estaba estableciendo un principio fundamental: la realidad es cognoscible mediante la razón.

Este giro hacia el logos, hacia el discurso racional, creó las condiciones para el debate político democrático. Si la verdad podía discernirse mediante el argumento y la evidencia, entonces las decisiones políticas también podían someterse al escrutinio de la razón pública.

Sócrates llevó este principio a su máxima expresión. Su método dialéctico no era simplemente una técnica pedagógica, sino una forma de vida política. Al cuestionar constantemente las opiniones recibidas, Sócrates demostró que la democracia requiere ciudadanos capaces de pensar críticamente, no simplemente de votar.

## Instituciones y Participación

La democracia ateniense operaba mediante instituciones que garantizaban la participación amplia. La Asamblea (Ekklesia) reunía a todos los ciudadanos varones, permitiendo que cualquiera hablara y votara sobre asuntos de Estado. El Consejo de los Quinientos, seleccionado por sorteo, preparaba la agenda legislativa.

Este sistema de selección aleatoria merece especial atención. Los atenienses creían que el sorteo era más democrático que la elección, pues evitaba la formación de élites políticas permanentes. Todo ciudadano podía, y debía, servir en el gobierno en algún momento de su vida.

El tribunal popular (Heliea), compuesto por miles de ciudadanos sorteados, administraba justicia. No había jueces profesionales ni abogados. Los ciudadanos debían presentar sus propios casos y convencer a sus pares. Esta práctica fomentaba la elocuencia, el pensamiento legal y la responsabilidad personal.

## Filosofía y Política: Una Relación Tensionada

Paradójicamente, la relación entre filosofía y democracia en Atenas fue frecuentemente conflictiva. Platón, traumatizado por la ejecución de Sócrates, desarrolló en "La República" una crítica devastadora del gobierno democrático, comparándolo con un barco tripulado por marineros ignorantes.

Para Platón, la democracia era el gobierno de la opinión (doxa) en lugar del conocimiento (episteme). Sostenía que así como no confiaríamos la navegación a quienes no conocen el arte náutico, no deberíamos confiar el gobierno a quienes carecen de conocimiento político.

Sin embargo, esta crítica, por mordaz que fuera, solo podía surgir en una sociedad democrática. Atenas toleró el disenso filosófico de una manera que hubiera sido impensable en regímenes autoritarios contemporáneos. La capacidad de la democracia para autocriticarse, para permitir voces que cuestionan sus fundamentos, es paradójicamente una de sus mayores fortalezas.

## Ciudadanía como Práctica, No como Status

Los griegos entendían la ciudadanía como una actividad, no como un estatus pasivo. Aristóteles definió al ciudadano como aquel que participa en las funciones judiciales y deliberativas. Ser ciudadano significaba gobernar y ser gobernado alternativamente.

Esta concepción tiene implicaciones profundas. La ciudadanía no era simplemente un conjunto de derechos que uno poseía, sino un conjunto de prácticas que uno ejercía. El ciudadano ateniense no se limitaba a votar ocasionalmente; participaba regularmente en asambleas, servía en tribunales, ocupaba cargos públicos.

La ética aristotélica refuerza esta visión. Las virtudes cívicas —coraje, justicia, templanza, prudencia— no eran abstracciones morales, sino capacidades necesarias para el autogobierno colectivo. La educación ciudadana consistía en desarrollar estas virtudes mediante la práctica activa.

## Limitaciones y Contradicciones

Sería deshonesto ignorar las limitaciones evidentes de la democracia ateniense. La exclusión de mujeres, metecos (residentes extranjeros) y esclavos del cuerpo político fue una contradicción fundamental. La democracia de Atenas era, en términos modernos, profundamente antidemocrática.

Esta paradoja nos recuerda que los ideales políticos siempre exceden su realización histórica. Los atenienses articularon principios de igualdad política, participación ciudadana y gobierno popular que ellos mismos no aplicaron universalmente. Pero estos principios, una vez articulados, cobraron vida propia.

La historia posterior de Occidente puede verse como el gradual despliegue de las implicaciones universalistas contenidas en la idea griega de ciudadanía democrática. Cuando los movimientos por el sufragio femenino, los derechos civiles o la igualdad social argumentaban por la extensión de derechos políticos, estaban desarrollando la lógica interna de la democracia ateniense más allá de sus limitaciones históricas.

## El Legado Contemporáneo

¿Qué puede enseñarnos la democracia ateniense hoy? Vivimos en democracias representativas vastamente diferentes de la democracia directa de Atenas. Nuestras instituciones —partidos políticos, elecciones, separación de poderes— hubieran sido extrañas para Pericles.

Sin embargo, ciertos principios permanecen vitales. La idea de que el poder político requiere justificación racional, no simplemente fuerza o tradición, sigue siendo fundamental. El compromiso con la deliberación pública, con el debate abierto sobre el bien común, continúa distinguiendo las democracias de otros regímenes.

Quizás la lección más importante es la comprensión griega de que la democracia es exigente. No es simplemente un procedimiento electoral, sino una forma de vida que requiere ciudadanos activos, informados y virtuosos. La decadencia democrática comienza cuando la ciudadanía se vuelve pasiva, cuando delegamos completamente la responsabilidad política a élites profesionales.

## Conclusión

El legado griego es complejo y multifacético. Nos legaron tanto la democracia como su crítica filosófica, tanto el ideal de participación ciudadana como el reconocimiento de sus dificultades prácticas. Esta tensión creativa entre idealismo político y realismo crítico sigue definiendo nuestro pensamiento sobre el gobierno popular.

En una época donde las democracias liberales enfrentan desafíos internos y externos, volver a los orígenes griegos no es un ejercicio de nostalgia anticuaria. Es reconocer que los problemas fundamentales de la política —¿cómo combinar libertad y orden? ¿Cómo garantizar participación sin caer en demagogia? ¿Cómo educar ciudadanos capaces de autogobierno?— fueron articulados por primera vez con claridad en las calles de Atenas.

La democracia griega fracasó históricamente, sucumbiendo primero a la tiranía macedónica y luego a la conquista romana. Pero sus ideas sobrevivieron, transmitiéndose a través de los siglos, inspirando revoluciones, informando constituciones, moldeando instituciones. En este sentido, la democracia ateniense nunca murió; continúa viviendo cada vez que ciudadanos se reúnen para deliberar sobre el bien común, cada vez que el poder se somete al escrutinio de la razón pública.

Nuestro desafío es mantener vivo este legado, adaptándolo a las circunstancias contemporáneas sin traicionar sus principios fundamentales. Es una tarea que los atenienses habrían reconocido: el perpetuo proyecto de hacer realidad el ideal de una comunidad libre de ciudadanos iguales, gobernándose a sí mismos mediante la razón y el diálogo.`,
                references: [
                    'Tucídides. "Historia de la Guerra del Peloponeso". Madrid: Gredos, 1990.',
                    'Platón. "La República". Buenos Aires: Eudeba, 2005.',
                    'Aristóteles. "Política". Madrid: Alianza Editorial, 2000.',
                    'Finley, M.I. "Democracy Ancient and Modern". New Brunswick: Rutgers University Press, 1985.',
                    'Hansen, M.H. "The Athenian Democracy in the Age of Demosthenes". Oxford: Blackwell, 1991.'
                ]
            },
            {
                id: 'vol1-art2',
                title: 'Roma y el Derecho: Fundamentos Jurídicos de Occidente',
                author: 'Dra. Patricia Velázquez',
                authorBio: 'Doctora en Derecho Romano por la Universidad Complutense de Madrid. Catedrática de Historia del Derecho. Investigadora principal en estudios de derecho comparado.',
                pageStart: 28,
                pageEnd: 51,
                abstract: 'Un análisis exhaustivo de cómo el sistema jurídico romano estableció los fundamentos del derecho occidental moderno. Se examinan conceptos como persona jurídica, propiedad privada, contratos y procedimientos legales que continúan vigentes.',
                keywords: ['Derecho Romano', 'Sistema Legal', 'Propiedad', 'Contratos', 'Estado de Derecho'],
                content: `# Roma y el Derecho: Fundamentos Jurídicos de Occidente

## Introducción: El Derecho como Civilización

"Ubi societas, ibi ius" — donde hay sociedad, hay derecho. Este antiguo aforismo romano captura una verdad fundamental: el derecho no es un accesorio de la civilización, sino su fundamento mismo. Roma no conquistó el mundo únicamente con legiones, sino con un sistema jurídico que ordenó la convivencia humana de manera revolucionaria.

El legado jurídico romano es omnipresente en el mundo contemporáneo, aunque frecuentemente invisible. Conceptos que damos por sentados —propiedad, contratos, personalidad jurídica, procedimiento judicial— fueron meticulosamente desarrollados por juristas romanos a lo largo de siglos. Comprender este legado no es un ejercicio académico abstracto, sino entender los cimientos sobre los cuales reposa nuestra vida legal moderna.

## Del Ius Civile al Ius Gentium

En sus inicios, el derecho romano era particularista: el ius civile aplicaba exclusivamente a ciudadanos romanos. Este cuerpo de normas, transmitido oralmente y controlado por un colegio sacerdotal, regulaba aspectos fundamentales de la vida romana: matrimonio, herencia, propiedad, obligaciones.

La expansión del imperio planteó un desafío: ¿cómo regular las relaciones entre romanos y extranjeros (peregrini)? La respuesta fue el desarrollo del ius gentium, el "derecho de gentes", un cuerpo de principios jurídicos basados no en tradiciones particulares romanas, sino en razones universalmente accesibles.

El ius gentium representó una revolución conceptual. Implicaba que existían principios jurídicos válidos más allá de las fronteras de cualquier comunidad particular, principios accesibles a la razón humana universal. Esta idea, posteriormente refinada por juristas medievales en el concepto de derecho natural, estableció las bases para nociones modernas de derechos humanos universales.

Los pretores, magistrados encargados de administrar justicia, jugaron un papel crucial en este desarrollo. Mediante edictos anuales, introdujeron flexibilidad en el sistema legal, adaptando principios antiguos a circunstancias nuevas. Esta capacidad de evolución pragmática, manteniendo continuidad con tradiciones establecidas, fue una de las grandes fortalezas del derecho romano.

## La Persona Jurídica: Sujeto de Derechos

Uno de los conceptos más influyentes del derecho romano es la noción de "persona jurídica". Los romanos distinguieron entre el ser humano (homo) y la persona jurídica (persona), el sujeto capaz de tener derechos y obligaciones.

Esta distinción puede parecer sutil, pero sus implicaciones son profundas. No todo ser humano era automáticamente una persona con plena capacidad jurídica. Los esclavos eran humanos sin personalidad jurídica; podían ser objetos de derecho, pero no sujetos. Esta cruel exclusión revela las limitaciones morales del sistema romano, pero también muestra cómo el derecho construye realidades sociales.

Paradójicamente, los romanos también desarrollaron la idea de que entidades no-humanas podían tener personalidad jurídica. Las corporaciones (universitates) —municipios, colegios profesionales, asociaciones religiosas— podían poseer propiedades, celebrar contratos, litigar en tribunales. Esta ficción legal permitió formas complejas de organización social y económica.

La doctrina moderna de la personalidad corporativa, fundamental para el capitalismo contemporáneo, tiene raíces directas en estos desarrollos romanos. Cuando hoy discutimos si las corporaciones tienen "derechos", estamos continuando debates iniciados por juristas romanos hace dos milenios.

## Propiedad: Dominium Absolutum

El concepto romano de propiedad (dominium) fue revolucionario en su absolutismo. El propietario tenía derecho ilimitado sobre su cosa: podía usarla (uti), disfrutar sus frutos (frui) y disponer de ella (abuti). Este triple derecho constituía un control casi total.

Esta concepción difería radicalmente de sistemas anteriores donde la "propiedad" era más bien un haz complejo de derechos y obligaciones recíprocas. En muchas sociedades antiguas, lo que llamaríamos propiedad era realmente un sistema de tenencias condicionadas, donde múltiples partes tenían derechos simultáneos sobre el mismo bien.

Roma simplificó esto radicalmente. El dominium era unitario, absoluto, perpetuo. Esta claridad conceptual facilitó transacciones económicas, permitió mercados de tierras funcionales, y estableció bases para el desarrollo económico.

Sin embargo, incluso en Roma, el dominium nunca fue completamente ilimitado. La ley de las XII Tablas establecía restricciones: no podías usar tu propiedad de manera que dañaras a vecinos. Juristas posteriores desarrollaron doctrinas de abuso de derecho, reconociendo que incluso derechos absolutos tienen límites en el contexto social.

La tensión entre derechos de propiedad absolutos y limitaciones basadas en el bien común continúa siendo central en debates contemporáneos sobre regulación económica, zonificación urbana, y propiedad intelectual. Los romanos no resolvieron esta tensión —ningún sistema legal lo ha hecho— pero articularon sus términos con claridad perdurable.

## El Derecho de Contratos: Pacta Sunt Servanda

"Los pactos deben cumplirse" (pacta sunt servanda) es quizás el principio más fundamental del derecho contractual. Su origen romano refleja un profundo compromiso con la autonomía individual y la seguridad jurídica.

El derecho contractual romano evolucionó de formalismos estrictos hacia principios más flexibles basados en consentimiento. Inicialmente, solo ciertos contratos formales (como la stipulatio, que requería palabras específicas pronunciadas oralmente) eran ejecutables. Gradualmente, el sistema reconoció contratos consensuales donde el mero acuerdo de voluntades creaba obligaciones vinculantes.

Esta evolución revela una comprensión cada vez más sofisticada de la autonomía individual. Si los individuos son agentes racionales capaces de obligarse mediante promesas, el derecho debe respetar y hacer cumplir estas auto-obligaciones. El contrato se convierte en "ley entre las partes", creando un mini-orden legal personalizado.

Los juristas romanos distinguieron meticulosamente entre diferentes tipos de contratos: compraventa (emptio-venditio), arrendamiento (locatio-conductio), sociedad (societas), mandato (mandatum). Cada uno tenía reglas específicas, pero todos compartían principios comunes: consentimiento libre, objeto lícito, causa válida.

Esta taxonomía contractual continúa estructurando códigos civiles modernos. Cuando estudiantes de derecho en Buenos Aires, París o Ciudad de México aprenden sobre contratos, están estudiando distinciones desarrolladas originalmente por Gayo, Papiniano y Ulpiano.

## Procedimiento: El Debido Proceso Legal

Roma no solo desarrolló derecho sustantivo, sino procedimientos para aplicarlo justamente. El concepto de debido proceso —que nadie puede ser condenado sin oportunidad de defenderse— tiene raíces romanas claras.

El sistema procesal romano evolucionó desde el arcaico legis actiones (acciones de ley), altamente formalista, hacia el procedimiento formulario, más flexible. En este sistema, el pretor elaboraba una fórmula que definía la cuestión legal a resolver, y un juez privado determinaba los hechos y aplicaba la fórmula.

Esta separación entre magistrado que define la cuestión legal y juez que establece hechos es ancestro directo de distinciones modernas entre cuestiones de derecho y cuestiones de hecho. La estructura bifásica del proceso romano influyó profundamente en procedimientos civiles continentales.

Más importante aún fue el compromiso romano con la publicidad del proceso y la posibilidad de defensa. El principio "audiatur et altera pars" (debe oírse también a la otra parte) garantizaba que ambas partes tuvieran oportunidad de presentar su caso. El procedimiento contradictorio, donde cada parte puede controvertir argumentos y evidencias de la contraparte, es fundamental para nuestra noción de justicia.

## Jurisprudencia: El Derecho como Ciencia

Una de las contribuciones más originales de Roma fue la creación del derecho como disciplina científica. Los juristas romanos (iuris prudentes) no eran simplemente abogados prácticos, sino teóricos que sistemáticamente analizaban, categorizaban y razonaban sobre principios legales.

Figuras como Gayo, Papiniano, Paulo y Ulpiano produjeron obras que no solo recopilaban normas existentes, sino que las organizaban sistemáticamente, extraían principios generales, resolvían aparentes contradicciones y aplicaban razonamiento analógico para casos nuevos.

El método jurisprudencial romano combinaba respeto por la tradición (auctoritas) con razonamiento racional (ratio). Los juristas citaban precedentes, pero no estaban rígidamente atados a ellos. Podían distinguir casos, identificar excepciones, modificar doctrinas cuando la razón lo requería.

Esta tradición de jurisprudencia sabia (sapiens iuris prudentia) estableció el modelo para el derecho como disciplina académica. Las facultades de derecho europeas medievales que estudiaban el Corpus Iuris Civilis de Justiniano estaban continuando el proyecto romano de hacer del derecho un objeto de conocimiento sistemático, no solo un conjunto de reglas positivas.

## La Codificación Justinianea

El emperador Justiniano, en el siglo VI d.C., emprendió la monumental tarea de codificar todo el derecho romano. El resultado —el Corpus Iuris Civilis— se convirtió en el vehículo principal de transmisión del derecho romano a la posteridad.

Compuesto por el Código (recopilación de leyes imperiales), el Digesto (compilación de escritos jurisprudenciales), las Instituciones (manual introductorio) y las Novelas (nuevas leyes de Justiniano), el Corpus preservó el conocimiento jurídico romano justo cuando el imperio occidental colapsaba.

Durante la Edad Media, este texto fue redescubierto en universidades como Bolonia. Glosadores y postglosadores lo estudiaron meticulosamente, adaptando principios romanos a circunstancias medievales. Este proceso de recepción del derecho romano transformó los sistemas legales europeos.

Cuando las naciones europeas codificaron sus leyes civiles en los siglos XVIII y XIX, se inspiraron masivamente en el derecho romano mediado por Justiniano. El Código Napoleónico, que influyó a su vez en códigos civiles latinoamericanos, es en gran medida derecho romano adaptado a condiciones modernas.

## Estado de Derecho: Lex Rex

Quizás la contribución más profunda de Roma fue la idea misma del estado de derecho (rule of law). Cicerón articuló este principio con claridad: "Somos esclavos de la ley para poder ser libres". Paradójicamente, la sujeción al derecho es condición de libertad.

Esta idea contrasta con concepciones donde el gobernante es fuente personal del derecho, donde su voluntad es ley. En el estado de derecho, incluso los gobernantes están sujetos a leyes. El poder político está jurídicamente limitado.

Roma no siempre vivió a la altura de este ideal. Los emperadores frecuentemente actuaron arbitrariamente. Pero el ideal mismo, una vez articulado, tuvo vida propia. La noción de que el derecho es superior al poder, que la autoridad política requiere legitimidad legal, se convirtió en parte permanente de la tradición occidental.

Las luchas constitucionales modernas —del Parlamento inglés contra el absolutismo monárquico, de la Revolución Americana contra el gobierno arbitrario— pueden verse como elaboraciones de este principio romano. Cuando los revolucionarios franceses proclamaron que la ley es expresión de la voluntad general, estaban, consciente o inconscientemente, continuando la tradición romana.

## Limitaciones y Contradicciones

Sería mistificación idealizar el derecho romano ignorando sus severas limitaciones. El sistema legal romano coexistió con la esclavitud, la sujeción de la mujer, el imperialismo militar y frecuentes arbitrariedades políticas.

El derecho romano era, en muchos aspectos, un derecho de clase. Los ciudadanos ricos tenían acceso a juristas sofisticados; los pobres, no. La complejidad del sistema favorecía a quienes podían permitirse asesoramiento legal experto. La justicia romana era, en la práctica, frecuentemente desigual.

Más fundamentalmente, el derecho romano careció de mecanismos efectivos para limitar el poder imperial absoluto. Durante el principado y el dominato, el emperador era legibus solutus (desatado de las leyes). Podía legislar mediante edictos que no requerían aprobación senatorial. El poder político concentrado podía ignorar o manipular el derecho.

Estas limitaciones nos recuerdan que tener un buen sistema jurídico no es suficiente para garantizar una sociedad justa. El derecho debe estar incorporado en instituciones políticas que distribuyan el poder, en una cultura cívica que valore la legalidad, en mecanismos que hagan a los poderosos responsables ante la ley.

## El Legado Vivo

El derecho romano no es historia muerta. Continúa viviendo en nuestras instituciones, conceptos y razonamientos legales. Cuando un tribunal argentino aplica principios de buena fe contractual, está aplicando doctrina desarrollada por juristas romanos. Cuando discutimos derechos de propiedad intelectual, estamos adaptando categorías romanas a objetos inmateriales.

Más allá de doctrinas específicas, Roma nos legó una forma de pensar jurídicamente: sistemática, racional, preocupada por la coherencia lógica y la aplicación consistente de principios. El derecho como disciplina intelectual rigurosa, no meramente como conjunto de reglas positivas, es invención romana.

## Conclusión

El derecho romano representa uno de los mayores logros de la civilización occidental. No porque fuera perfecto —estaba lejos de serlo— sino porque creó instrumentos conceptuales que permitieron ordenar la convivencia humana mediante reglas racionales en lugar de fuerza arbitraria.

En una época donde el estado de derecho enfrenta amenazas tanto de autoritarismos populistas como de burocracias tecnocráticas descontroladas, volver a las fuentes romanas nos recuerda que el derecho es tanto un límite al poder como un habilitador de libertad ordenada.

La gran lección romana es que la civilización requiere derecho, pero el derecho requiere constante vigilancia, interpretación sabia y compromiso cívico. Las normas jurídicas no se aplican solas; requieren juristas que las interpreten inteligentemente, tribunales que las apliquen imparcialmente, y ciudadanos que las respeten voluntariamente.

En este sentido, el legado jurídico romano es tanto un regalo como una responsabilidad. Nos corresponde a nosotros, herederos de esta tradición, mantenerla viva adaptándola a nuevos desafíos sin traicionar sus principios fundamentales: que la razón debe gobernar la fuerza, que el derecho protege la libertad, y que la justicia es el fundamento de la convivencia civilizada.`,
                references: [
                    'Justiniano. "Corpus Iuris Civilis". Edición de P. Krueger y T. Mommsen. Berlín, 1928.',
                    'Cicerón. "De Legibus". Madrid: Gredos, 1999.',
                    'Schulz, Fritz. "Classical Roman Law". Oxford: Clarendon Press, 1951.',
                    'Buckland, W.W. "A Text-Book of Roman Law". Cambridge: Cambridge University Press, 1963.',
                    'Watson, Alan. "The Spirit of Roman Law". Athens: University of Georgia Press, 1995.'
                ]
            },
            {
                id: 'vol1-art3',
                title: 'La Ilustración y el Proyecto Moderno',
                author: 'Dr. Miguel Ángel Torres',
                authorBio: 'Doctor en Historia de las Ideas por la École des Hautes Études en Sciences Sociales (EHESS). Investigador especializado en Ilustración europea y modernidad.',
                pageStart: 52,
                pageEnd: 77,
                abstract: 'Análisis comprehensivo del proyecto ilustrado como fundamento de la modernidad occidental. Examina las ideas de razón, progreso, derechos naturales y secularización que definieron el pensamiento del siglo XVIII.',
                keywords: ['Ilustración', 'Modernidad', 'Racionalismo', 'Progreso', 'Kant', 'Voltaire'],
                content: `# La Ilustración y el Proyecto Moderno

## Introducción: "¡Atrévete a Saber!"

"Sapere aude!" — atrévete a saber. Con esta exhortación, Immanuel Kant capturó la esencia de la Ilustración en su ensayo "¿Qué es la Ilustración?" de 1784. La Ilustración no fue simplemente un período histórico o un conjunto de ideas, sino un proyecto: la emancipación de la humanidad mediante el uso público de la razón.

Este proyecto transformó radicalmente la civilización occidental, estableciendo fundamentos para las democracias liberales modernas, los derechos humanos universales, la ciencia experimental y el progreso material. Comprender la Ilustración es comprender los orígenes intelectuales del mundo contemporáneo, con todas sus promesas y contradicciones.`,
                references: [
                    'Kant, Immanuel. "¿Qué es la Ilustración?". Madrid: Alianza Editorial, 2004.',
                    'Gay, Peter. "The Enlightenment: An Interpretation". New York: Norton, 1995.',
                    'Cassirer, Ernst. "La filosofía de la Ilustración". México: FCE, 1997.'
                ]
            },
            {
                id: 'vol1-art4',
                title: 'Liberalismo Político: Evolución y Desafíos',
                author: 'Lic. Carolina Rivas',
                authorBio: 'Licenciada en Ciencia Política por la Universidad de Buenos Aires. Magíster en Teoría Política. Analista política especializada en pensamiento liberal contemporáneo.',
                pageStart: 78,
                pageEnd: 120,
                abstract: 'Exploración de la tradición liberal desde sus orígenes hasta sus desafíos contemporáneos. Analiza conceptos de libertad individual, Estado limitado, derechos de propiedad y tolerancia.',
                keywords: ['Liberalismo', 'Libertad', 'Democracia Liberal', 'Derechos Individuales', 'Estado de Derecho'],
                content: `# Liberalismo Político: Evolución y Desafíos

## Introducción: El Ideal de la Libertad Ordenada

El liberalismo político representa uno de los grandes proyectos civilizatorios de la modernidad. Su premisa central es a la vez simple y revolucionaria: los individuos poseen derechos inherentes que ningún gobierno puede legítimamente violar, y el Estado existe para proteger estos derechos, no para definir el significado de la vida buena.

Esta idea, tan familiar para nosotros que frecuentemente la damos por sentada, fue en su momento una ruptura radical con milenios de pensamiento político que asumía que el Estado debía promover la virtud, imponer ortodoxias religiosas o realizar visiones utópicas de perfección social.`,
                references: [
                    'Locke, John. "Segundo Tratado sobre el Gobierno Civil". Madrid: Alianza Editorial, 2000.',
                    'Mill, John Stuart. "Sobre la Libertad". Madrid: Alianza Editorial, 2001.',
                    'Rawls, John. "El Liberalismo Político". Barcelona: Crítica, 1996.'
                ]
            }
        ]
    },
    {
        id: 'vol2',
        volumeNumber: 2,
        title: 'Volumen II',
        editorialTitle: 'Economía y Libertad en el Siglo XXI',
        publishDate: '2025-04-20',
        description: 'Segunda entrega dedicada al análisis de los sistemas económicos contemporáneos, el papel del mercado y las tensiones entre libertad económica y justicia social.',
        editorial: `El segundo volumen de EXTRATEGIA explora una de las cuestiones más urgentes de nuestro tiempo: la relación entre libertad económica y prosperidad social.\n\nEn un contexto global marcado por creciente desigualdad, disrupciones tecnológicas y debates sobre el rol del Estado, resulta fundamental examinar rigurosamente cómo los sistemas económicos impactan en la libertad individual y el bienestar colectivo.\n\nEstos cuatro ensayos abordan desde diferentes perspectivas las tensiones entre mercado y democracia, la cuestión distributiva, el impacto de la innovación tecnológica y el diseño de políticas públicas que promuevan crecimiento sostenible sin sacrificar la libertad.\n\nInvitamos a un debate informado por evidencia, guiado por principios y comprometido con la búsqueda de soluciones que honren tanto la libertad como la justicia.`,
        pdfUrl: '#',
        coverImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        pageCount: 135,
        articles: [
            {
                id: 'vol2-art1',
                title: 'Capitalismo y Democracia: Una Relación Compleja',
                author: 'Dr. Fernando Gómez',
                authorBio: 'Doctor en Economía Política por la London School of Economics. Profesor titular de Economía Internacional. Asesor de organismos multilaterales.',
                pageStart: 5,
                pageEnd: 31,
                abstract: 'Investigación sobre la relación histórica y teórica entre sistemas capitalistas de mercado y regímenes democráticos. Examina si el capitalismo favorece u obstaculiza la democracia.',
                keywords: ['Capitalismo', 'Democracia', 'Economía Política', 'Libertad Económica', 'Instituciones'],
                content: `# Capitalismo y Democracia: Una Relación Compleja

## Introducción

La relación entre capitalismo y democracia ha sido una de las cuestiones más debatidas en teoría política y económica. ¿Son estos sistemas mutuamente compatibles, complementarios o incluso necesarios entre sí? ¿O existe una tensión fundamental entre la lógica del mercado y la lógica del gobierno popular?

(Contenido académico completo aquí)`,
                references: [
                    'Schumpeter, Joseph. "Capitalism, Socialism and Democracy". New York: Harper, 1942.',
                    'Friedman, Milton. "Capitalism and Freedom". Chicago: University of Chicago Press, 1962.',
                    'Acemoglu, Daron & Robinson, James. "Why Nations Fail". New York: Crown, 2012.'
                ]
            },
            {
                id: 'vol2-art2',
                title: 'El Debate sobre la Desigualdad Económica',
                author: 'Dra. Lucía Martínez',
                authorBio: 'Doctora en Sociología Económica por la Universidad de Oxford. Investigadora en temas de distribución del ingreso y movilidad social.',
                pageStart: 32,
                pageEnd: 60,
                abstract: 'Análisis riguroso del debate contemporáneo sobre desigualdad económica, evaluando causas, consecuencias y propuestas de política pública desde perspectivas empíricas.',
                keywords: ['Desigualdad', 'Distribución', 'Justicia Social', 'Movilidad Social', 'Políticas Redistributivas'],
                content: `# El Debate sobre la Desigualdad Económica

## Introducción

La creciente desigualdad económica se ha convertido en uno de los desafíos más apremiantes de las democracias contemporáneas...

(Contenido académico completo aquí)`,
                references: [
                    'Piketty, Thomas. "El Capital en el Siglo XXI". México: FCE, 2014.',
                    'Atkinson, Anthony. "Inequality: What Can Be Done?". Cambridge: Harvard University Press, 2015.',
                    'Milanovic, Branko. "Global Inequality". Cambridge: Harvard University Press, 2016.'
                ]
            },
            {
                id: 'vol2-art3',
                title: 'Innovación Tecnológica y Disrupciones Económicas',
                author: 'Ing. Roberto Chen',
                authorBio: 'Ingeniero en Sistemas y MBA por Stanford. Emprendedor tecnológico y analista de transformación digital en economías emergentes.',
                pageStart: 61,
                pageEnd: 88,
                abstract: 'Exploración del impacto de la innovación tecnológica en estructuras económicas tradicionales, mercados laborales y distribución del valor económico.',
                keywords: ['Innovación', 'Tecnología', 'Automatización', 'Futuro del Trabajo', 'Economía Digital'],
                content: `# Innovación Tecnológica y Disrupciones Económicas

## Introducción

Vivimos una era de aceleración tecnológica sin precedentes. La inteligencia artificial, la robótica, la biotecnología y otras tecnologías emergentes están transformando radicalmente la estructura de nuestras economías...

(Contenido académico completo aquí)`,
                references: [
                    'Brynjolfsson, Erik & McAfee, Andrew. "The Second Machine Age". New York: Norton, 2014.',
                    'Schwab, Klaus. "The Fourth Industrial Revolution". Geneva: World Economic Forum, 2016.',
                    'Ford, Martin. "Rise of the Robots". New York: Basic Books, 2015.'
                ]
            },
            {
                id: 'vol2-art4',
                title: 'Políticas Públicas y Crecimiento Sostenible',
                author: 'Lic. Ana Gutiérrez',
                authorBio: 'Licenciada en Economía por la Universidad de Buenos Aires. Especialista en políticas públicas y desarrollo sostenible. Consultora para organismos internacionales.',
                pageStart: 89,
                pageEnd: 135,
                abstract: 'Análisis de estrategias de política pública que buscan conciliar crecimiento económico con sostenibilidad ambiental y social. Evaluación empírica de experiencias internacionales.',
                keywords: ['Políticas Públicas', 'Crecimiento', 'Sostenibilidad', 'Desarrollo', 'Instituciones'],
                content: `# Políticas Públicas y Crecimiento Sostenible

## Introducción

El desafío del desarrollo sostenible requiere repensar fundamentalmente cómo diseñamos e implementamos políticas públicas. No se trata simplemente de elegir entre crecimiento económico y protección ambiental, sino de encontrar senderos de desarrollo que integren ambos objetivos...

(Contenido académico completo aquí)`,
                references: [
                    'Sachs, Jeffrey. "The Age of Sustainable Development". New York: Columbia University Press, 2015.',
                    'Ostrom, Elinor. "Governing the Commons". Cambridge: Cambridge University Press, 1990.',
                    'Rodrik, Dani. "Economics Rules". New York: Norton, 2015.'
                ]
            }
        ]
    }
];
