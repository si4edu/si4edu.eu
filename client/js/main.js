function updatePage(href) {
    for (const page of document.getElementsByClassName('page')) {
        page.style = 'display:none';
    }

    for (const link of document.querySelectorAll('.page-link')) {
        link.classList.remove('page-link-active');
    }

    let path = href.split('/');
    const page = document.getElementById(path[1]);
    if (!page) {
        document.getElementById('landing').style = document.getElementById('contact').style = '';
        history.replaceState(null, '', href = '/');
        return;
    }
    page.style = '';

    if (href != '/') {
        document.querySelector(`[href="/${path[1]}"]`)?.classList.add('page-link-active');
    }
}

function autorun() {
    window.onpopstate = () => {
        updatePage(location.pathname);
    };

    for (const link of document.querySelectorAll('.page-link')) {
        link.onclick = () => {
            history.pushState(null, '', link.href);
            updatePage(link.getAttribute('href'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
            nav.open = false;
            nav.removeAttribute('open');
            return false;
        }
    }

    updatePage(location.pathname);

    fetch('/photos').then(res => res.json()).then(data => {
        for (const photo of data) {
            const img = document.createElement('a');
            img.style = `background-image:url("/photos/${photo}")`;
            img.href = `https://instagram.com/p/${photo}`;
            img.target = '_blank';
            document.getElementById('instagram-feed').appendChild(img);
        }
    });

    const nav = document.querySelector('nav');
    document.getElementById('mobile-menu').onclick = () => {
        nav.open = !nav.open;
        if (nav.open) {
            nav.setAttribute('open', true);
        } else {
            nav.removeAttribute('open');
        }
    };
}

function onload() { }

if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', autorun, false);
    window.addEventListener('load', onload, false);
} else if (document.attachEvent) {
    document.attachEvent('onreadystatechange', autorun);
    window.attachEvent('onload', onload);
} else {
    window.onload = () => {
        autorun();
        onload();
    };
}