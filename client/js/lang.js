const langs = {};
langs.pl = {
    'team-link': 'Nasz zespół',
    'about-link': 'O Nas',
    'contact-link': 'Kontakt',
    'login-button': 'Zaloguj się',
    'landing-header': 'STUDENCKA\nINICJATYWA\nDLA\nEDUKACJI',
    'landing-info-header': 'INFO',
    'landing-info-1': 'Czy właśnie przeprowadziłeś się do nowego kraju? Czy musiałeś uciekać w obawie o własne życie? Czy jako dziecko musiałeś zostawić za sobą cały swój świat? Czy stało się to z powodu wojny? Prawdopodobnie nie. Tak jest jednak w przypadku ponad 3 milionów uchodźców z Ukrainy, którzy teraz szukają schronienia w Polsce.. Nie znają języka, ludzi i kultury.',
    'landing-info-2': 'SIEDU stworzyliśmy dla Was! Nie jesteśmy w stanie wyobrazić sobie, co teraz czujesz, ale jesteśmy po to, by Ci pomóc i sprawić, by proces asymilacji był jak najszybszy i jak najłatwiejszy. Pomożemy Ci z nauką, odnalezieniem się w nowym środowisku, pokażemy Ci Polskę i Polaków z jak najlepszej strony. Jak? Wystarczy, że poprosisz, a my pomożemy! Pomoc nie zna granic!',
    'landing-info-button': 'Dowiedz się więcej',
    'landing-boxes-1-header': 'Kto?',
    'landing-boxes-1-text': 'Społeczność studentów i uczniów zdecydowanych pomóc rówieśnikom z Ukrainy.',
    'landing-boxes-2-header': 'Dlaczego?',
    'landing-boxes-2-text': 'Chcemy pomóc Ukraińskiej młodzieży w zminimalizowaniu zakłóceń w ich edukacji i życiu codziennym.',
    'landing-boxes-3-header': 'Jak?',
    'landing-boxes-3-text': 'Pomagamy w asymilacji poprzez bezpłatną, zindywidualizowaną edukację oraz spotkania z Polskimi uczniami i studentami.',
    'follow-button-text': 'Obserwuj nas',
};
langs.ua = {
    'team-link': 'XXXXX',
    'about-link': 'XXXXX',
    'contact-link': 'XXXXX',
    'login-button': 'XXXXX',
    'landing-header': 'XXXXXX\nXXXXX\nXXXXXX\nXXXXXX',
    'landing-info-header': 'XXXXXX',
    'landing-info-1': 'XXXXXX',
    'landing-info-2': 'XXXXXX',
    'landing-info-button': 'XXXXXX',
    'landing-boxes-1-header': 'XXXXXX',
    'landing-boxes-1-text': 'XXXXXX',
    'landing-boxes-2-header': 'XXXXXX',
    'landing-boxes-2-text': 'XXXXXX',
    'landing-boxes-3-header': 'XXXXXX',
    'landing-boxes-3-text': 'XXXXXX',
    'follow-button-text': 'XXXXX',
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