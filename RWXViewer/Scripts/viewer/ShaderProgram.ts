export interface IUniformInfo {
    [name: string]: number;
}

export interface IAttributeInfo {
    [name: string]: number;
}

export class ShaderProgram {
    private _shaderProgram: WebGLProgram;
    private _gl: WebGLRenderingContext;

    private _uniforms: IUniformInfo;
    private _attributes: IAttributeInfo;
    
    
    constructor(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
        this._gl = gl;
        this._shaderProgram = this.initializeProgram(vertexShaderSource, fragmentShaderSource);
        this._uniforms = this.getUniforms();
        this._attributes = this.getAttributes();
    }

    private initializeProgram(vertexShaderSource: string, fragmentShaderSource: string) {
        var gl = this._gl;
        var vertexShader = this.compileShader(vertexShaderSource, gl.VERTEX_SHADER);
        var fragmentShader = this.compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw new Error("Failed to link shader program.");
        }

        return shaderProgram;
    }

    private getUniforms() {
        var gl = this._gl;
        var totalUniforms = gl.getProgramParameter(this._shaderProgram, gl.ACTIVE_UNIFORMS);
        var uniforms: IUniformInfo = {};

        for (var uniformIndex = 0; uniformIndex < totalUniforms; ++uniformIndex) {
            var uniform = gl.getActiveUniform(this._shaderProgram, uniformIndex);
            uniforms[uniform.name] = uniformIndex;
        }

        return uniforms;
    }

    private getAttributes() {
        var gl = this._gl;
        var attributeCount = gl.getProgramParameter(this._shaderProgram, gl.ACTIVE_ATTRIBUTES);
        var attributes: IAttributeInfo = {};

        for (var attributeIndex = 0; attributeIndex < attributeCount; ++attributeIndex) {
            var attribute = gl.getActiveAttrib(this._shaderProgram, attributeIndex);
            attributes[attribute.name] = attributeIndex;
        }

        return attributes;
    }

    get attributes() {
        return this._attributes;
    }

    get uniforms() {
        return this._uniforms;
    }

    private compileShader(shaderSource: string, type: number) {
        var gl = this._gl;
        var shader = gl.createShader(type);

        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);

        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        }

        throw new Error(gl.getShaderInfoLog(shader));
    }

    useProgram() {
        this._gl.useProgram(this._shaderProgram);
    }
} 