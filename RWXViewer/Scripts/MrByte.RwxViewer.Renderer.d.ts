declare module RwxViewer {
    class Camera {
        private _cameraMatrix;
        private _cameraMatrixInverse;
        private _offset;
        private _position;
        private _target;
        private _pan;
        private _panOffset;
        private _up;
        private _upQuaternion;
        private _upQuarternionInverse;
        private _thetaDelta;
        private _phiDelta;
        private _scale;
        private _viewportWidth;
        private _viewportHeight;
        constructor(viewportWidth: number, viewportHeight: number);
        public setViewpowerSize(width: number, height: number): void;
        public reset(): void;
        public rotate(deltaX: number, deltaY: number): void;
        public zoomIn(zoomFactor?: number): void;
        public zoomOut(zoomFactor?: number): void;
        public pan(deltaX: number, deltaY: number): void;
        private update();
        public matrix : Mat4Array;
    }
}
declare module RwxViewer {
    interface IDrawable {
        draw(gl: WebGLRenderingContext, shader: ShaderProgram): void;
    }
    interface IVertexBuffer {
        positions: WebGLBuffer;
        uvs: WebGLBuffer;
        normals: WebGLBuffer;
        count: number;
    }
    interface IMeshMaterialGroup {
        vertexBuffer: IVertexBuffer;
        baseColor: Vec4Array;
        ambient: number;
        diffuse: number;
        drawMode: number;
        opacity: number;
        texture: WebGLTexture;
        mask: WebGLTexture;
    }
    class SpatialGridDrawable implements IDrawable {
        private _vertexBuffer;
        private _vertexCount;
        constructor(gl: WebGLRenderingContext);
        public draw(gl: WebGLRenderingContext, shader: ShaderProgram): void;
    }
    class MeshDrawable implements IDrawable {
        private _meshMaterialGroups;
        private _modelMatrix;
        private _children;
        private _isBillboard;
        constructor(meshMaterialGroups: IMeshMaterialGroup[], modelMatrix: Mat4Array, children: IDrawable[], isBillboard?: boolean);
        public cloneWithTransform(matrix: Mat4Array): MeshDrawable;
        public draw(gl: WebGLRenderingContext, shader: ShaderProgram): void;
        public setTransformUniforms(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: IMeshMaterialGroup): void;
        public setMaterialUniforms(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: IMeshMaterialGroup): void;
        public bindTexture(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: IMeshMaterialGroup): void;
        public bindMask(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: IMeshMaterialGroup): void;
        public bindVertexBuffers(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: IMeshMaterialGroup): void;
    }
}
declare module RwxViewer {
    function createDrawableFromModel(gl: WebGLRenderingContext, model: IModel, textures: IImageCollection): IDrawable;
}
declare module RwxViewer {
    interface IImageCollection {
        [name: string]: HTMLImageElement;
    }
    interface IVector3 {
        X: number;
        Y: number;
        Z: number;
    }
    interface IVertex {
        Position: IVector3;
        UV: IUv;
        Prelight: IColor;
        Normal: IVector3;
    }
    interface IUv {
        U: number;
        V: number;
    }
    interface ITriangle {
        Normal: IVector3;
        Indices: number[];
    }
    interface IFace {
        Tag: number;
        MaterialId: number;
        Indices: number[];
        Triangles: ITriangle[];
    }
    interface IMatrix {
        Matrix: number[];
    }
    interface ITransformable {
        Transform: IMatrix;
    }
    interface IGeometry {
        Vertices: IVertex[];
        Faces: IFace[];
    }
    interface IMeshGeometry extends IGeometry {
        Children: IClump[];
        Primitives: IPrimitiveGeometry[];
        PrototypeInstances: IPrototypeInstance[];
        IsPrelit: boolean;
    }
    interface IPrimitiveGeometry extends IGeometry, ITransformable {
        MaterialId: number;
    }
    interface IPrototype extends IMeshGeometry {
        Name: string;
    }
    interface IPrototypeInstance extends ITransformable {
        Name: string;
        MaterialId: number;
    }
    interface IClump extends IMeshGeometry, ITransformable {
        Tag: number;
        IsCollidable: boolean;
    }
    enum AxisAlignment {
        None = 0,
        ZOrientX = 1,
        ZOrientY = 2,
        Xyz = 3,
    }
    enum GeometrySampling {
        Solid = 0,
        Wireframe = 1,
        Pointcloud = 2,
    }
    enum LightSampling {
        Facet = 0,
        Vertex = 1,
    }
    enum TextureMode {
        Null = 0,
        Lit = 1,
        Foreshorten = 2,
        Filter = 4,
    }
    enum TextureAddressMode {
        Wrap = 0,
        Mirror = 1,
        Clamp = 2,
    }
    enum MaterialMode {
        Null = 0,
        Double = 1,
    }
    interface IColor {
        R: number;
        G: number;
        B: number;
    }
    interface IMaterial {
        Color: IColor;
        Opacity: number;
        Ambient: number;
        Diffuse: number;
        Specular: number;
        Texture: string;
        Mask: string;
        Bump: string;
        TextureMode: TextureMode;
        TextureAddressMode: TextureAddressMode;
        TextureMipmapState: boolean;
        LightSampling: LightSampling;
        GeometrySampling: GeometrySampling;
        MaterialMode: MaterialMode;
    }
    interface IModel {
        Prototypes: IPrototype[];
        Materials: IMaterial[];
        Clump: IClump;
        HasOpacityFix: boolean;
        HasRandomUVs: boolean;
        IsSeamless: boolean;
        AxisAlignment: AxisAlignment;
    }
}
declare module RwxViewer {
    class Renderer {
        private _gl;
        private _currentDrawable;
        private _spatialGridDrawable;
        private _gridProgram;
        private _mainProgram;
        private _camera;
        private _projectionMatrix;
        constructor(gl: WebGLRenderingContext);
        public initialize(mainProgram: ShaderProgram, gridProgram: ShaderProgram): void;
        public draw(): void;
        public setCurrentModel(model: IModel, textures: IImageCollection): void;
        public camera : Camera;
    }
}
declare module RwxViewer {
    interface IUniformInfo {
        [name: string]: WebGLUniformLocation;
    }
    interface IAttributeInfo {
        [name: string]: number;
    }
    class ShaderProgram {
        private _shaderProgram;
        private _gl;
        private _uniforms;
        private _attributes;
        private _attributeCount;
        constructor(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string);
        private initializeProgram(vertexShaderSource, fragmentShaderSource);
        private getUniforms();
        private getAttributes();
        public attributes : IAttributeInfo;
        public uniforms : IUniformInfo;
        private compileShader(shaderSource, type);
        public use(handler: (program: ShaderProgram) => void): void;
    }
}
