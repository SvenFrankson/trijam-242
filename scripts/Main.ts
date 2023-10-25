/// <reference path="./engine/Gameobject.ts" />

class Main {

    public containerRect: DOMRect;
    public container: SVGElement;
    public layers: SVGGElement[] = [];
    public gameobjects: UniqueList<Gameobject> = new UniqueList<Gameobject>();
    public blocks: Block[][];
    public score: number = 0;
    public updates: UniqueList<() => void> = new UniqueList<() => void>();

    constructor() {
    }

    public instantiate(): void {
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

        this._onResize();
        this._mainLoop();
    }

    public clearLevel(): void {
        this.dispose();
    }

    public makeLevel1(): void {
        this.blocks = [];
        for (let i = 0; i < 32; i++) {
            this.blocks[i] = [];
        }

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 10; j++) {
                let extraBall = i === 2 && (j ===2 || j === 7);
                let block = new Block(i, j, this, BlockColor.Green, extraBall);
                block.instantiate();
            }
        }

        for (let i = 32 - 5; i < 32; i++) {
            for (let j = 0; j < 10; j++) {
                let extraBall = i === 29 && (j ===2 || j === 7);
                let block = new Block(i, j, this, BlockColor.Red, extraBall);
                block.instantiate();
            }
        }

        let player = new Player(this);
        player.instantiate();

        for (let n = 0; n < 1; n++) {
            let ball = new Ball(this, BlockColor.Red);
            ball.pos.x = 700;
            ball.pos.y = 400;
            ball.instantiate();
            
            ball.speed.x = -1;
            ball.speed.y = -1 + 2 * Math.random();
            ball.speed.normalizeInPlace().scaleInPlace(ball.speedVal);
    
            let ball2 = new Ball(this, BlockColor.Green);
            ball2.pos.x = 900;
            ball2.pos.y = 400;
            ball2.instantiate();
            
            ball2.speed.x = 1;
            ball2.speed.y = -1 + 2 * Math.random();
            ball2.speed.normalizeInPlace().scaleInPlace(ball2.speedVal);
        }
    }

    public setScore(score: number): void {
        this.score = score;
        (document.getElementsByClassName("score-value")[0] as HTMLElement).innerText = this.score.toFixed(0).padStart(5, "0");
        (document.getElementsByClassName("score-value")[1] as HTMLElement).innerText = this.score.toFixed(0).padStart(5, "0");
    }

    public start(): void {
        
        this.makeLevel1();
        
        document.getElementById("play").style.display = "none";
        document.getElementById("game-over").style.display = "none";
        document.getElementById("credit").style.display = "none";
        this.setScore(10000);

        this.gameobjects.forEach(gameobject => {
            gameobject.start();
            gameobject.draw();
        });

        this._update = (dt: number) => {
            this.setScore(this.score - dt * 10);
            this.updates.forEach(up => {
                up();
            });
            this.gameobjects.forEach(gameobject => {
                gameobject.update(dt);
            });
            this.gameobjects.forEach(gameobject => {
                gameobject.updatePosRotScale();
            });
        }
    }

    public stop(): void {
        this._update = () => {

        }
        this.gameobjects.forEach(gameobject => {
            gameobject.stop();
        });
    }

    private _lastT: number = 0;
    private _mainLoop = () => {
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
    }

    public gameover(success?: boolean): void {
        this.stop();
        document.getElementById("play").style.display = "block";
        document.getElementById("game-over").style.display = "block";
        if (success) {
            document.getElementById("game-over").style.backgroundColor = "#0abdc6";
            document.getElementById("success-value").innerText = "SUCCESS";
        }
        else {
            document.getElementById("game-over").style.backgroundColor = "#711c91";
            document.getElementById("success-value").innerText = "GAME OVER";
        }
        document.getElementById("credit").style.display = "block";
    }

    public dispose(): void {
        while (this.gameobjects.length > 0) {
            this.gameobjects.get(0).dispose();
        }
    }

    public clientXYToContainerXY(clientX: number, clientY: number): Vec2 {
        let v = new Vec2();
        return this.clientXYToContainerXYToRef(clientX, clientY, v);
    }

    public clientXYToContainerXYToRef(clientX: number, clientY: number, ref: Vec2): Vec2 {
        let px = clientX - this.containerRect.left;
        let py = clientY - this.containerRect.top;

        px = px / this.containerRect.width * 1600;
        py = py / this.containerRect.height * 1000;

        ref.x = px;
        ref.y = py;
        
        return ref;
    }

    public pointerClientPos: Vec2 = new Vec2();

    private _onPointerMove = (ev: PointerEvent) => {
        this.pointerClientPos.x = ev.clientX;
        this.pointerClientPos.y = ev.clientY;
    }

    private _onResize = () => {
        let screenWidth = document.body.clientWidth;
        let screenHeight = document.body.clientHeight;
        let screenRatio = screenWidth / screenHeight;

        let w: number;
        let left: number;
        let h: number;
        let bottom: number;
        let r = 1600 / (1000 + 100);
        
        if (screenRatio >= r) {
            h = screenHeight * 0.9;
            w = h * r;
        }
        else {
            w = screenWidth * 0.9;
            h = w / r;
        }

        left = (screenWidth - w) / 2;
        bottom = (screenHeight - h) / 2;
        this.container.style.width = w + "px";
        this.container.style.height = ((1000 / (1000 + 100)) * h) + "px";
        this.container.style.left = left + "px";
        this.container.style.bottom = bottom + "px";

        let scoreDiv = document.getElementById("score");
        scoreDiv.style.fontSize = ((90 / (1000 + 100)) * h) + "px";
        scoreDiv.style.height = ((100 / (1000 + 100)) * h) + "px";
        scoreDiv.style.right = left + "px";
        scoreDiv.style.top = bottom + "px";

        this.containerRect = this.container.getBoundingClientRect();
    }

    public addUpdate(callback: () => void): void {
        this.updates.push(callback);
    }

    public removeUpdate(callback: () => void): void {
        this.updates.remove(callback);
    }

    private _update: (dt: number) => void;
}

window.addEventListener("load", () => {
    document.getElementById("game-over").style.display = "none";
    let main = new Main();
    main.instantiate();
    document.getElementById("play").addEventListener("pointerup", () => {
        requestAnimationFrame(() => {
            main.start();
        });
    });
});