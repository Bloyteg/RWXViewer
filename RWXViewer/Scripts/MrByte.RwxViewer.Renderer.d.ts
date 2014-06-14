declare module RwxViewer {
    interface Camera {
        setViewpowerSize(width: number, height: number): any;
        reset(): any;
        rotate(deltaX: number, deltaY: number): any;
        zoomIn(zoomFactor?: number): any;
        zoomOut(zoomFactor?: number): any;
        pan(deltaX: number, deltaY: number): any;
        matrix: Mat4Array;
    }
    function makeCamera(width: number, height: number): Camera;
}
declare module RwxViewer {
    interface Drawable {
        worldMatrix: Mat4Array;
        cloneWithTransform(matrix: Mat4Array): any;
        draw(gl: WebGLRenderingContext, shader: ShaderProgram): void;
    }
}
declare module RwxViewer {
    function createDrawableFromModel(gl: WebGLRenderingContext, model: Model): Drawable;
}
declare module RwxViewer {
    function makeGrid(gl: WebGLRenderingContext): GridDrawable;
    class GridDrawable implements Drawable {
        private _vertexBuffer;
        private _vertexCount;
        private _worldMatrix;
        constructor(gl: WebGLRenderingContext);
        constructor(worldMatrix: Mat4Array, vertexBuffer: WebGLBuffer, vertexCount: number);
        private initializeNew(gl);
        public worldMatrix : Mat4Array;
        public cloneWithTransform(matrix: Mat4Array): GridDrawable;
        public draw(gl: WebGLRenderingContext, shader: ShaderProgram): void;
    }
}
declare module RwxViewer {
    interface VertexBuffer {
        positions: WebGLBuffer;
        uvs: WebGLBuffer;
        normals: WebGLBuffer;
        count: number;
    }
    interface MeshMaterialGroup {
        vertexBuffer: VertexBuffer;
        baseColor: Vec4Array;
        ambient: number;
        diffuse: number;
        drawMode: number;
        opacity: number;
        texture: Texture;
        mask: Texture;
    }
    class MeshDrawable implements Drawable {
        private _meshMaterialGroups;
        private _worldMatrix;
        private _children;
        private _isBillboard;
        constructor(meshMaterialGroups: MeshMaterialGroup[], modelMatrix: Mat4Array, children: Drawable[], isBillboard?: boolean);
        public worldMatrix : Mat4Array;
        public cloneWithTransform(matrix: Mat4Array): MeshDrawable;
        public draw(gl: WebGLRenderingContext, shader: ShaderProgram): void;
        public setTransformUniforms(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: MeshMaterialGroup): void;
        public setMaterialUniforms(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: MeshMaterialGroup): void;
        public bindTexture(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: MeshMaterialGroup): void;
        public bindMask(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: MeshMaterialGroup): void;
        public bindVertexBuffers(gl: WebGLRenderingContext, shader: ShaderProgram, meshMaterialGroup: MeshMaterialGroup): void;
    }
}
declare module RwxViewer {
    interface Vector3 {
        X: number;
        Y: number;
        Z: number;
    }
    interface Vertex {
        Position: Vector3;
        UV: Uv;
        Prelight: Color;
        Normal: Vector3;
    }
    interface Uv {
        U: number;
        V: number;
    }
    interface Triangle {
        Normal: Vector3;
        Indices: number[];
    }
    interface IFace {
        Tag: number;
        MaterialId: number;
        Indices: number[];
        Triangles: Triangle[];
    }
    interface Matrix {
        Matrix: number[];
    }
    interface Transformable {
        Transform: Matrix;
    }
    interface Geometry {
        Vertices: Vertex[];
        Faces: IFace[];
    }
    interface MeshGeometry extends Geometry {
        Children: Clump[];
        Primitives: PrimitiveGeometry[];
        PrototypeInstances: PrototypeInstance[];
        IsPrelit: boolean;
    }
    interface PrimitiveGeometry extends Geometry, Transformable {
        MaterialId: number;
    }
    interface Prototype extends MeshGeometry {
        Name: string;
    }
    interface PrototypeInstance extends Transformable {
        Name: string;
        MaterialId: number;
    }
    interface Clump extends MeshGeometry, Transformable {
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
    interface Color {
        R: number;
        G: number;
        B: number;
    }
    interface Material {
        Color: Color;
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
    interface Model {
        Prototypes: Prototype[];
        Materials: Material[];
        Clump: Clump;
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
        public setCurrentModel(model: Model): void;
        public camera : Camera;
    }
}
declare module RwxViewer {
    interface UniformInfo {
        [name: string]: WebGLUniformLocation;
    }
    interface AttributeInfo {
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
        public attributes : AttributeInfo;
        public uniforms : UniformInfo;
        private compileShader(shaderSource, type);
        public use(handler: (program: ShaderProgram) => void): void;
    }
}
declare module RwxViewer {
    interface Texture {
        bind(slot: number, sampler: number): any;
        update(frameCount: number): any;
    }
    enum TextureFilteringMode {
        None = 0,
        MipMap = 1,
    }
    module TextureCache {
        function addImageToCache(name: string, image: HTMLImageElement): void;
        function getTexture(gl: WebGLRenderingContext, name: string, filteringMode: TextureFilteringMode): Texture;
    }
}
