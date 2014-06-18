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

//TODO: Restore billboard mesh handling.  Still not 100% sure how to do this.
module RwxViewer {    
    interface PrototypeMap {
        [name: string]: Prototype;
    }

    class MeshDrawableBuilder {
        private _gl: WebGLRenderingContext;
        private _model: Model;
        private _prototypeMap: PrototypeMap;
        private _identityMatrix: Mat4Array;

        constructor(gl: WebGLRenderingContext, model: Model) {
            this._gl = gl;
            this._model = model;
            this._identityMatrix = mat4.create();

            this._prototypeMap = {};
            model.Prototypes.forEach(prototype => this._prototypeMap[prototype.Name] = prototype);
        }

        build(): Drawable {
            return this.buildMeshDrawableFromClump(this._model.Clump, mat4.create());
        }

        private buildMeshDrawableFromClump(clump: Clump, transformMatrix): MeshDrawable {
            var matrix = mat4.clone(clump.Transform.Matrix);
            mat4.multiply(matrix, transformMatrix, matrix);
            var meshData = this.buildGeometryMeshData(clump, this._identityMatrix);

            return new MeshDrawable(meshData.subMeshes, meshData.meshChildren, matrix, clump.Tag);
        }

        private buildGeometryMeshData(geometry: MeshGeometry, transformMatrix: Mat4Array) {
            var subMeshes = this.buildSubMeshes(geometry, transformMatrix);
            var meshChildren = geometry.Children.map(child => this.buildMeshDrawableFromClump(child, transformMatrix));

            geometry.PrototypeInstances.forEach(instance => {
                var meshData = this.buildPrototypeMeshData(instance, transformMatrix);
                subMeshes = subMeshes.concat(meshData.subMeshes);
                meshChildren = meshChildren.concat(meshData.meshChildren);
            });

            subMeshes = subMeshes.concat(this.buildPrimitiveSubMeshes(geometry.Primitives, transformMatrix));

            return {
                subMeshes: subMeshes,
                meshChildren: meshChildren
            };
        }

        private buildPrototypeMeshData(prototypeInstance: PrototypeInstance, transformMatrix: Mat4Array) {
            var prototype = this._prototypeMap[prototypeInstance.Name];
            var prototypeMatrix = mat4.create();
            mat4.mul(prototypeMatrix, transformMatrix, mat4.clone(prototypeInstance.Transform.Matrix));

            return this.buildGeometryMeshData(prototype, prototypeMatrix);
        }

        private buildPrimitiveSubMeshes(primitives: PrimitiveGeometry[], transformMatrix: Mat4Array) {
            var subMeshes = [];

            primitives.forEach(primitive => {
                var primitiveMatrix = mat4.create();
                mat4.mul(primitiveMatrix, transformMatrix, mat4.clone(primitive.Transform.Matrix));

                subMeshes = subMeshes.concat(this.buildSubMeshes(primitive, primitiveMatrix));
            });

            return subMeshes;
        }

        private buildSubMeshes(geometry: Geometry, transformMatrix: Mat4Array): SubMesh[] {
            var facesByMaterial: IFace[][] = [];

            geometry.Faces.forEach((face: IFace) => {
                if (face.MaterialId in facesByMaterial) {
                    facesByMaterial[face.MaterialId].push(face);
                } else {
                    facesByMaterial[face.MaterialId] = [face];
                }
            });

            return facesByMaterial.map((faces: IFace[], materialId): SubMesh => {
                var sourceMaterial = this._model.Materials[materialId];
                var resultMaterial = {
                    baseColor: vec4.fromValues(sourceMaterial.Color.R, sourceMaterial.Color.G, sourceMaterial.Color.B, 1.0),
                    opacity: sourceMaterial.Opacity,
                    ambient: sourceMaterial.Ambient,
                    diffuse: sourceMaterial.Diffuse,
                    texture: TextureCache.getTexture(this._gl, sourceMaterial.Texture, TextureFilteringMode.MipMap),
                    mask: TextureCache.getTexture(this._gl, sourceMaterial.Mask, TextureFilteringMode.None),
                    drawMode: sourceMaterial.GeometrySampling === GeometrySampling.Wireframe ? this._gl.LINES : this._gl.TRIANGLES
                };

                return {
                    vertexBuffer: this.buildVertexBuffer(transformMatrix, geometry.Vertices, faces, sourceMaterial),
                    material: resultMaterial
                };
            });
        }

        private buildVertexBuffer(transformMatrix: Mat4Array, vertices: Vertex[], faces: IFace[], material: Material): VertexBuffer {
            var buffers = material.GeometrySampling === GeometrySampling.Wireframe
                ? this.buildLineBuffers(transformMatrix, vertices, faces)
                : this.buildTriangleBuffers(transformMatrix, vertices, faces, material);

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

        private buildLineBuffers(transformMatrix: Mat4Array, vertices: Vertex[], faces: IFace[]) {
            var positions: number[] = [];
            var uvs: number[] = [];
            var normals: number[] = [];

            faces.forEach(face => {
                var length = face.Indices.length;
                for (var index = 0; index < length; ++index) {
                    var indices = [face.Indices[index], face.Indices[(index + 1) % length]];

                    indices.forEach(vertexIndex => {
                        var vertex = vertices[vertexIndex];

                        Array.prototype.push.apply(positions, this.computeVertexPosition(transformMatrix, vertex));
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

        //TODO: Will need to transform normals.
        private buildTriangleBuffers(transformMatrix: Mat4Array, vertices: Vertex[], faces: IFace[], material: Material) {
            var positions: number[] = [];
            var uvs: number[] = [];
            var normals: number[] = [];

            faces.forEach(face => {
                face.Triangles.forEach(triangle => {
                    triangle.Indices.forEach(index => {
                        var vertex = vertices[index];
                        var normal = material.LightSampling == LightSampling.Vertex ? vertex.Normal : triangle.Normal;

                        Array.prototype.push.apply(positions, this.computeVertexPosition(transformMatrix, vertex));
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

        private computeVertexPosition(transformMatrix: Mat4Array, vertex: Vertex) {
            var vertexVector = [vertex.Position.X, vertex.Position.Y, vertex.Position.Z];
            return vec3.transformMat4(vertexVector, vertexVector, transformMatrix);
        }
    }

    export function createDrawableFromModel(gl: WebGLRenderingContext, model: Model): Drawable {
        return new MeshDrawableBuilder(gl, model).build();
    }
}