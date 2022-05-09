class Rectangle {
    id;
    studentEmail;
    buddyEmail;
    lesson;
    subject;
    startTime;
    endTime;
    weekday;
    x;
    y;
    width;
    height;
    element;
    color;

    constructor(id, lesson, startTime, endTime, weekday, color) {
        this.id = "rect-id-" + id;
        this.lesson = lesson;
        this.startTime = startTime;
        this.endTime = endTime;
        this.weekday = weekday;
        this.color = color
        const yStartAxis = document.getElementById(`hour-${Math.floor(this.startTime)}`).getBoundingClientRect();
        const yEndAxis = document.getElementById(`hour-${Math.floor(this.endTime)}`).getBoundingClientRect();
        const xAxis = document.getElementById(`h-${this.weekday}`).getBoundingClientRect();
        this.x = xAxis.x;
        this.y = yStartAxis.y;
        this.width = xAxis.right - xAxis.left;
        this.height = yEndAxis.y - yStartAxis.y;
    }

    draw() {
        this.element = document.createElement('div');
        this.element.appendChild(document.createTextNode(this.lesson));
        this.element.id = this.id;
        this.element.className = 'rectangle';
        this.element.style.left = `${this.weekday * 187.5 - 10}px`;
        this.element.style.top = `${(this.startTime-Math.floor(this.startTime))*100}px`;
        this.element.style.height = `${(this.height - ((this.startTime-Math.floor(this.startTime))*100)) + (this.endTime - Math.floor(this.endTime))*100}px`;
        this.element.style.background = this.color;
        document.getElementById(`hour-${Math.floor(this.startTime)}`).appendChild(this.element);
    }
}

window.onload = () => {
    const r1 = new Rectangle(0, 'Mathematics', '13.3', '15.0', 2);
    const r2 = new Rectangle(1, 'Geography', '6.15', '7.45', 4, "red");
    r1.draw();
    r2.draw();
}
