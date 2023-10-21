/// <reference path="./engine/Gameobject.ts" />

enum BlockColor {
    Red,
    Green
}

class Block extends Gameobject {

    protected _renderer: PathRenderer;
    
    constructor(main: Main, public color: BlockColor = BlockColor.Red) {
        super({ }, main);
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
}