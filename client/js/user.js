let captchaToken;

function renderCaptcha(id) {
    grecaptcha.render(id, {
        sitekey: '6LfVtNMdAAAAANnjEs_9rABy8Zs2xY0IIwfdRMge',
        callback: token => {
            captchaToken = token;
        },
    });
}