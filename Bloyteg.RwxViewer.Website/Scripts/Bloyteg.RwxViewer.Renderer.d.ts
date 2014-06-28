declare module RwxViewer {
    class NoAnimation implements Animation {
        private _transform;
        public getTransformForTime(joint: number, time: number): Mat4Array;
    }
}
declare module RwxViewer {
    class SequenceAnimation implements Animation {
        private _startTime;
        private _framesPerMS;
        private _totalFrames;
        private _identityMatrix;
        private _rotationMatrix;
        private _translationMatrix;
        private _transformMatrix;
        private _quaternion;
        private _translation;
        private _keyframesByJoint;
        constructor(animation: ModelAnimation, startTime: number);
        private buildKeyframesByJoint(animation);
        private getJointTagFromName(name);
        private buildGlobalTranslationForKeyframe(animation, keyframe);
        private interpolatePosition(positions, keyframe);
        public getTransformForTime(joint: number, time: number): Mat4Array;
    }
}
declare module RwxViewer {
    module Drawable {
        function createBoundingBoxDrawble(gl: WebGLRenderingContext, boundingBox: BoundingBox): BoundingBoxDrawable;
    }
    class BoundingBoxDrawable implements Drawable {
        private _vertexBuffer;
        private _vertexCount;
        private _animation;
        private _color;
        constructor(gl: WebGLRenderingContext, boundingBox: BoundingBox);
        private initializeNew(gl, boundingBox);
        public animation : Animation;
        public cloneWithAnimation(animation: Animation): BoundingBoxDrawable;
        public draw(gl: WebGLRenderingContext, shader: ShaderProgram, transformMatrix: Mat4Array): void;
    }
}
declare module RwxViewer {
    class AnimatedTexture implements Texture {
        private _gl;
        private _texture;
        private _imageSource;
        private _canvas;
        private _currentFrame;
        private _totalFrames;
        private _textureFactory;
        private _lastUpdate;
        constructor(gl: WebGLRenderingContext, imageSource: HTMLImageElement, textureFactory: TextureFactory);
        private getNextFrame();
        public bind(slot: number, sampler: WebGLUniformLocation): void;
        public update(update: number): void;
        public isEmpty : boolean;
    }
}
declare module RwxViewer {
    interface Animation {
        getTransformForTime(joint: number, time: number): Mat4Array;
    }
    module Animation {
        function getDefaultAnimation(): NoAnimation;
        function getSequenceAnimation(animation: ModelAnimation): SequenceAnimation;
    }
}
declare module RwxViewer {
    interface BoundingBox {
        minimumX: number;
        minimumY: number;
        minimumZ: number;
        maximumX: number;
        maximumY: number;
        maximumZ: number;
    }
    module BoundingBox {
        function computeBoundingBox(model: Model): BoundingBox;
    }
}
declare module RwxViewer {
    interface Camera {
        setViewportSize(width: number, height: number): any;
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
        animation: Animation;
        cloneWithAnimation(animation: Animation): any;
        draw(gl: WebGLRenderingContext, shader: ShaderProgram, transformMatrix?: Mat4Array, time?: number): void;
    }
}
declare module RwxViewer {
    module Drawable {
        function createDrawableFromModel(gl: WebGLRenderingContext, model: Model): Drawable;
    }
}
declare module RwxViewer {
    class EmptyTexture implements Texture {
        private _gl;
        constructor(gl: WebGLRenderingContext);
        public bind(slot: number, sampler: WebGLUniformLocation): void;
        public update(frameCount: number): void;
        public isEmpty : boolean;
    }
}
declare module RwxViewer {
    module Drawable {
        function createGridDrawable(gl: WebGLRenderingContext): GridDrawable;
    }
    class GridDrawable implements Drawable {
        private _vertexBuffer;
        private _vertexCount;
        private _animation;
        constructor(gl: WebGLRenderingContext);
        private initializeNew(gl);
        public animation : Animation;
        public cloneWithAnimation(animation: Animation): GridDrawable;
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
    interface DrawableMaterial {
        baseColor: Vec4Array;
        ambient: number;
        diffuse: number;
        drawMode: number;
        opacity: number;
        texture: Texture;
        mask: Texture;
    }
    interface SubMesh {
        vertexBuffer: VertexBuffer;
        material: DrawableMaterial;
    }
    class MeshDrawable implements Drawable {
        private _subMeshes;
        private _children;
        private _isBillboard;
        private _animation;
        private _jointTag;
        private _modelMatrix;
        private _transformMatrix;
        private _normalMatrix;
        constructor(subMeshes: SubMesh[], children: Drawable[], modelMatrix: Mat4Array, jointTag: number, isBillboard?: boolean, animation?: Animation);
        public animation : Animation;
        public cloneWithAnimation(animation: Animation): MeshDrawable;
        public draw(gl: WebGLRenderingContext, shader: ShaderProgram, transformMatrix: Mat4Array, time: number): void;
        private setTransformUniforms(gl, shader, transformMatrix, time);
        private setMaterialUniforms(gl, shader, material);
        private bindTexture(gl, shader, material, time);
        private bindMask(gl, shader, material, time);
        public bindVertexBuffers(gl: WebGLRenderingContext, shader: ShaderProgram, vertexBuffer: VertexBuffer): void;
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
    interface Quaternion {
        W: number;
        X: number;
        Y: number;
        Z: number;
    }
    interface GlobalPositionKeyframe {
        Keyframe: number;
        Value: number;
    }
    interface Keyframe {
        Keyframe: number;
        Rotation: Quaternion;
        Translation: Vector3;
    }
    interface Joint {
        Name: string;
        Keyframes: Keyframe[];
    }
    interface ModelAnimation {
        FramesPerSecond: number;
        FrameCount: number;
        Joints: Joint[];
        GlobalXPositions: GlobalPositionKeyframe[];
        GlobalYPositions: GlobalPositionKeyframe[];
        GlobalZPositions: GlobalPositionKeyframe[];
    }
}
declare module RwxViewer {
    class Renderer {
        private _gl;
        private _currentDrawable;
        private _spatialGridDrawable;
        private _boundingBoxDrawable;
        private _gridProgram;
        private _mainProgram;
        private _overlayProgram;
        private _camera;
        private _projectionMatrix;
        private _modelMatrix;
        private _viewportWidth;
        private _viewportHeight;
        constructor(gl: WebGLRenderingContext);
        public initialize(mainProgram: ShaderProgram, gridProgram: ShaderProgram, overlayProgram: ShaderProgram): void;
        public draw(time: number): void;
        public setCurrentModel(model: Model): void;
        public setCurrentAnimation(animation: ModelAnimation): void;
        public camera : Camera;
        public updateViewport(width: number, height: number): void;
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
    class StaticTexture implements Texture {
        private _gl;
        private _texture;
        constructor(gl: WebGLRenderingContext, imageSource: HTMLImageElement, textureFactory: TextureFactory);
        private getImageSource(imageSource);
        private getScaledImage(imageSource);
        public bind(slot: number, sampler: WebGLUniformLocation): void;
        public update(frameCount: number): void;
        public isEmpty : boolean;
    }
}
declare module RwxViewer {
    interface Texture {
        bind(slot: number, sampler: WebGLUniformLocation): any;
        update(frameCount: number): any;
        isEmpty: boolean;
    }
}
declare module RwxViewer {
    enum TextureFilteringMode {
        None = 0,
        MipMap = 1,
    }
    module TextureCache {
        function addImageToCache(name: string, image: HTMLImageElement): void;
        function getTexture(gl: WebGLRenderingContext, name: string, filteringMode: TextureFilteringMode): Texture;
    }
}
declare module RwxViewer {
    module TextureFactory {
        function getFactory(gl: WebGLRenderingContext, filteringMode: TextureFilteringMode): TextureFactory;
    }
    interface TextureFactory {
        getTexture(source: HTMLCanvasElement): WebGLTexture;
        getTexture(source: HTMLImageElement): WebGLTexture;
        updateTexture(texture: WebGLTexture, source: HTMLCanvasElement): any;
    }
}
