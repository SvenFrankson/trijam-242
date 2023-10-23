/// <reference path="./engine/Gameobject.ts" />

class Player extends Gameobject {

    protected _renderer: PathRenderer;
    private _pointerDown: boolean = false;
    private _inputPos: Vec2 = new Vec2(800, 500);
    
    constructor(main: Main) {
        super({ }, main);
        this.pos.x = 800;
        this.pos.y = 500;
    }

    public instantiate(): void {
        super.instantiate();

        this._renderer = this.addComponent(
            new PathRenderer(this, { 
                points: [
                    new Vec2(-8, -100),
                    new Vec2(8, -100),
                    new Vec2(15, -93),
                    new Vec2(15, 93),
                    new Vec2(8, 100),
                    new Vec2(-8, 100),
                    new Vec2(-15, 93),
                    new Vec2(-15, -93)
                ],
                close: true,
                layer: 2 
            })
        ) as PathRenderer;
        this._renderer.addClass("player");

        window.addEventListener("pointermove", this.pointerMove);
        window.addEventListener("pointerdown", this.pointerDown);
    }

    public start(): void {
        super.start();
    }

    public update(dt: number): void {
        super.update(dt);

        this.pos.y *= 0.5;
        this.pos.y += this._inputPos.y * 0.5;

        this.main.gameobjects.forEach(ball => {
            if (ball instanceof Ball) {
                if (this.intersectsBall(ball)) {
                    let sign = Math.sign(ball.pos.x - 800);
                    ball.speed.x = sign * Math.abs(ball.speed.x);
                    ball.ghost = false;
                    let dy = ball.pos.y - this.pos.y;
                    ball.speed.y += 3 * dy;
                    ball.speed.normalizeInPlace().scaleInPlace(300);
                    if (Math.abs(ball.speed.x) < 50) {
                        ball.speed.x = Math.sign(ball.speed.x) * Math.abs(ball.speed.x);
                        ball.speed.normalizeInPlace().scaleInPlace(300);
                    }
                }
            }
        });
    }

    public stop(): void {
        super.stop();
    }

    public dispose(): void {
        super.dispose();
    }

    public intersectsBall(ball: Ball, margin: number = 0): boolean {
        let xMin = this.pos.x - 15;
        let xMax = this.pos.x + 15;
        let yMin = this.pos.y - 100;
        let yMax = this.pos.y + 100;

        let r = ball.radius + margin;

        if (ball.pos.x - r > xMax) {
            return false;
        }
        if (ball.pos.y - r > yMax) {
            return false;
        }
        if (ball.pos.x + r < xMin) {
            return false;
        }
        if (ball.pos.y + r < yMin) {
            return false;
        }

        return true;
    }

    public pointerMove = (ev: PointerEvent) => {
        this.main.clientXYToContainerXYToRef(ev.clientX, ev.clientY, this._inputPos);
    }

    public pointerDown = (ev: PointerEvent) => {
        this.main.clientXYToContainerXYToRef(ev.clientX, ev.clientY, this._inputPos);
    }
}