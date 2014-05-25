import Model = require("Model");

export interface IDrawable {
    draw(): void;
}

export class MeshDrawable implements IDrawable {
    constructor(gl: WebGLRenderingContext, model: Model.IModel) {

    }

    draw(): void {

    }
}