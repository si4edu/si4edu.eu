class Rectangle {
    id;
    studentEmail;
    lesson;
    subject;
    startTime;
    endTime;
    date;
    x;
    y;
    width;
    height;
    element;

    constructor(id, lesson, startTime, endTime, date) {
        this.id = "rect-id-" + id;
        this.lesson = lesson;
        this.startTime = startTime;
        this.endTime = endTime;
        this.date = date;
    }

    draw() {
        this.element = document.createElement('div');
        this.element.appendChild(document.createTextNode(this.lesson));
        this.element.id = this.id;
        this.element.className = 'rectangle';
        this.element.style.left = `${this.date.getUTCDay() * 187.5 - 10}px`;
        this.element.style.height = `${this.height}px`;
        document.getElementById(`hour-${Math.floor(this.startTime)}`).appendChild(this.element);
    }
}

let r;
let weekday;

window.onload = () => {
    r = new Rectangle(0, 'Mathematics', '13.0', '21.0', new Date());
    weekday = r.date.getUTCDay();
    const yStartAxis = document.getElementById(`hour-${Math.floor(r.startTime)}`).getBoundingClientRect();
    const yEndAxis = document.getElementById(`hour-${Math.floor(r.endTime)}`).getBoundingClientRect();
    const xAxis = document.getElementById(`h-${weekday}`).getBoundingClientRect();
    r.x = xAxis.x;
    r.y = yStartAxis.y;
    r.width = xAxis.right - xAxis.left;
    r.height = yEndAxis.y - yStartAxis.y;
    r.draw();
}