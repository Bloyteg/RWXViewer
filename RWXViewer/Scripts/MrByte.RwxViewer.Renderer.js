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
var RwxViewer;
(function (RwxViewer) {
    var ZOOM_FACTOR = 0.95;
    var DEFAULT_RADIUS_SCALE = 1.0;
    var DEFAULT_CAMERA_DISTANCE = 1;
    var ROTATION_SPEED = 0.5;
    var FOV = 45;
    var RADS_PER_DEGREE = Math.PI / 180;
    var PHI_EPS = 0.000001;

    function makeCamera(width, height) {
        return new Camera(width, height);
    }
    RwxViewer.makeCamera = makeCamera;

    var Camera = (function () {
        function Camera(viewportWidth, viewportHeight) {
            this.reset();
            this.setViewpowerSize(viewportWidth, viewportHeight);
            this.update();
        }
        Camera.prototype.setViewpowerSize = function (width, height) {
            this._viewportWidth = width;
            this._viewportHeight = height;
        };

        Camera.prototype.reset = function () {
            this._cameraMatrix = mat4.create();
            this._cameraMatrixInverse = mat4.create();

            this._offset = vec3.create();
            this._position = vec3.fromValues(0.0, 0.707 * DEFAULT_CAMERA_DISTANCE, 0.707 * DEFAULT_CAMERA_DISTANCE);
            this._target = vec3.create();
            this._pan = vec3.create();
            this._panOffset = vec3.create();
            this._up = vec3.fromValues(0, 1, 0);

            this._upQuaternion = quat.fromValues(1, 0, 0, 0);
            this._upQuarternionInverse = quat.create();
            quat.invert(this._upQuarternionInverse, this._upQuaternion);

            this._thetaDelta = 0;
            this._phiDelta = 0;
            this._scale = DEFAULT_RADIUS_SCALE;

            this.update();
        };

        Camera.prototype.rotate = function (deltaX, deltaY) {
            this._thetaDelta -= 2 * Math.PI * deltaX / this._viewportWidth * ROTATION_SPEED;
            this._phiDelta -= 2 * Math.PI * deltaY / this._viewportHeight * ROTATION_SPEED;

            this.update();
        };

        Camera.prototype.zoomIn = function (zoomFactor) {
            this._scale *= (zoomFactor || ZOOM_FACTOR);

            this.update();
        };

        Camera.prototype.zoomOut = function (zoomFactor) {
            this._scale /= (zoomFactor || ZOOM_FACTOR);

            this.update();
        };

        Camera.prototype.pan = function (deltaX, deltaY) {
            mat4.invert(this._cameraMatrixInverse, this._cameraMatrix);
            vec3.sub(this._offset, this._position, this._target);
            var distance = vec3.length(this._offset);

            distance *= Math.tan((FOV / 2) * RADS_PER_DEGREE);

            var xDistance = 2 * deltaX * distance / this._viewportHeight;
            vec3.set(this._panOffset, this._cameraMatrixInverse[0], this._cameraMatrixInverse[1], this._cameraMatrixInverse[2]);
            vec3.scale(this._panOffset, this._panOffset, xDistance);
            vec3.add(this._pan, this._pan, this._panOffset);

            var yDistance = 2 * deltaY * distance / this._viewportHeight;
            vec3.set(this._panOffset, this._cameraMatrixInverse[4], this._cameraMatrixInverse[5], this._cameraMatrixInverse[6]);
            vec3.scale(this._panOffset, this._panOffset, yDistance);
            vec3.add(this._pan, this._pan, this._panOffset);

            this.update();
        };

        Camera.prototype.update = function () {
            vec3.sub(this._offset, this._position, this._target);
            vec3.transformQuat(this._offset, this._offset, this._upQuaternion);

            var offsetX = this._offset[0];
            var offsetY = this._offset[1];
            var offsetZ = this._offset[2];

            var theta = Math.atan2(offsetX, offsetZ);
            var phi = Math.atan2(Math.sqrt(offsetX * offsetX + offsetZ * offsetZ), offsetY);

            theta += this._thetaDelta;
            phi += this._phiDelta;

            phi = Math.max(PHI_EPS, Math.min(Math.PI - PHI_EPS, phi));

            var radius = vec3.length(this._offset) * this._scale;

            this._offset[0] = radius * Math.sin(phi) * Math.sin(theta);
            this._offset[1] = radius * Math.cos(phi);
            this._offset[2] = radius * Math.sin(phi) * Math.cos(theta);

            vec3.transformQuat(this._offset, this._offset, this._upQuarternionInverse);

            vec3.add(this._target, this._target, this._pan);
            vec3.add(this._position, this._target, this._offset);

            this._scale = DEFAULT_RADIUS_SCALE;
            this._thetaDelta = 0;
            this._phiDelta = 0;
            vec3.set(this._pan, 0, 0, 0);

            mat4.lookAt(this._cameraMatrix, this._position, this._target, this._up);
        };

        Object.defineProperty(Camera.prototype, "matrix", {
            get: function () {
                return this._cameraMatrix;
            },
            enumerable: true,
            configurable: true
        });
        return Camera;
    })();
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    var MeshDrawableBuilder = (function () {
        function MeshDrawableBuilder(gl, model, textures) {
            this._gl = gl;
            this._model = model;
            this._textureCache = this.buildTextureCache(textures);
        }
        //TODO: This gets moved out into classes for manging texture resources.
        MeshDrawableBuilder.prototype.buildTextureCache = function (textures) {
            var result = {};

            var keys = Object.keys(textures);
            var length = keys.length;
            var anistropicFiltering = this._gl.getExtension("EXT_texture_filter_anisotropic") || this._gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || this._gl.getExtension("MOZ_EXT_texture_filter_anisotropic");

            for (var index = 0; index < length; ++index) {
                var key = keys[index];

                result[key] = this.buildTextureFromImage(textures[key], anistropicFiltering);
            }

            return result;
        };

        MeshDrawableBuilder.prototype.buildTextureFromImage = function (image, anistropyExt) {
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
        };

        MeshDrawableBuilder.prototype.build = function () {
            var prototypes = this.buildPrototypeCache(this._model);

            return this.buildMeshDrawableFromClump(this._model.Clump, prototypes, mat4.create(), this._model.AxisAlignment !== 0 /* None */);
        };

        MeshDrawableBuilder.prototype.buildPrototypeCache = function (model) {
            var _this = this;
            return model.Prototypes.reduce(function (prototypeCache, prototype) {
                prototypeCache[prototype.Name] = _this.buildMeshDrawableFromPrototype(model, prototype, prototypeCache);
                return prototypeCache;
            }, {});
        };

        MeshDrawableBuilder.prototype.buildMeshDrawableFromPrototype = function (model, prototype, prototypeCache) {
            return this.buildMeshDrawableFromMeshGeometry(prototype, prototypeCache, mat4.create());
        };

        //TODO: Handle bill-boarding better.
        MeshDrawableBuilder.prototype.buildMeshDrawableFromClump = function (clump, prototypeCache, parentMatrix, isBillboard) {
            if (typeof parentMatrix === "undefined") { parentMatrix = mat4.create(); }
            var matrix = mat4.clone(clump.Transform.Matrix);
            mat4.multiply(matrix, parentMatrix, matrix);

            return this.buildMeshDrawableFromMeshGeometry(clump, prototypeCache, matrix, isBillboard);
        };

        MeshDrawableBuilder.prototype.buildMeshDrawableFromMeshGeometry = function (geometry, prototypeCache, matrix, isBillboard) {
            var _this = this;
            var children = [];
            children = children.concat(geometry.Children.map(function (child) {
                return _this.buildMeshDrawableFromClump(child, prototypeCache, matrix, isBillboard);
            }));

            //TODO: Handle the case where this is a prototypeinstancegeometry.
            children = children.concat(geometry.PrototypeInstances.map(function (prototypeInstance) {
                var newMatrix = mat4.clone(prototypeInstance.Transform.Matrix);
                newMatrix = mat4.multiply(newMatrix, matrix, newMatrix);

                return prototypeCache[prototypeInstance.Name].cloneWithTransform(newMatrix);
            }));
            children = children.concat(geometry.Primitives.map(function (primitive) {
                return _this.buildMeshDrawableFromPrimitive(primitive, matrix);
            }));

            return new RwxViewer.MeshDrawable(this.buildMeshMaterialGroups(geometry), matrix, children, isBillboard);
        };

        MeshDrawableBuilder.prototype.buildMeshDrawableFromPrimitive = function (primitive, parentMatrix) {
            var matrix = mat4.clone(primitive.Transform.Matrix);
            mat4.multiply(matrix, parentMatrix, matrix);

            return new RwxViewer.MeshDrawable(this.buildMeshMaterialGroups(primitive), matrix, []);
        };

        MeshDrawableBuilder.prototype.buildMeshMaterialGroups = function (geometry) {
            var _this = this;
            var facesByMaterial = [];

            geometry.Faces.forEach(function (face) {
                if (face.MaterialId in facesByMaterial) {
                    facesByMaterial[face.MaterialId].push(face);
                } else {
                    facesByMaterial[face.MaterialId] = [face];
                }
            });

            return facesByMaterial.map(function (faces, materialId) {
                var material = _this._model.Materials[materialId];

                return {
                    vertexBuffer: _this.buildVertexBuffer(geometry.Vertices, faces, material),
                    baseColor: vec4.fromValues(material.Color.R, material.Color.G, material.Color.B, 1.0),
                    opacity: material.Opacity,
                    ambient: material.Ambient,
                    diffuse: material.Diffuse,
                    texture: _this._textureCache[material.Texture] || null,
                    mask: _this._textureCache[material.Mask] || null,
                    drawMode: material.GeometrySampling === 1 /* Wireframe */ ? _this._gl.LINES : _this._gl.TRIANGLES
                };
            });
        };

        MeshDrawableBuilder.prototype.buildVertexBuffer = function (vertices, faces, material) {
            var buffers = material.GeometrySampling === 1 /* Wireframe */ ? this.buildLineBuffers(vertices, faces) : this.buildTriangleBuffers(vertices, faces, material);

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
        };

        MeshDrawableBuilder.prototype.buildLineBuffers = function (vertices, faces) {
            var positions = [];
            var uvs = [];
            var normals = [];

            faces.forEach(function (face) {
                var length = face.Indices.length;
                for (var index = 0; index < length; ++index) {
                    var indices = [face.Indices[index], face.Indices[(index + 1) % length]];

                    indices.forEach(function (vertexIndex) {
                        var vertex = vertices[vertexIndex];

                        positions.push(vertex.Position.X, vertex.Position.Y, vertex.Position.Z);
                        uvs.push(((vertex.UV) || {}).U || 0, ((vertex.UV) || {}).V || 0);
                        normals.push(vertex.Normal.X, vertex.Normal.Y, vertex.Normal.Z);
                    });
                }
            });

            return {
                positions: new Float32Array(positions),
                uvs: new Float32Array(uvs),
                normals: new Float32Array(normals)
            };
        };

        MeshDrawableBuilder.prototype.buildTriangleBuffers = function (vertices, faces, material) {
            var positions = [];
            var uvs = [];
            var normals = [];

            faces.forEach(function (face) {
                face.Triangles.forEach(function (triangle) {
                    triangle.Indices.forEach(function (index) {
                        var vertex = vertices[index];
                        var normal = material.LightSampling == 1 /* Vertex */ ? vertex.Normal : triangle.Normal;

                        positions.push(vertex.Position.X, vertex.Position.Y, vertex.Position.Z);
                        uvs.push(((vertex.UV) || {}).U || 0, ((vertex.UV) || {}).V || 0);
                        normals.push(normal.X, normal.Y, normal.Z);
                    });
                });
            });

            return {
                positions: new Float32Array(positions),
                uvs: new Float32Array(uvs),
                normals: new Float32Array(normals)
            };
        };
        return MeshDrawableBuilder;
    })();

    function createDrawableFromModel(gl, model, textures) {
        return new MeshDrawableBuilder(gl, model, textures).build();
    }
    RwxViewer.createDrawableFromModel = createDrawableFromModel;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    function makeGrid(gl) {
        return new GridDrawable(gl);
    }
    RwxViewer.makeGrid = makeGrid;

    var GridDrawable = (function () {
        function GridDrawable(gl) {
            var vertices = [];

            for (var x = -1; x <= 1; x += 0.1) {
                vertices.push(x, 0, -1);
                vertices.push(x, 0, 1);
            }

            for (var z = -1; z <= 1; z += 0.1) {
                vertices.push(-1, 0, z);
                vertices.push(1, 0, z);
            }

            this._vertexCount = vertices.length / 3;
            this._vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        }
        GridDrawable.prototype.draw = function (gl, shader) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, this._vertexCount);
        };
        return GridDrawable;
    })();
    RwxViewer.GridDrawable = GridDrawable;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    

    //TODO: Handle prelit meshes.
    var MeshDrawable = (function () {
        function MeshDrawable(meshMaterialGroups, modelMatrix, children, isBillboard) {
            this._meshMaterialGroups = meshMaterialGroups;
            this._modelMatrix = modelMatrix;
            this._children = children;
            this._isBillboard = isBillboard || false;
        }
        MeshDrawable.prototype.cloneWithTransform = function (matrix) {
            var newTransformMatrix = mat4.clone(this._modelMatrix);
            mat4.mul(newTransformMatrix, matrix, newTransformMatrix);

            return new MeshDrawable(this._meshMaterialGroups, newTransformMatrix, this._children.map(function (child) {
                return child instanceof MeshDrawable ? child.cloneWithTransform(matrix) : child;
            }));
        };

        MeshDrawable.prototype.draw = function (gl, shader) {
            var _this = this;
            this._meshMaterialGroups.forEach(function (meshMaterialGroup) {
                _this.setTransformUniforms(gl, shader, meshMaterialGroup);
                _this.setMaterialUniforms(gl, shader, meshMaterialGroup);
                _this.bindTexture(gl, shader, meshMaterialGroup);
                _this.bindMask(gl, shader, meshMaterialGroup);
                _this.bindVertexBuffers(gl, shader, meshMaterialGroup);

                gl.drawArrays(meshMaterialGroup.drawMode, 0, meshMaterialGroup.vertexBuffer.count);
            });

            this._children.forEach(function (child) {
                return child.draw(gl, shader);
            });
        };

        MeshDrawable.prototype.setTransformUniforms = function (gl, shader, meshMaterialGroup) {
            gl.uniformMatrix4fv(shader.uniforms["u_modelMatrix"], false, this._modelMatrix);

            gl.uniform1i(shader.uniforms["u_isBillboard"], this._isBillboard ? 1 : 0);
        };

        MeshDrawable.prototype.setMaterialUniforms = function (gl, shader, meshMaterialGroup) {
            gl.uniform1f(shader.uniforms["u_ambientFactor"], meshMaterialGroup.ambient);
            gl.uniform1f(shader.uniforms["u_diffuseFactor"], meshMaterialGroup.diffuse);
            gl.uniform4fv(shader.uniforms["u_baseColor"], meshMaterialGroup.baseColor);
            gl.uniform1f(shader.uniforms["u_opacity"], meshMaterialGroup.opacity);
        };

        //TODO: Refactor this logic off into ITexture types.
        MeshDrawable.prototype.bindTexture = function (gl, shader, meshMaterialGroup) {
            if (meshMaterialGroup.texture !== null) {
                gl.uniform1i(shader.uniforms["u_hasTexture"], 1);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, meshMaterialGroup.texture);
                gl.uniform1i(shader.uniforms["u_textureSampler"], 0);
            } else {
                gl.uniform1i(shader.uniforms["u_hasTexture"], 0);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.uniform1i(shader.uniforms["u_textureSampler"], 0);
            }
        };

        //TODO: Refactor this off into ITexture types.
        MeshDrawable.prototype.bindMask = function (gl, shader, meshMaterialGroup) {
            if (meshMaterialGroup.mask !== null) {
                gl.uniform1i(shader.uniforms["u_hasMask"], 1);
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, meshMaterialGroup.mask);
                gl.uniform1i(shader.uniforms["u_maskSampler"], 1);
            } else {
                gl.uniform1i(shader.uniforms["u_hasMask"], 0);
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.uniform1i(shader.uniforms["u_maskSampler"], 1);
            }
        };

        //TODO: Refactor this off into IVertexBuffer types.
        MeshDrawable.prototype.bindVertexBuffers = function (gl, shader, meshMaterialGroup) {
            gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.positions);
            gl.vertexAttribPointer(shader.attributes["a_vertexPosition"], 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.uvs);
            gl.vertexAttribPointer(shader.attributes["a_vertexUV"], 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, meshMaterialGroup.vertexBuffer.normals);
            gl.vertexAttribPointer(shader.attributes["a_vertexNormal"], 3, gl.FLOAT, true, 0, 0);
        };
        return MeshDrawable;
    })();
    RwxViewer.MeshDrawable = MeshDrawable;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    (function (AxisAlignment) {
        AxisAlignment[AxisAlignment["None"] = 0] = "None";
        AxisAlignment[AxisAlignment["ZOrientX"] = 1] = "ZOrientX";
        AxisAlignment[AxisAlignment["ZOrientY"] = 2] = "ZOrientY";
        AxisAlignment[AxisAlignment["Xyz"] = 3] = "Xyz";
    })(RwxViewer.AxisAlignment || (RwxViewer.AxisAlignment = {}));
    var AxisAlignment = RwxViewer.AxisAlignment;

    (function (GeometrySampling) {
        GeometrySampling[GeometrySampling["Solid"] = 0] = "Solid";
        GeometrySampling[GeometrySampling["Wireframe"] = 1] = "Wireframe";
        GeometrySampling[GeometrySampling["Pointcloud"] = 2] = "Pointcloud";
    })(RwxViewer.GeometrySampling || (RwxViewer.GeometrySampling = {}));
    var GeometrySampling = RwxViewer.GeometrySampling;

    (function (LightSampling) {
        LightSampling[LightSampling["Facet"] = 0] = "Facet";
        LightSampling[LightSampling["Vertex"] = 1] = "Vertex";
    })(RwxViewer.LightSampling || (RwxViewer.LightSampling = {}));
    var LightSampling = RwxViewer.LightSampling;

    (function (TextureMode) {
        TextureMode[TextureMode["Null"] = 0] = "Null";
        TextureMode[TextureMode["Lit"] = 1] = "Lit";
        TextureMode[TextureMode["Foreshorten"] = 2] = "Foreshorten";
        TextureMode[TextureMode["Filter"] = 4] = "Filter";
    })(RwxViewer.TextureMode || (RwxViewer.TextureMode = {}));
    var TextureMode = RwxViewer.TextureMode;

    (function (TextureAddressMode) {
        TextureAddressMode[TextureAddressMode["Wrap"] = 0] = "Wrap";
        TextureAddressMode[TextureAddressMode["Mirror"] = 1] = "Mirror";
        TextureAddressMode[TextureAddressMode["Clamp"] = 2] = "Clamp";
    })(RwxViewer.TextureAddressMode || (RwxViewer.TextureAddressMode = {}));
    var TextureAddressMode = RwxViewer.TextureAddressMode;

    (function (MaterialMode) {
        MaterialMode[MaterialMode["Null"] = 0] = "Null";
        MaterialMode[MaterialMode["Double"] = 1] = "Double";
    })(RwxViewer.MaterialMode || (RwxViewer.MaterialMode = {}));
    var MaterialMode = RwxViewer.MaterialMode;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    var Renderer = (function () {
        function Renderer(gl) {
            this._projectionMatrix = mat4.create();
            this._gl = gl;
        }
        Renderer.prototype.initialize = function (mainProgram, gridProgram) {
            var gl = this._gl;

            if (gl) {
                this._camera = RwxViewer.makeCamera(gl.drawingBufferWidth, gl.drawingBufferHeight);
                this._spatialGridDrawable = RwxViewer.makeGrid(gl);

                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                gl.clearColor(0.75, 0.75, 0.75, 1.0);
                gl.clearDepth(1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            }

            this._mainProgram = mainProgram;
            this._gridProgram = gridProgram;
        };

        Renderer.prototype.draw = function () {
            var _this = this;
            var gl = this._gl;

            if (gl) {
                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.CULL_FACE);
                mat4.perspective(this._projectionMatrix, 45, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100.0);

                this._gridProgram.use(function (program) {
                    gl.uniformMatrix4fv(program.uniforms["u_projectionMatrix"], false, _this._projectionMatrix);
                    gl.uniformMatrix4fv(program.uniforms["u_viewMatrix"], false, _this._camera.matrix);
                    _this._spatialGridDrawable.draw(gl, program);
                });

                this._mainProgram.use(function (program) {
                    if (_this._currentDrawable) {
                        gl.uniformMatrix4fv(program.uniforms["u_projectionMatrix"], false, _this._projectionMatrix);
                        gl.uniformMatrix4fv(program.uniforms["u_viewMatrix"], false, _this._camera.matrix);
                        _this._currentDrawable.draw(gl, program);
                    }
                });
            }
        };

        Renderer.prototype.setCurrentModel = function (model, textures) {
            if (model) {
                this._currentDrawable = RwxViewer.createDrawableFromModel(this._gl, model, textures);
            } else {
                this._currentDrawable = null;
            }
        };

        Object.defineProperty(Renderer.prototype, "camera", {
            get: function () {
                return this._camera;
            },
            enumerable: true,
            configurable: true
        });
        return Renderer;
    })();
    RwxViewer.Renderer = Renderer;
})(RwxViewer || (RwxViewer = {}));
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
var RwxViewer;
(function (RwxViewer) {
    var ShaderProgram = (function () {
        function ShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
            this._gl = gl;
            this._shaderProgram = this.initializeProgram(vertexShaderSource, fragmentShaderSource);
            this._uniforms = this.getUniforms();
            this._attributes = this.getAttributes();
        }
        ShaderProgram.prototype.initializeProgram = function (vertexShaderSource, fragmentShaderSource) {
            var gl = this._gl;
            var vertexShader = this.compileShader(vertexShaderSource, gl.VERTEX_SHADER);
            var fragmentShader = this.compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

            var shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                throw new Error(gl.getProgramParameter(shaderProgram, gl.LINK_STATUS));
            }

            return shaderProgram;
        };

        ShaderProgram.prototype.getUniforms = function () {
            var gl = this._gl;

            var totalUniforms = gl.getProgramParameter(this._shaderProgram, gl.ACTIVE_UNIFORMS);
            var uniforms = {};

            for (var uniformIndex = 0; uniformIndex < totalUniforms; ++uniformIndex) {
                var uniform = gl.getActiveUniform(this._shaderProgram, uniformIndex);
                uniforms[uniform.name] = gl.getUniformLocation(this._shaderProgram, uniform.name);
            }

            return uniforms;
        };

        ShaderProgram.prototype.getAttributes = function () {
            var gl = this._gl;
            var attributeCount = gl.getProgramParameter(this._shaderProgram, gl.ACTIVE_ATTRIBUTES);
            var attributes = {};
            this._attributeCount = attributeCount;

            for (var attributeIndex = 0; attributeIndex < attributeCount; ++attributeIndex) {
                var attribute = gl.getActiveAttrib(this._shaderProgram, attributeIndex);
                attributes[attribute.name] = attributeIndex;
            }

            return attributes;
        };

        Object.defineProperty(ShaderProgram.prototype, "attributes", {
            get: function () {
                return this._attributes;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ShaderProgram.prototype, "uniforms", {
            get: function () {
                return this._uniforms;
            },
            enumerable: true,
            configurable: true
        });

        ShaderProgram.prototype.compileShader = function (shaderSource, type) {
            var gl = this._gl;
            var shader = gl.createShader(type);

            gl.shaderSource(shader, shaderSource);
            gl.compileShader(shader);

            if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                return shader;
            }

            throw new Error(gl.getShaderInfoLog(shader));
        };

        ShaderProgram.prototype.use = function (handler) {
            this._gl.useProgram(this._shaderProgram);

            for (var counter = 0; counter < this._attributeCount; ++counter) {
                this._gl.enableVertexAttribArray(counter);
            }

            handler(this);

            for (counter = 0; counter < this._attributeCount; ++counter) {
                this._gl.disableVertexAttribArray(counter);
            }
        };
        return ShaderProgram;
    })();
    RwxViewer.ShaderProgram = ShaderProgram;
})(RwxViewer || (RwxViewer = {}));
