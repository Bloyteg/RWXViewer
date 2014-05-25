interface IVector3 {
    X: number;
    Y: number;
    Z: number;
}

interface IVertex {
    Position: IVector3;
    Uv: IUv;
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

interface ITransformable {
    Matrix: number[];
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

interface IPrimitiveGeometry extends IGeometry, ITransformable{
    MaterialId: number;
}

interface IPrototype extends IGeometry {
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
    None,
    ZOrientX,
    ZOrientY,
    Xyz
}

enum GeometrySampling {
    Solid,
    Wireframe,
    Pointcloud
}

enum LightSampling {
    Facet,
    Vertex
}

enum TextureMode {
    Null = 0,
    Lit = 1,
    Foreshorten = 2,
    Filter = 4
}

enum TextureAddressMode {
    Wrap,
    Mirror,
    Clamp
}

enum MaterialMode {
    Null,
    Double
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