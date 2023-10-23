class Gameobject {
    constructor(prop, main) {
        this.main = main;
        this.name = "";
        this.pos = new Vec2();
        this.rot = 0;
        this.renderers = new UniqueList();
        this.components = new UniqueList();
        if (prop) {
            if (prop.name) {
                this.name = prop.name;
            }
            if (prop.pos) {
                this.pos.copyFrom(prop.pos);
            }
            if (isFinite(prop.rot)) {
                this.rot = prop.rot;
            }
        }
    }
    instantiate() {
        this.main.gameobjects.push(this);
    }
    dispose() {
        this.main.gameobjects.remove(this);
        this.components.forEach(component => {
            component.dispose();
        });
    }
    addComponent(component) {
        if (component instanceof Renderer) {
            this.renderers.push(component);
        }
        this.components.push(component);
        return component;
    }
    start() {
    }
    update(dt) {
    }
    stop() {
        this.components.forEach(component => {
            component.onStop();
        });
    }
    draw() {
        if (this.renderers) {
            this.renderers.forEach(renderer => {
                renderer.draw();
            });
        }
    }
    updatePosRot() {
        if (this.renderers) {
            this.renderers.forEach(renderer => {
                renderer.updatePosRot();
            });
        }
    }
}
/// <reference path="./engine/Gameobject.ts" />
class Ball extends Gameobject {
    constructor(main, color = BlockColor.Red) {
        super({}, main);
        this.color = color;
        this.speed = new Vec2(0, 0);
        this.radius = 15;
        this.ghost = false;
    }
    instantiate() {
        super.instantiate();
        this._renderer = this.addComponent(new CircleRenderer(this, { radius: this.radius, layer: 3 }));
        this._renderer.addClass("ball");
        this.setColor(this.color);
    }
    start() {
        super.start();
    }
    update(dt) {
        super.update(dt);
        this.pos.x += this.speed.x * dt;
        this.pos.y += this.speed.y * dt;
        if (this.pos.x < this.radius) {
            this.pos.x = this.radius;
            this.speed.x *= -1;
        }
        if (this.pos.y < this.radius) {
            this.pos.y = this.radius;
            this.speed.y *= -1;
        }
        if (this.pos.x > 1600 - this.radius) {
            this.pos.x = 1600 - this.radius;
            this.speed.x *= -1;
        }
        if (this.pos.y > 1000 - this.radius) {
            this.pos.y = 1000 - this.radius;
            this.speed.y *= -1;
        }
        if (!this.ghost) {
            let hit;
            let axis;
            this.main.gameobjects.forEach(other => {
                if (other instanceof Block) {
                    let currHit = other.intersectsBall(this);
                    if (currHit.hit) {
                        hit = other;
                        axis = currHit.axis;
                    }
                }
            });
            if (hit) {
                this.speed.mirrorInPlace(axis);
                if (hit.color != this.color) {
                    hit.dispose();
                }
                else {
                    hit.expand();
                    this.ghost = true;
                    if (this.color === BlockColor.Green) {
                        this.speed.x = Math.abs(this.speed.x);
                    }
                    else {
                        this.speed.x = -Math.abs(this.speed.x);
                    }
                }
            }
        }
        else {
            if (this.color === BlockColor.Green) {
                if (this.pos.x > 800) {
                    this.ghost = false;
                }
            }
            else {
                if (this.pos.x < 800) {
                    this.ghost = false;
                }
            }
        }
    }
    stop() {
        super.stop();
    }
    setColor(color) {
        this.color = color;
        if (this.color === BlockColor.Red) {
            this._renderer.addClass("red");
        }
        else if (this.color === BlockColor.Green) {
            this._renderer.addClass("green");
        }
    }
}
/// <reference path="./engine/Gameobject.ts" />
var BlockColor;
(function (BlockColor) {
    BlockColor[BlockColor["Red"] = 0] = "Red";
    BlockColor[BlockColor["Green"] = 1] = "Green";
})(BlockColor || (BlockColor = {}));
class Block extends Gameobject {
    constructor(i, j, main, color = BlockColor.Red) {
        super({}, main);
        this.i = i;
        this.j = j;
        this.color = color;
        this.pos.x = 25 + i * 50;
        this.pos.y = 50 + j * 100;
        this.main.blocks[i][j] = this;
    }
    instantiate() {
        super.instantiate();
        this._renderer = this.addComponent(new PathRenderer(this, {
            points: [
                new Vec2(-20, -45),
                new Vec2(20, -45),
                new Vec2(20, 45),
                new Vec2(-20, 45)
            ],
            close: true,
            layer: 2
        }));
        this._renderer.addClass("block");
        this.setColor(this.color);
    }
    start() {
        super.start();
    }
    update(dt) {
        super.update(dt);
    }
    stop() {
        super.stop();
    }
    dispose() {
        this.main.blocks[this.i][this.j] = undefined;
        super.dispose();
    }
    setColor(color) {
        this.color = color;
        if (this.color === BlockColor.Red) {
            this._renderer.addClass("red");
        }
        else if (this.color === BlockColor.Green) {
            this._renderer.addClass("green");
        }
    }
    intersectsBall(ball, margin = 0) {
        let xMin = this.pos.x - 25;
        let xMax = this.pos.x + 25;
        let yMin = this.pos.y - 50;
        let yMax = this.pos.y + 50;
        let r = ball.radius + margin;
        if (ball.pos.x - r > xMax) {
            return { hit: false };
        }
        if (ball.pos.y - r > yMax) {
            return { hit: false };
        }
        if (ball.pos.x + r < xMin) {
            return { hit: false };
        }
        if (ball.pos.y + r < yMin) {
            return { hit: false };
        }
        let axis = ball.pos.subtract(this.pos);
        let xDepth = Math.abs(Math.abs(ball.pos.x - this.pos.x) - r - 25);
        let yDepth = Math.abs(Math.abs(ball.pos.y - this.pos.y) - r - 50);
        if (xDepth < yDepth) {
            axis.y = 0;
            axis.normalizeInPlace();
        }
        else {
            axis.x = 0;
            axis.normalizeInPlace();
        }
        return { hit: true, axis: axis };
    }
    expand() {
        let newBlocks = [];
        if (this.main.blocks[this.i + 1]) {
            if (!this.main.blocks[this.i + 1][this.j]) {
                let iNext = new Block(this.i + 1, this.j, this.main, this.color);
                iNext.instantiate();
                newBlocks.push(iNext);
            }
        }
        if (this.main.blocks[this.i - 1]) {
            if (!this.main.blocks[this.i - 1][this.j]) {
                let iPrev = new Block(this.i - 1, this.j, this.main, this.color);
                iPrev.instantiate();
                newBlocks.push(iPrev);
            }
        }
        if (!this.main.blocks[this.i][this.j + 1]) {
            let jNext = new Block(this.i, this.j + 1, this.main, this.color);
            jNext.instantiate();
            newBlocks.push(jNext);
        }
        if (!this.main.blocks[this.i][this.j - 1]) {
            let jPrev = new Block(this.i, this.j - 1, this.main, this.color);
            jPrev.instantiate();
            newBlocks.push(jPrev);
        }
        return newBlocks;
    }
}
/// <reference path="./engine/Gameobject.ts" />
class Main {
    constructor() {
        this.layers = [];
        this.gameobjects = new UniqueList();
        this._lastT = 0;
        this._mainLoop = () => {
            let dt = 0;
            let t = performance.now();
            if (isFinite(this._lastT)) {
                dt = (t - this._lastT) / 1000;
            }
            this._lastT = t;
            if (this._update) {
                this._update(dt);
            }
            requestAnimationFrame(this._mainLoop);
        };
        this.pointerClientPos = new Vec2();
        this._onPointerMove = (ev) => {
            this.pointerClientPos.x = ev.clientX;
            this.pointerClientPos.y = ev.clientY;
        };
        this._onResize = () => {
            let screenWidth = document.body.clientWidth;
            let screenHeight = document.body.clientHeight;
            let screenRatio = screenWidth / screenHeight;
            let w;
            let marginLeft;
            let h;
            let marginTop;
            let r = 1.6;
            if (screenRatio >= r) {
                h = screenHeight * 0.9;
                w = h * r;
            }
            else {
                w = screenWidth * 0.9;
                h = w / r;
            }
            marginLeft = (screenWidth - w) / 2;
            marginTop = (screenHeight - h) / 2;
            this.container.style.width = w + "px";
            this.container.style.height = h + "px";
            this.container.style.marginLeft = marginLeft + "px";
            this.container.style.marginTop = marginTop + "px";
            this.containerRect = this.container.getBoundingClientRect();
        };
    }
    instantiate() {
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.container.id = "main-container";
        this.container.setAttribute("viewBox", "0 0 1600 1000");
        document.body.appendChild(this.container);
        for (let i = 0; i < 4; i++) {
            let layer = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.container.appendChild(layer);
            this.layers[i] = layer;
        }
        window.addEventListener("resize", this._onResize);
        window.addEventListener("pointerenter", this._onPointerMove);
        window.addEventListener("pointermove", this._onPointerMove);
        this.makeLevel1();
        this._onResize();
        this._mainLoop();
    }
    makeLevel1() {
        this.blocks = [];
        for (let i = 0; i < 32; i++) {
            this.blocks[i] = [];
        }
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 10; j++) {
                let block = new Block(i, j, this, BlockColor.Green);
                block.instantiate();
            }
        }
        for (let i = 32 - 5; i < 32; i++) {
            for (let j = 0; j < 10; j++) {
                let block = new Block(i, j, this, BlockColor.Red);
                block.instantiate();
            }
        }
        for (let n = 0; n < 2; n++) {
            let ball = new Ball(this, BlockColor.Green);
            ball.pos.x = 800;
            ball.pos.y = 400;
            ball.instantiate();
            let a = Math.random() * 2 * Math.PI;
            ball.speed.x = Math.cos(a) * 400;
            ball.speed.y = Math.sin(a) * 400;
            let ball2 = new Ball(this, BlockColor.Red);
            ball2.pos.x = 800;
            ball2.pos.y = 400;
            ball2.instantiate();
            let a2 = Math.random() * 2 * Math.PI;
            ball2.speed.x = Math.cos(a2) * 400;
            ball2.speed.y = Math.sin(a2) * 400;
        }
    }
    start() {
        document.getElementById("credit").style.display = "none";
        this.gameobjects.forEach(gameobject => {
            gameobject.start();
            gameobject.draw();
        });
        this._update = (dt) => {
            this.gameobjects.forEach(gameobject => {
                gameobject.update(dt);
            });
            this.gameobjects.forEach(gameobject => {
                gameobject.updatePosRot();
            });
        };
    }
    stop() {
        this._update = () => {
        };
        this.gameobjects.forEach(gameobject => {
            gameobject.stop();
        });
    }
    gameover(success) {
        this.stop();
        document.getElementById("credit").style.display = "block";
    }
    dispose() {
        while (this.gameobjects.length > 0) {
            this.gameobjects.get(0).dispose();
        }
    }
    clientXYToContainerXY(clientX, clientY) {
        let v = new Vec2();
        return this.clientXYToContainerXYToRef(clientX, clientY, v);
    }
    clientXYToContainerXYToRef(clientX, clientY, ref) {
        let px = clientX - this.containerRect.left;
        let py = clientY - this.containerRect.top;
        px = px / this.containerRect.width * 1000;
        py = py / this.containerRect.height * 1000;
        ref.x = px;
        ref.y = py;
        return ref;
    }
}
window.addEventListener("load", () => {
    let main = new Main();
    main.instantiate();
    requestAnimationFrame(() => {
        main.start();
    });
});
class Component {
    constructor(gameobject) {
        this.gameobject = gameobject;
    }
    dispose() { }
    onStart() { }
    onPause() { }
    onUnpause() { }
    onStop() { }
}
/// <reference path="Component.ts" />
class Renderer extends Component {
    constructor(gameobject, prop) {
        super(gameobject);
        this.layer = 0;
        this._classList = new UniqueList();
        if (prop) {
            if (isFinite(prop.layer)) {
                this.layer = prop.layer;
            }
            if (prop.classList) {
                prop.classList.forEach(c => {
                    this.addClass(c);
                });
            }
        }
    }
    addClass(c) {
        this._classList.push(c);
        this.onClassAdded(c);
    }
    removeClass(c) {
        this._classList.remove(c);
        this.onClassRemoved(c);
    }
    draw() {
    }
    updatePosRot() {
    }
}
class CircleRenderer extends Renderer {
    constructor(gameobject, prop) {
        super(gameobject, prop);
        this._radius = 10;
        if (prop) {
            if (isFinite(prop.radius)) {
                this.radius = prop.radius;
            }
        }
    }
    get radius() {
        return this._radius;
    }
    set radius(v) {
        this._radius = v;
        if (this.svgElement) {
            this.svgElement.setAttribute("r", this.radius.toFixed(1));
        }
    }
    onClassAdded(c) {
        if (this.svgElement) {
            this.svgElement.classList.add(c);
        }
    }
    onClassRemoved(c) {
        if (this.svgElement) {
            this.svgElement.classList.remove(c);
        }
    }
    draw() {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.svgElement.setAttribute("r", this.radius.toFixed(1));
            this._classList.forEach(c => {
                this.onClassAdded(c);
            });
            this.gameobject.main.layers[this.layer].appendChild(this.svgElement);
        }
    }
    updatePosRot() {
        if (this.svgElement) {
            this.svgElement.setAttribute("cx", this.gameobject.pos.x.toFixed(1));
            this.svgElement.setAttribute("cy", this.gameobject.pos.y.toFixed(1));
        }
    }
    dispose() {
        if (this.svgElement) {
            this.gameobject.main.layers[this.layer].removeChild(this.svgElement);
        }
        delete this.svgElement;
    }
}
class PathRenderer extends Renderer {
    constructor(gameobject, prop) {
        super(gameobject, prop);
        this._points = [];
        this._d = "";
        this._close = false;
        if (prop) {
            if (prop.points instanceof Array) {
                this.points = prop.points;
            }
            if (prop.d) {
                this.d = prop.d;
            }
            if (prop.close) {
                this.close = prop.close;
            }
        }
    }
    get points() {
        return this._points;
    }
    set points(v) {
        this._points = v;
        this.draw();
    }
    get d() {
        return this._d;
    }
    set d(s) {
        this._d = s;
        this.draw();
    }
    get close() {
        return this._close;
    }
    set close(v) {
        this._close = v;
        this.draw();
    }
    onClassAdded(c) {
        if (this.svgElement) {
            this.svgElement.classList.add(c);
        }
    }
    onClassRemoved(c) {
        if (this.svgElement) {
            this.svgElement.classList.remove(c);
        }
    }
    draw() {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this._classList.forEach(c => {
                this.onClassAdded(c);
            });
            this.gameobject.main.layers[this.layer].appendChild(this.svgElement);
        }
        let d = "";
        if (this.points.length > 0) {
            d = "M" + this.points[0].x + " " + this.points[0].y + " ";
            for (let i = 1; i < this.points.length; i++) {
                d += "L" + this.points[i].x + " " + this.points[i].y + " ";
            }
            if (this.close) {
                d += "Z";
            }
        }
        else {
            d = this.d;
        }
        this.svgElement.setAttribute("d", d);
    }
    updatePosRot() {
        this.svgElement.setAttribute("transform", "translate(" + this.gameobject.pos.x.toFixed(1) + " " + this.gameobject.pos.y.toFixed(1) + "), rotate(" + (this.gameobject.rot / Math.PI * 180).toFixed(0) + ")");
    }
    dispose() {
        if (this.svgElement) {
            this.gameobject.main.layers[this.layer].removeChild(this.svgElement);
        }
        delete this.svgElement;
    }
}
class SMath {
    static StepFromToCirular(from, to, step = Math.PI / 60) {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while (to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }
        if (Math.abs(to - from) <= step) {
            return to;
        }
        if (Math.abs(to - from) >= 2 * Math.PI - step) {
            return to;
        }
        if (to - from >= 0) {
            if (Math.abs(to - from) <= Math.PI) {
                return from + step;
            }
            return from - step;
        }
        if (to - from < 0) {
            if (Math.abs(to - from) <= Math.PI) {
                return from - step;
            }
            return from + step;
        }
        return to;
    }
}
class Sound extends Component {
    constructor(gameobject, prop) {
        super(gameobject);
        if (prop) {
            if (prop.fileName) {
                this._audioElement = new Audio("sounds/" + prop.fileName);
            }
            if (this._audioElement) {
                if (prop.loop) {
                    this._audioElement.loop = prop.loop;
                }
            }
        }
    }
    play(fromBegin = true) {
        if (this._audioElement) {
            if (fromBegin) {
                this._audioElement.currentTime = 0;
            }
            this._audioElement.play();
        }
    }
    pause() {
        if (this._audioElement) {
            this._audioElement.pause();
        }
    }
    onPause() {
        this.pause();
    }
    onStop() {
        this.pause();
    }
}
class UniqueList {
    constructor() {
        this._elements = [];
    }
    get length() {
        return this._elements.length;
    }
    get(i) {
        return this._elements[i];
    }
    getLast() {
        return this.get(this.length - 1);
    }
    indexOf(e) {
        return this._elements.indexOf(e);
    }
    push(e) {
        if (this._elements.indexOf(e) === -1) {
            this._elements.push(e);
        }
    }
    remove(e) {
        let i = this._elements.indexOf(e);
        if (i != -1) {
            this._elements.splice(i, 1);
            return e;
        }
        return undefined;
    }
    contains(e) {
        return this._elements.indexOf(e) != -1;
    }
    find(callback) {
        return this._elements.find(callback);
    }
    filter(callback) {
        return this._elements.filter(callback);
    }
    forEach(callback) {
        this._elements.forEach(e => {
            callback(e);
        });
    }
    sort(callback) {
        this._elements = this._elements.sort(callback);
    }
    clone() {
        let clonedList = new UniqueList();
        clonedList._elements = [...this._elements];
        return clonedList;
    }
}
class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    copyFrom(other) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
    static DistanceSquared(a, b) {
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        return dx * dx + dy * dy;
    }
    static Distance(a, b) {
        return Math.sqrt(Vec2.DistanceSquared(a, b));
    }
    static Dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
    static AngleFromTo(from, to, keepPositive = false) {
        let dot = Vec2.Dot(from, to) / from.length() / to.length();
        let angle = Math.acos(dot);
        let cross = from.x * to.y - from.y * to.x;
        if (cross === 0) {
            cross = 1;
        }
        angle *= Math.sign(cross);
        if (keepPositive && angle < 0) {
            angle += Math.PI * 2;
        }
        return angle;
    }
    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }
    length() {
        return Math.sqrt(this.lengthSquared());
    }
    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }
    addInPlace(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    subtract(other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }
    subtractInPlace(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    normalize() {
        return this.clone().normalizeInPlace();
    }
    normalizeInPlace() {
        this.scaleInPlace(1 / this.length());
        return this;
    }
    scale(s) {
        return new Vec2(this.x * s, this.y * s);
    }
    scaleInPlace(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }
    rotate(alpha) {
        return this.clone().rotateInPlace(alpha);
    }
    rotateInPlace(alpha) {
        let x = Math.cos(alpha) * this.x - Math.sin(alpha) * this.y;
        let y = Math.cos(alpha) * this.y + Math.sin(alpha) * this.x;
        this.x = x;
        this.y = y;
        return this;
    }
    mirror(axis) {
        return this.clone().mirrorInPlace(axis);
    }
    mirrorInPlace(axis) {
        this.scaleInPlace(-1);
        let a = Vec2.AngleFromTo(this, axis);
        this.rotateInPlace(2 * a);
        return this;
    }
    static ProjectOnABLine(pt, ptA, ptB) {
        let dir = ptB.subtract(ptA).normalizeInPlace();
        let tmp = pt.subtract(ptA);
        let dot = Vec2.Dot(dir, tmp);
        let proj = dir.scaleInPlace(dot).addInPlace(ptA);
        return proj;
    }
    static ProjectOnABSegment(pt, ptA, ptB) {
        let dir = ptB.subtract(ptA).normalizeInPlace();
        let proj = Vec2.ProjectOnABLine(pt, ptA, ptB);
        let tmpA = pt.subtract(ptA);
        if (Vec2.Dot(tmpA, dir) < 0) {
            return ptA.clone();
        }
        else {
            let invDir = dir.scale(-1);
            let tmpB = pt.subtract(ptB);
            if (Vec2.Dot(tmpB, invDir) < 0) {
                return ptB.clone();
            }
        }
        return proj;
    }
    static BBoxSurface(...points) {
        let min = points.reduce((v1, v2) => {
            return new Vec2(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y));
        });
        let max = points.reduce((v1, v2) => {
            return new Vec2(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y));
        });
        return (max.x - min.x) * (max.y - min.y);
    }
}
