define(["require", "exports", "Drawable"], function(require, exports, Drawable) {
    var Renderer = (function () {
        function Renderer(canvas) {
            this.initialize(canvas);
        }
        Renderer.prototype.initialize = function (canvas) {
            this.gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true }));
            var gl = this.gl;

            if (gl) {
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clearDepth(1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
            }
        };

        Renderer.prototype.draw = function () {
            var gl = this.gl;

            if (gl) {
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                if (this.currentDrawable) {
                    this.currentDrawable.draw();
                }

                window.requestAnimationFrame(this.draw);
            }
        };

        Renderer.prototype.setCurrentModel = function (model) {
            this.currentDrawable = new Drawable.MeshDrawable(this.gl, model);
        };
        return Renderer;
    })();
    exports.Renderer = Renderer;
});
//# sourceMappingURL=Renderer.js.map
