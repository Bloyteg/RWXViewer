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

module RwxViewer {
    export interface Vector3 {
        X: number;
        Y: number;
        Z: number;
    }

    export interface Vertex {
        Position: Vector3;
        UV: Uv;
        Prelight: Color;
        Normal: Vector3;
    }

    export interface Uv {
        U: number;
        V: number;
    }

    export interface Triangle {
        Normal: Vector3;
        Indices: number[];
    }

    export interface IFace {
        Tag: number;
        MaterialId: number;
        Indices: number[];
        Triangles: Triangle[];
    }

    export interface Matrix {
        Matrix: number[];
    }

    export interface Transformable {
        Transform: Matrix;
    }

    export interface Geometry {
        Vertices: Vertex[];
        Faces: IFace[];
    }

    export interface MeshGeometry extends Geometry {
        Children: Clump[];
        Primitives: PrimitiveGeometry[];
        PrototypeInstances: PrototypeInstance[];
        IsPrelit: boolean;
    }

    export interface PrimitiveGeometry extends Geometry, Transformable {
        MaterialId: number;
    }

    export interface Prototype extends MeshGeometry {
        Name: string;
    }

    export interface PrototypeInstance extends Transformable {
        Name: string;
        MaterialId: number;
    }

    export interface Clump extends MeshGeometry, Transformable {
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

    export interface Color {
        R: number;
        G: number;
        B: number;
    }

    export interface Material {
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

    export interface Model {
        Prototypes: Prototype[];
        Materials: Material[];
        Clump: Clump;

        HasOpacityFix: boolean;
        HasRandomUVs: boolean;
        IsSeamless: boolean;
        AxisAlignment: AxisAlignment;
    }
}