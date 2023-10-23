/// <reference path="./engine/Gameobject.ts" />

class Ball extends Gameobject {

    protected _circleRenderer: CircleRenderer;
    public speed: Vec2 = new Vec2(0, 0);
    public radius: number = 15;
    public ignore: Block[] = [];

    constructor(main: Main) {
        super({}, main);
    }

    public instantiate(): void {
        super.instantiate();

        this._circleRenderer = this.addComponent(new CircleRenderer(this, { radius: this.radius, layer: 3 })) as CircleRenderer;
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

        let hit: Block;
        let axis: Vec2;
        this.main.gameobjects.forEach(other => {
            if (other instanceof Block) {
                if (this.ignore.indexOf(other) === -1) {
                    let currHit = other.intersectsBall(this)
                    if (currHit.hit) {
                        hit = other;
                        axis = currHit.axis;
                    }
                }
            }
        });

        if (hit) {
            this.speed.mirrorInPlace(axis);
            if (hit.color === BlockColor.Green) {
                hit.dispose();
            }
            else {
                let newBlocks = hit.expand();
                newBlocks.forEach(block => {
                    this.ignore.push(block);
                })
            }
        }

        let n = 0;
        while (n < this.ignore.length) {
            let check = this.ignore[n];
            if (check.intersectsBall(this, 5).hit) {
                n++;
            }
            else {
                this.ignore.splice(n, 1);
            }
        }
    }

    public stop(): void {
        super.stop();
    }
}