/// <reference path="./engine/Gameobject.ts" />

class Main {

    public containerRect: DOMRect;
    public container: SVGElement;
    public layers: SVGGElement[] = [];
    public gameobjects: UniqueList<Gameobject> = new UniqueList<Gameobject>();

    constructor() {
    }

    public instantiate(): void {
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.container.id = "main-container";
        this.container.setAttribute("viewBox", "0 0 1000 1000");
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

    public start(): void {
        
        document.getElementById("credit").style.display = "none";

        this.gameobjects.forEach(gameobject => {
            gameobject.start();
            gameobject.draw();
        });

        this._update = (dt: number) => {
            this.gameobjects.forEach(gameobject => {
                gameobject.update(dt);
            });
            this.gameobjects.forEach(gameobject => {
                gameobject.updatePosRot();
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

        px = px / this.containerRect.width * 1000;
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
        let marginLeft: number;
        let h: number;
        let marginTop: number;
        let r = 16/9;
        
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
    }

    private _update: (dt: number) => void;
}

window.addEventListener("load", () => {
    let main = new Main();
    main.instantiate();
    requestAnimationFrame(() => {
        main.start();
    });
});