/// <reference path="./engine/Gameobject.ts" />

class Ball extends Gameobject {

    protected _circleRenderer: CircleRenderer;
    public speed: Vec2 = new Vec2(0, 0);
    public radius: number = 20;

    constructor(main: Main) {
        super({}, main);
    }

    public instantiate(): void {
        super.instantiate();

        this._circleRenderer = this.addComponent(new CircleRenderer(this, { radius: this.radius, layer: 2 })) as CircleRenderer;
        this._circleRenderer.addClass("ball");
    }

    public start(): void {
        super.start();
    }

    public update(dt: number): void {
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

        this.main.gameobjects.forEach(other => {
            
        });
    }

    public stop(): void {
        super.stop();
    }
}