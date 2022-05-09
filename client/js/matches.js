class Match {
    element;

    constructor(fullname, subjectsArr) {
        this.fullname = fullname;
        this.subjectsArr = subjectsArr;
    }

    draw() {
        let header = document.createElement('h2');
        header.appendChild(document.createTextNode(this.fullname.replace(' ', '\n\n')));
        header.className = 'matches-header';

        let div = document.createElement('div');
        div.className = 'matches-subjects';
        this.subjectsArr.forEach(el => {
            let span = document.createElement('span');
            span.appendChild(document.createTextNode(el));
            div.appendChild(span);
        });

        this.element = document.createElement('li');
        this.element.appendChild(header);
        this.element.appendChild(div);
        document.getElementById('matches-list').appendChild(this.element);
    }
}

window.onload = () => {
    const m1 = new Match('Someone Someone', ['Mathematics', 'Geography', 'Polish']);
    m1.draw();
    const m2 = new Match('Someone Different', ['French', 'German', 'Geography', 'Polish']);
    m2.draw();
    const m3 = new Match('Third Person', ['Chemistry', 'English', 'Mathematics', 'Geography', 'Polish']);
    m3.draw();
}