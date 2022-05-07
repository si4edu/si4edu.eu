const langs = {};
langs.pl = {
    'team-link': 'Nasz zespół',
    'about-link': 'O Nas',
    'contact-link': 'Kontakt',
    'login-button': 'Zaloguj się',
};
langs.ua = {
    'team-link': 'XXXXX',
    'about-link': 'XXXXX',
    'contact-link': 'XXXXX',
    'login-button': 'XXXXX',
};

let langChanged;
function setLang(lang) {
    localStorage.lang = lang;
    if (!langChanged) {
        langs.en = {};
    }
    lang = langs[lang];
    for (const id in lang) {
        const text = document.getElementById(id);
        if (!langChanged) {
            langs.en[id] = text.innerText;
        }
        text.innerText = lang[id];
    }
    langChanged = true;
}