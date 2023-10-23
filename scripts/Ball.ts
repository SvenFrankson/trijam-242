/// <reference path="./engine/Gameobject.ts" />

class Ball extends Gameobject {

    protected _renderer: CircleRenderer;
    public speed: Vec2 = new Vec2(0, 0);
    public radius: number = 15;
    public ghost: boolean = false;
    public speedVal: number = 300;

    constructor(main: Main, public color: BlockColor = BlockColor.Red) {
        super({}, main);
    }

    public instantiate(): void {
        super.instantiate();

        this._renderer = this.addComponent(new CircleRenderer(this, { radius: this.radius, layer: 3 })) as CircleRenderer;
        this._renderer.addClass("ball");
        this.setColor(this.color);
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

        if (!this.ghost) {
            let hit: Block;
            let axis: Vec2;
            this.main.gameobjects.forEach(other => {
                if (other instanceof Block) {
                    let currHit = other.intersectsBall(this)
                    if (currHit.hit) {
                        hit = other;
                        axis = currHit.axis;
                    }
                }
            });

            if (hit) {
                this.speed.mirrorInPlace(axis);
                if (hit.color != this.color) {
                    if (hit.extraBall) {
                        let extraBall = new Ball(this.main, this.color);
                        extraBall.pos.copyFrom(this.pos);
                        extraBall.speed.copyFrom(this.speed);
                        extraBall.speed.y += - 50 + Math.random() * 100;
                        extraBall.speed.normalizeInPlace().scaleInPlace(extraBall.speedVal);
                        extraBall.instantiate();
                        extraBall.start();
                        extraBall.draw();
                    }
                    hit.dispose();
                }
                else {
                    hit.expand();
                    this.ghost = true;
                    if (this.color === BlockColor.Green) {
                        this.speed.x = Math.abs(this.speed.x);
                    }
                    else {
                        this.speed.x = - Math.abs(this.speed.x);
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

    public stop(): void {
        super.stop();
    }

    public setColor(color: BlockColor): void {
        this.color = color;
        if (this.color === BlockColor.Red) {
            this._renderer.addClass("red");
        }
        else if (this.color === BlockColor.Green) {
            this._renderer.addClass("green");
        }
    }
}