import Model = require("Model");

export interface IDrawable {
    draw(): void;
}

export interface IVertexBuffer {
    vertexPositions: WebGLBuffer;
    vertexUVs: WebGLBuffer;
    vertexNormals: WebGLBuffer;

    vertexCount: number;
}

export interface IIndexBuffer {
    indexBuffer: WebGLBuffer;
    indexCount: number;
}

export class MeshDrawable implements IDrawable {
    private gl: WebGLRenderingContext;
    private vertexBuffer: IVertexBuffer;
    private indexBuffers: IIndexBuffer[];

    children: IDrawable[];

    constructor(gl: WebGLRenderingContext, vertexBuffer: IVertexBuffer, indexBuffers: IIndexBuffer[]) {
        this.gl = gl;
        this.vertexBuffer = vertexBuffer;
        this.indexBuffers = indexBuffers;
        this.children = new Array();
    }

    draw(): void {
        var gl = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer.vertexPositions);
        //TODO: Set position attributes.

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer.vertexUVs);
        //TODO: Set UV attributes.

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer.vertexNormals);
        //TODO: Set normal attributes.

        this.indexBuffers.forEach(indexBuffer => {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.indexBuffer);
            //TODO: Set matrices

            gl.drawElements(gl.TRIANGLES, indexBuffer.indexCount, gl.UNSIGNED_SHORT, 0);
        });

        gl.drawElements(gl.TRIANGLES, 500, gl.UNSIGNED_SHORT, 0);

        this.children.forEach(child => child.draw());
    }
}