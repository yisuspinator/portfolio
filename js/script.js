let translations = {};
let currentLang = 'es';

async function loadTranslations() {
    const response = await fetch('/data/translations.json');
    translations = await response.json();

    setLang(currentLang);
    //console.log("Translations loaded:", translations);
}

function setLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    if (translations[lang]) {
        if (document.title !== undefined) document.title = translations[lang].title;
        const ids = [
            ['page-title', 'title'],
            ['logo-text', 'logo'],
            ['nav-about', 'nav.about'],
            ['nav-portfolio', 'nav.portfolio'],
            ['nav-experience', 'nav.experience'],
            ['nav-contact', 'nav.contact'],
            ['about-title', 'aboutTitle'],
            ['about-desc', 'aboutDesc'],
            ['about-photo-placeholder', 'aboutPhoto'],
            ['portfolio-title', 'portfolioTitle'],
            ['experience-title', 'experienceTitle'],
            ['features-title', 'featuresTitle'],
            ['contact-title', 'contactTitle'],
            ['contact-form-title', 'contactFormTitle'],
            ['contact-form-description', 'contactFormDescription'],
            ['label-name', 'labelName'],
            ['label-email', 'labelEmail'],
            ['label-message', 'labelMessage'],
            ['send-btn', 'sendBtn'],
            ['footer-text', 'footer'],
            ['pi-cbtopgn-about-desc', 'piCBToPGNAboutDesc']
        ];
        ids.forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (el && translations[lang]) {
                // Soporte para claves anidadas (nav.about, etc)
                let value = translations[lang];
                key.split('.').forEach(k => value = value && value[k]);
                if (value !== undefined) {
                    if (id === 'footer-text') {
                        el.innerHTML = value;
                    } else {
                        el.textContent = value;
                    }
                }
            }
        });

        // Placeholders
        const nameInput = document.getElementById('name');
        if (nameInput && translations[lang].placeholders?.name)
            nameInput.placeholder = translations[lang].placeholders.name;
        const emailInput = document.getElementById('email');
        if (emailInput && translations[lang].placeholders?.email)
            emailInput.placeholder = translations[lang].placeholders.email;
        const messageInput = document.getElementById('message');
        if (messageInput && translations[lang].placeholders?.message)
            messageInput.placeholder = translations[lang].placeholders.message;

        // Traducción dinámica de los proyectos
        document.querySelectorAll('.portfolio-item-title').forEach(el => {
            if (el && el.dataset[lang]) el.textContent = el.dataset[lang];
        });
        document.querySelectorAll('.portfolio-item-desc').forEach(el => {
            if (el && el.dataset[lang]) el.textContent = el.dataset[lang];
        });
        document.querySelectorAll('.portfolio-item .cta-button').forEach(el => {
            if (el && el.dataset[lang]) el.textContent = el.dataset[lang];
        });

        // Traducción dinámica de experiencia
        document.querySelectorAll('.experience-item strong, .experience-item span, .experience-item div, .feature-item div').forEach(el => {
            if (el && el.dataset[lang]) el.innerHTML = el.dataset[lang].replace(/\\n/g, "<br>");
        });

        // Botones de idioma
        const langEs = document.getElementById('lang-es');
        const langEn = document.getElementById('lang-en');
        if (langEs) langEs.classList.toggle('selected', lang === 'es');
        if (langEn) langEn.classList.toggle('selected', lang === 'en');
        if (lang === 'es' && langEs) {
            langEs.focus();
        } else if (langEn) {
            langEn.focus();
        }
    }
}

function setCustomValidationMessages(textbox) {
    const msgs = translations[currentLang]?.requiredMessages || {};
    const value = textbox.value.trim();

    if (value === '') {
        if (textbox.id === 'name') {
            textbox.setCustomValidity(msgs.name || 'Required name');
        } else if (textbox.id === 'email') {
            textbox.setCustomValidity(msgs.email || 'Required email address');
        } else if (textbox.id === 'message') {
            textbox.setCustomValidity(msgs.message || 'Required message');
        }
    } else if (textbox.validity.typeMismatch && textbox.id === 'email') {
        textbox.setCustomValidity(msgs.emailMismatch || 'Please enter a valid email address');
    } else {
        textbox.setCustomValidity('');
    }

    return true;
}

function init() {
    document.getElementById('lang-es').addEventListener('click', () => setLang('es'));
    document.getElementById('lang-en').addEventListener('click', () => setLang('en'));

    // Navegación activa
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function () {
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
        });
    });

    //let contactForm = document.getElementById('contact-form');
    //contactForm.action = "https://formsubmit.co/" + emailAddress;
    //contactForm.action = "https://formsubmit.co/5560519efc96f71e239be7b0b5f4191b";
    //console.log("Contact form action set to:", contactForm.action);

    /*
    // Formulario de contacto (solo muestra mensaje de éxito)
    let contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            document.getElementById('contact-success').textContent = translations[currentLang].contactSuccess;
            document.getElementById('contact-success').style.display = 'block';
            this.reset();
            setTimeout(() => {
                document.getElementById('contact-success').style.display = 'none';
            }, 4000);
        });
    } 
    */

    // Inicializa idioma por defecto
    loadTranslations();
}

