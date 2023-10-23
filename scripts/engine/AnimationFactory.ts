class AnimationFactory {
    
    public static EmptyVoidCallback: (duration: number) => Promise<void> = async (duration: number) => {};
    public static EmptyNumberCallback: (target: number, duration: number) => Promise<void> = async (target: number, duration: number) => {};
    public static EmptyVec2Callback: (target: Vec2, duration: number) => Promise<void> = async (target: Vec2, duration: number) => {};

    public static CreateWait(
        owner: Gameobject,
        onUpdateCallback?: () => void
    ): (duration: number) => Promise<void> {
        return (duration: number) => {
            return new Promise<void>(resolve => {
                let t = 0;
                let animationCB = () => {
                    t += 1 / 60;
                    let f = t / duration;
                    if (f < 1) {
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                    }
                    else {
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                        owner.main.removeUpdate(animationCB);
                        resolve();
                    }
                }
                owner.main.addUpdate(animationCB);
            })
        }
    }

    public static CreateNumber(
        owner: Gameobject,
        obj: any,
        property: string,
        onUpdateCallback?: () => void
    ): (target: number, duration: number) => Promise<void> {
        return (target: number, duration: number) => {
            return new Promise<void>(resolve => {
                let origin: number = obj[property];
                let t = 0;
                if (owner[property + "_animation"]) {
                    owner.main.removeUpdate(owner[property + "_animation"]);
                }
                let animationCB = () => {
                    t += 1 / 60;
                    let f = t / duration;
                    if (f < 1) {
                        obj[property] = origin * (1 - f) + target * f;
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                    }
                    else {
                        obj[property] = target;
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                        owner.main.removeUpdate(animationCB);
                        owner[property + "_animation"] = undefined;
                        resolve();
                    }
                }
                owner.main.addUpdate(animationCB);
                owner[property + "_animation"] = animationCB;
            })
        }
    }

    public static CreateVec2(
        owner: Gameobject,
        obj: any,
        property: string,
        onUpdateCallback?: () => void
    ): (target: Vec2, duration: number) => Promise<void> {
        return (target: Vec2, duration: number) => {
            return new Promise<void>(resolve => {
                let origin: Vec2 = obj[property];
                let t = 0;
                if (owner[property + "_animation"]) {
                    owner.main.removeUpdate(owner[property + "_animation"]);
                }
                let tmp = new Vec2();
                let animationCB = () => {
                    t += 1 / 60;
                    let f = t / duration;
                    if (f < 1) {
                        tmp.copyFrom(target).scaleInPlace(f);
                        obj[property].copyFrom(origin).scaleInPlace(1 - f).addInPlace(tmp);
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                    }
                    else {
                        obj[property].copyFrom(target);
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                        owner.main.removeUpdate(animationCB);
                        owner[property + "_animation"] = undefined;
                        resolve();
                    }
                }
                owner.main.addUpdate(animationCB);
                owner[property + "_animation"] = animationCB;
            })
        }
    }
}