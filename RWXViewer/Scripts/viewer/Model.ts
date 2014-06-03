// Copyright 2014 Joshua R. Rodgers
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//    http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export interface IVector3 {
    X: number;
    Y: number;
    Z: number;
}

export interface IVertex {
    Position: IVector3;
    Uv: IUv;
    Prelight: IColor;
    Normal: IVector3;
}

export interface IUv {
    U: number;
    V: number;
}

export interface ITriangle {
    Normal: IVector3;
    Indices: number[];
}

export interface IFace {
    Tag: number;
    MaterialId: number;
    Indices: number[];
    Triangles: ITriangle[];
}

export interface IMatrix {
    Matrix: number[];
}

export interface ITransformable {
    Transform: IMatrix;
}

export interface IGeometry {
    Vertices: IVertex[];
    Faces: IFace[];
}

export interface IMeshGeometry extends IGeometry {
    Children: IClump[];
    Primitives: IPrimitiveGeometry[];
    PrototypeInstances: IPrototypeInstance[];
    IsPrelit: boolean;
}

export interface IPrimitiveGeometry extends IGeometry, ITransformable {
    MaterialId: number;
}

export interface IPrototype extends IMeshGeometry {
    Name: string;
}

export interface IPrototypeInstance extends ITransformable {
    Name: string;
    MaterialId: number;
}

export interface IClump extends IMeshGeometry, ITransformable {
    Tag: number;
    IsCollidable: boolean;
}

export enum AxisAlignment {
    None,
    ZOrientX,
    ZOrientY,
    Xyz
}

export enum GeometrySampling {
    Solid,
    Wireframe,
    Pointcloud
}

export enum LightSampling {
    Facet,
    Vertex
}

export enum TextureMode {
    Null = 0,
    Lit = 1,
    Foreshorten = 2,
    Filter = 4
}

export enum TextureAddressMode {
    Wrap,
    Mirror,
    Clamp
}

export enum MaterialMode {
    Null,
    Double
}

export interface IColor {
    R: number;
    G: number;
    B: number;
}

export interface IMaterial {
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

export interface IModel {
    Prototypes: IPrototype[];
    Materials: IMaterial[];
    Clump: IClump;

    HasOpacityFix: boolean;
    HasRandomUVs: boolean;
    IsSeamless: boolean;
    AxisAlignment: AxisAlignment;
}