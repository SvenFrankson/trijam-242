/// <reference path="./engine/Gameobject.ts" />

enum BlockColor {
    Red,
    Green
}

class Block extends Gameobject {

    protected _renderer: PathRenderer;
    
    constructor(public i: number, public j: number, main: Main, public color: BlockColor = BlockColor.Red) {
        super({ }, main);
        this.pos.x = 25 + i * 50;
        this.pos.y = 50 + j * 100;
    }

    public instantiate(): void {
        super.instantiate();

        this._renderer = this.addComponent(
            new PathRenderer(this, { 
                points: [
                    new Vec2(-20, -45),
                    new Vec2(20, -45),
                    new Vec2(20, 45),
                    new Vec2(-20, 45)
                ],
                close: true,
                layer: 2 
            })
        ) as PathRenderer;
        this._renderer.addClass("block");
        this.setColor(this.color);
    }

    public start(): void {
        super.start();
    }

    public update(dt: number): void {
        super.update(dt);
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

    public intersectsBall(ball: Ball): { hit: boolean, axis?: Vec2 } {
        let xMin = this.pos.x - 20;
        let xMax = this.pos.x + 20;
        let yMin = this.pos.y - 45;
        let yMax = this.pos.y + 45;

        if (ball.pos.x - ball.radius > xMax) {
            return { hit: false };
        }
        if (ball.pos.y - ball.radius > yMax) {
            return { hit: false };
        }
        if (ball.pos.x + ball.radius < xMin) {
            return { hit: false };
        }
        if (ball.pos.y + ball.radius < yMin) {
            return { hit: false };
        }

        let axis = ball.pos.subtract(this.pos);
        let xDepth = Math.abs(Math.abs(ball.pos.x - this.pos.x) - ball.radius - 20);
        let yDepth = Math.abs(Math.abs(ball.pos.y - this.pos.y) - ball.radius - 45);
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
}