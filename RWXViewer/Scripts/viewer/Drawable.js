define(["require", "exports"], function(require, exports) {
    var MeshDrawable = (function () {
        function MeshDrawable(gl, vertexBuffer, indexBuffers) {
            this.gl = gl;
            this.vertexBuffer = vertexBuffer;
            this.indexBuffers = indexBuffers;
            this.children = new Array();
        }
        MeshDrawable.prototype.draw = function () {
            var gl = this.gl;

            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer.vertexPositions);

            //TODO: Set position attributes.
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer.vertexUVs);

            //TODO: Set UV attributes.
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer.vertexNormals);

            //TODO: Set normal attributes.
            this.indexBuffers.forEach(function (indexBuffer) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.indexBuffer);

                //TODO: Set matrices
                gl.drawElements(gl.TRIANGLES, indexBuffer.indexCount, gl.UNSIGNED_SHORT, 0);
            });

            gl.drawElements(gl.TRIANGLES, 500, gl.UNSIGNED_SHORT, 0);

            this.children.forEach(function (child) {
                return child.draw();
            });
        };
        return MeshDrawable;
    })();
    exports.MeshDrawable = MeshDrawable;
});
//# sourceMappingURL=Drawable.js.map
