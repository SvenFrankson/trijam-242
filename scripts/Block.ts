/// <reference path="./engine/Gameobject.ts" />

enum BlockColor {
    Red,
    Green
}

class Block extends Gameobject {

    protected _renderer: PathRenderer;
    protected _extraBallIcon: CircleRenderer;
    public animateSize = AnimationFactory.EmptyVec2Callback;
    
    constructor(public i: number, public j: number, main: Main, public color: BlockColor = BlockColor.Red, public extraBall: boolean = false) {
        super({ }, main);
        this.pos.x = 25 + i * 50;
        this.pos.y = 50 + j * 100;
        this.main.blocks[i][j] = this;
        this.animateSize = AnimationFactory.CreateVec2(this, this, "scale");
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

        if (this.extraBall) {
            this._extraBallIcon = this.addComponent(
                new CircleRenderer(
                    this,
                    {
                        radius: 15,
                        layer: 3
                    }
                )
            ) as CircleRenderer;
            this._extraBallIcon.addClass("ball");
        }
        
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

    public dispose(): void {
        this.main.blocks[this.i][this.j] = undefined;
        super.dispose();
    }

    public setColor(color: BlockColor): void {
        this.color = color;
        if (this.color === BlockColor.Red) {
            this._renderer.addClass("red");
            if (this.extraBall) {
                this._extraBallIcon.addClass("green");
            }
        }
        else if (this.color === BlockColor.Green) {
            this._renderer.addClass("green");
            if (this.extraBall) {
                this._extraBallIcon.addClass("red");
            }
        }
    }

    public intersectsBall(ball: Ball, margin: number = 0): { hit: boolean, axis?: Vec2 } {
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

    public expand(): Block[] {
        let newBlocks: Block[] = [];
        if (this.main.blocks[this.i + 1]) {
            if (!this.main.blocks[this.i + 1][this.j]) {
                let iNext = new Block(this.i + 1, this.j, this.main, this.color);
                iNext.instantiate();
                iNext.scale.x = 0.01;
                iNext.scale.y = 0.01;
                iNext.animateSize(new Vec2(1, 1), 3);
                newBlocks.push(iNext);
            }
        }
        if (this.main.blocks[this.i - 1]) {
            if (!this.main.blocks[this.i - 1][this.j]) {
                let iPrev = new Block(this.i - 1, this.j, this.main, this.color);
                iPrev.instantiate();
                iPrev.scale.x = 0.01;
                iPrev.scale.y = 0.01;
                iPrev.animateSize(new Vec2(1, 1), 3);
                newBlocks.push(iPrev);
            }
        }
        if (this.j + 1 < 10 && !this.main.blocks[this.i][this.j + 1]) {
            let jNext = new Block(this.i, this.j + 1, this.main, this.color);
            jNext.instantiate();
            jNext.scale.x = 0.01;
            jNext.scale.y = 0.01;
            jNext.animateSize(new Vec2(1, 1), 3);
            newBlocks.push(jNext);
        }
        if (this.j - 1 > 0 && !this.main.blocks[this.i][this.j - 1]) {
            let jPrev = new Block(this.i, this.j - 1, this.main, this.color);
            jPrev.instantiate();
            jPrev.scale.x = 0.01;
            jPrev.scale.y = 0.01;
            jPrev.animateSize(new Vec2(1, 1), 3);
            newBlocks.push(jPrev);
        }
        return newBlocks;
    }
}