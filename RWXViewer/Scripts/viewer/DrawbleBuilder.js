define(["require", "exports", "Drawable"], function(require, exports, Drawable) {
    var DrawableBuilder = (function () {
        function DrawableBuilder(gl) {
            this.gl = gl;
        }
        DrawableBuilder.prototype.loadModel = function (model) {
            return this.buildMeshDrawable(model, model.Clump);
        };

        DrawableBuilder.prototype.buildMeshDrawable = function (model, geometry) {
            var _this = this;
            var vertexBuffer = this.buildVertexBuffer(geometry);
            var indexBuffers = this.buildIndexBuffers(geometry);

            var drawable = new Drawable.MeshDrawable(this.gl, vertexBuffer, indexBuffers);

            geometry.Children.forEach(function (child) {
                var childMeshDrawable = _this.buildMeshDrawable(model, child);
                drawable.children.push(childMeshDrawable);
            });

            return drawable;
        };

        DrawableBuilder.prototype.buildVertexBuffer = function (geometry) {
            var vertices = [];
            var uvs = [];
            var normals = [];

            geometry.Vertices.forEach(function (vertex) {
                vertices.push(vertex.Position.X);
                vertices.push(vertex.Position.Y);
                vertices.push(vertex.Position.Z);

                //TODO: Handle the no UV case.
                uvs.push(vertex.Uv.U || 0);
                uvs.push(vertex.Uv.V || 0);

                normals.push(vertex.Normal.X);
                normals.push(vertex.Normal.Y);
                normals.push(vertex.Normal.Z);
            });

            var gl = this.gl;
            var vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

            var uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

            var normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

            return {
                vertexPositions: vertexBuffer,
                vertexUVs: uvBuffer,
                vertexNormals: normalBuffer,
                vertexCount: geometry.Vertices.length
            };
        };

        DrawableBuilder.prototype.buildIndexBuffers = function (geometry) {
            var _this = this;
            var trianglesByMaterial = Array();

            geometry.Faces.forEach(function (face) {
                face.Triangles.forEach(function (triangle) {
                    if (face.MaterialId in trianglesByMaterial) {
                        trianglesByMaterial[face.MaterialId].push(triangle);
                    } else {
                        trianglesByMaterial[face.MaterialId] = [triangle];
                    }
                });
            });

            var indexBuffers = [];

            trianglesByMaterial.forEach(function (triangleGroup) {
                var indices = [];

                triangleGroup.forEach(function (triangle) {
                    Array.prototype.push.apply(indices, triangle.Indices);
                });

                var gl = _this.gl;
                var indexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

                indexBuffers.push({
                    indexBuffer: indexBuffer,
                    indexCount: indices.length
                });
            });

            return indexBuffers;
        };
        return DrawableBuilder;
    })();
    exports.DrawableBuilder = DrawableBuilder;
});
//# sourceMappingURL=DrawbleBuilder.js.map
