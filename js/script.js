document.addEventListener('DOMContentLoaded', () => {
    // Selecciona todas las secciones de contenido, excluyendo la sección 'hero'
    // que se animará de manera diferente al cargar la página.
    const contentSections = document.querySelectorAll('.content-section:not(#hero)');

    // Selecciona todos los ítems de proyectos dentro de la cuadrícula del portafolio.
    const projectItems = document.querySelectorAll('#portfolio-grid .project-item');

    // Selecciona el encabezado de la página.
    const header = document.querySelector('header');

    // Opciones para el Intersection Observer.
    // rootMargin: Permite que la animación se active un poco antes de que el elemento
    // esté completamente visible, dando una sensación más fluida.
    // threshold: El porcentaje del elemento que debe ser visible para que la devolución
    // de llamada se active.
    const observerOptions = {
        rootMargin: '-20px 0px -20px 0px', // Activa 20px antes de entrar/salir del borde superior/inferior
        threshold: 0.1 // El 10% del elemento debe ser visible
    };

    // --- Observer para las secciones generales (Acerca de mí, Currículum, Contacto) ---
    // Este observador detecta cuándo una sección de contenido entra en el área visible.
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Si la sección es visible, le añade la clase 'animated'.
                // Esta clase activa la transición de CSS (opacidad y transformación).
                entry.target.classList.add('animated');
                // Deja de observar la sección una vez que ya ha sido animada.
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Itera sobre cada sección de contenido y empieza a observarla.
    contentSections.forEach(section => {
        sectionObserver.observe(section);
    });

    // --- Observer para los ítems del portafolio ---
    // Similar al anterior, pero específico para los proyectos individuales.
    const projectObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Cuando un ítem de proyecto es visible, le añade la clase 'animated'.
                entry.target.classList.add('animated');
                // Deja de observar el ítem una vez que ya ha sido animado.
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Itera sobre cada ítem de proyecto y empieza a observarlo.
    projectItems.forEach(item => {
        projectObserver.observe(item);
    });

    // --- Efecto de 'scroll' en el encabezado (header) ---
    // Este evento se dispara cada vez que el usuario hace scroll.
    window.addEventListener('scroll', () => {
        // Si el usuario se ha desplazado más de 50 píxeles hacia abajo...
        if (window.scrollY > 50) {
            // ...añade la clase 'scrolled' al header.
            // Esta clase en CSS cambiará el estilo del header (ej., más compacto, sombra).
            header.classList.add('scrolled');
        } else {
            // Si el usuario vuelve arriba, quita la clase 'scrolled'.
            header.classList.remove('scrolled');
        }
    });

    // --- Desplazamiento suave (Smooth Scroll) para enlaces de navegación ---
    // Esto es útil si decides tener anclas que lleven a secciones dentro de la misma página
    // (ej., un botón "Ir a Portafolio" en el Home que desplace suavemente).
    // También maneja la navegación a otras páginas HTML de forma estándar.
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Verifica si el enlace es un ancla interna (empieza con '#').
            if (href.startsWith('#')) {
                e.preventDefault(); // Previene el comportamiento por defecto del ancla (salto brusco).
                const targetId = href.substring(1); // Obtiene el ID de la sección (sin el '#').
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    // Desplaza la ventana suavemente hasta el elemento objetivo.
                    // Resta la altura del header para que la sección no quede oculta debajo.
                    window.scrollTo({
                        top: targetElement.offsetTop - (header ? header.offsetHeight : 0),
                        behavior: 'smooth' // Habilita el desplazamiento suave.
                    });
                }
            }
            // Si el enlace no empieza con '#', el navegador maneja la navegación normal
            // a otra página HTML (ej., about.html, portfolio.html).
        });
    });

    // --- Animación de entrada para la Hero Section al cargar la página ---
    // Esta sección se anima inmediatamente sin Intersection Observer,
    // ya que es la primera cosa que ve el usuario.
    const heroContent = document.querySelector('#hero .hero-content');
    if (heroContent) {
        // La animación 'fadeInSlideUp' se define en el CSS.
        // Aquí simplemente nos aseguramos de que el elemento tenga su estado inicial
        // y se aplique la animación al cargar el DOM.
        // La clase 'animated' también puede usarse si hay una animación más general.
        // No es necesario añadir una clase específica si la animación ya está
        // definida directamente con `animation` en el CSS para `hero-content`.
    }
});
