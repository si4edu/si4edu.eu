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
    'landing-header': 'СТУДЕНТСЬКА\nІНІЦІАТИВА\nДЛЯ\nОСВІТИ',
    'landing-info-header': 'ІНФО',
    'landing-info-1': 'Ви тільки що переїхали в нову країну? Чи доводилося вам тікати, побоюючись. Ваше власне життя? У дитинстві вам довелося залишити весь свій світ позаду? Чи сталося це Через війну? Напевно, ні. Однак це стосується понад 3 мільйонів біженців з України, які зараз шукають притулку в Польщі. Вони не знають мови, людей і Культура.',
    'landing-info-2': 'Ми створили SIEDU для вас! Ми не можемо уявити, що ви зараз відчуваєте, але ми тут, щоб допомогти вам і зробити процес засвоєння максимально швидким і легким. Ми допоможемо вам у навчанні, опинитися в новому середовищі, ми покажемо вам Польщу та поляків у найкращому вигляді. Як? Просто запитайте і ми допоможемо! Допомога не знає меж!',
    'landing-info-button': 'Дізнайтеся більше',
    'landing-boxes-1-header': 'Хто?',
    'landing-boxes-1-text': 'Спільнота студентів та школярів вирішила допомогти своїм одноліткам з України.',
    'landing-boxes-2-header': 'Чому?',
    'landing-boxes-2-text': 'Ми хочемо допомогти українській молоді мінімізувати збої в освіті та повсякденному житті.',
    'landing-boxes-3-header': 'Як?',
    'landing-boxes-3-text': 'Ми допомагаємо в асиміляції через безкоштовну, індивідуальну освіту та зустрічі з польськими студентами.',
    'follow-button-text': 'XXXXX',
};

let langChanged;
function setLang(lang) {
    localStorage.lang = lang;
    if (!langChanged) {
        langs.en = { 'landing-header' : 'STUDENT\nINITIATIVE\nFOR\nEDUCATION' };
    }
    lang = langs[lang];
    for (const id in lang) {
        const text = document.getElementById(id);
        if (!langChanged && !langs.en.hasOwnProperty(id)) {
            langs.en[id] = text.innerText;
        }
        text.innerText = lang[id];
    }
    langChanged = true;
}