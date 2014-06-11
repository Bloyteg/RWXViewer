﻿// Copyright 2014 Joshua R. Rodgers
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
    interface IPrototypeCache {
        [name: string]: MeshDrawable
    }

    interface ITextureCache {
        [name: string]: WebGLTexture;
    }

    class MeshDrawableBuilder {
        private _gl: WebGLRenderingContext;
        private _model: IModel;
        private _textureCache: ITextureCache;

        constructor(gl: WebGLRenderingContext, model: IModel, textures: IImageCollection) {
            this._gl = gl;
            this._model = model;
            this._textureCache = this.buildTextureCache(textures);
        }

        //TODO: This gets moved out into classes for manging texture resources.
        private buildTextureCache(textures: IImageCollection): ITextureCache {
            var result: ITextureCache = {};

            var keys = Object.keys(textures);
            var length = keys.length;
            var anistropicFiltering = this._gl.getExtension("EXT_texture_filter_anisotropic")
                || this._gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic")
                || this._gl.getExtension("MOZ_EXT_texture_filter_anisotropic");

            for (var index = 0; index < length; ++index) {
                var key = keys[index];

                result[key] = this.buildTextureFromImage(textures[key], anistropicFiltering);
            }

            return result;
        }

        buildTextureFromImage(image: HTMLImageElement, anistropyExt): WebGLTexture {
            var gl = this._gl;
            var texture = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);

            if (anistropyExt) {
                var maxAnisotropy = gl.getParameter(anistropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4;
                gl.texParameterf(gl.TEXTURE_2D, anistropyExt.TEXTURE_MAX_ANISOTROPY_EXT, maxAnisotropy);
            }

            gl.bindTexture(gl.TEXTURE_2D, null);

            return texture;
        }

        build(): IDrawable {
            var prototypes: IPrototypeCache = this.buildPrototypeCache(this._model);

            return this.buildMeshDrawableFromClump(this._model.Clump, prototypes, mat4.create(), this._model.AxisAlignment !== AxisAlignment.None);
        }

        private buildPrototypeCache(model: IModel): IPrototypeCache {
            return model.Prototypes.reduce((prototypeCache: IPrototypeCache, prototype: IPrototype) => {
                prototypeCache[prototype.Name] = this.buildMeshDrawableFromPrototype(model, prototype, prototypeCache);
                return prototypeCache;
            }, <IPrototypeCache>{});
        }

        private buildMeshDrawableFromPrototype(model: IModel, prototype: IPrototype, prototypeCache: IPrototypeCache): MeshDrawable {
            return this.buildMeshDrawableFromMeshGeometry(prototype, prototypeCache, mat4.create());
        }

        //TODO: Handle bill-boarding better.
        private buildMeshDrawableFromClump(clump: IClump, prototypeCache: IPrototypeCache, parentMatrix = mat4.create(), isBillboard?: boolean): MeshDrawable {
            var matrix = mat4.clone(clump.Transform.Matrix);
            mat4.multiply(matrix, parentMatrix, matrix);

            return this.buildMeshDrawableFromMeshGeometry(clump, prototypeCache, matrix, isBillboard);
        }

        private buildMeshDrawableFromMeshGeometry(geometry: IMeshGeometry, prototypeCache: IPrototypeCache, matrix: Mat4Array, isBillboard?: boolean): MeshDrawable {
            var children: MeshDrawable[] = [];
            children = children.concat(geometry.Children.map(child => this.buildMeshDrawableFromClump(child, prototypeCache, matrix, isBillboard)));
            //TODO: Handle the case where this is a prototypeinstancegeometry.
            children = children.concat(geometry.PrototypeInstances.map(prototypeInstance => {
                var newMatrix = mat4.clone(prototypeInstance.Transform.Matrix);
                newMatrix = mat4.multiply(newMatrix, matrix, newMatrix);

                return prototypeCache[prototypeInstance.Name].cloneWithTransform(newMatrix);
            }));
            children = children.concat(geometry.Primitives.map(primitive => this.buildMeshDrawableFromPrimitive(primitive, matrix)));

            return new MeshDrawable(this.buildMeshMaterialGroups(geometry), matrix, children, isBillboard);
        }

        private buildMeshDrawableFromPrimitive(primitive: IPrimitiveGeometry, parentMatrix: Mat4Array): MeshDrawable {
            var matrix = mat4.clone(primitive.Transform.Matrix);
            mat4.multiply(matrix, parentMatrix, matrix);

            return new MeshDrawable(this.buildMeshMaterialGroups(primitive), matrix, []);
        }

        private buildMeshMaterialGroups(geometry: IGeometry): IMeshMaterialGroup[] {
            var facesByMaterial: IFace[][] = [];

            geometry.Faces.forEach((face: IFace) => {
                if (face.MaterialId in facesByMaterial) {
                    facesByMaterial[face.MaterialId].push(face);
                } else {
                    facesByMaterial[face.MaterialId] = [face];
                }
            });

            return facesByMaterial.map((faces: IFace[], materialId) => {
                var material = this._model.Materials[materialId];

                return {
                    vertexBuffer: this.buildVertexBuffer(geometry.Vertices, faces, material),
                    baseColor: vec4.fromValues(material.Color.R, material.Color.G, material.Color.B, 1.0),
                    opacity: material.Opacity,
                    ambient: material.Ambient,
                    diffuse: material.Diffuse,
                    texture: this._textureCache[material.Texture] || null,
                    mask: this._textureCache[material.Mask] || null,
                    drawMode: material.GeometrySampling === GeometrySampling.Wireframe ? this._gl.LINES : this._gl.TRIANGLES
                };
            });
        }

        private buildVertexBuffer(vertices: IVertex[], faces: IFace[], material: IMaterial): IVertexBuffer {
            var buffers = material.GeometrySampling === GeometrySampling.Wireframe
                ? this.buildLineBuffers(vertices, faces)
                : this.buildTriangleBuffers(vertices, faces, material);

            var gl = this._gl;
            var positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffers.positions), gl.STATIC_DRAW);

            var uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffers.uvs), gl.STATIC_DRAW);

            var normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffers.normals), gl.STATIC_DRAW);

            return {
                positions: positionBuffer,
                uvs: uvBuffer,
                normals: normalBuffer,
                count: buffers.positions.length / 3
            };
        }

        private buildLineBuffers(vertices: IVertex[], faces: IFace[]) {
            var positions: number[] = [];
            var uvs: number[] = [];
            var normals: number[] = [];

            faces.forEach(face => {
                var length = face.Indices.length;
                for (var index = 0; index < length; ++index) {
                    var indices = [face.Indices[index], face.Indices[(index + 1) % length]];

                    indices.forEach(vertexIndex => {
                        var vertex = vertices[vertexIndex];

                        positions.push(vertex.Position.X, vertex.Position.Y, vertex.Position.Z);
                        uvs.push((<any>(vertex.UV) || {}).U || 0, (<any>(vertex.UV) || {}).V || 0);
                        normals.push(vertex.Normal.X, vertex.Normal.Y, vertex.Normal.Z);
                    });
                }
            });

            return {
                positions: new Float32Array(positions),
                uvs: new Float32Array(uvs),
                normals: new Float32Array(normals)
            };
        }

        private buildTriangleBuffers(vertices: IVertex[], faces: IFace[], material: IMaterial) {
            var positions: number[] = [];
            var uvs: number[] = [];
            var normals: number[] = [];

            faces.forEach(face => {
                face.Triangles.forEach(triangle => {
                    triangle.Indices.forEach(index => {
                        var vertex = vertices[index];
                        var normal = material.LightSampling == LightSampling.Vertex ? vertex.Normal : triangle.Normal;

                        positions.push(vertex.Position.X, vertex.Position.Y, vertex.Position.Z);
                        uvs.push((<any>(vertex.UV) || {}).U || 0, (<any>(vertex.UV) || {}).V || 0);
                        normals.push(normal.X, normal.Y, normal.Z);
                    });
                });
            });

            return {
                positions: new Float32Array(positions),
                uvs: new Float32Array(uvs),
                normals: new Float32Array(normals)
            };
        }
    }

    export function createDrawableFromModel(gl: WebGLRenderingContext, model: IModel, textures: IImageCollection): IDrawable {
        return new MeshDrawableBuilder(gl, model, textures).build();
    }
}