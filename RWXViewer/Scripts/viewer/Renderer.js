define(["require", "exports", "DrawableBuilder"], function(require, exports, DrawableBuilder) {
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
                    //    this.currentDrawable.draw();
                }
            }
        };

        Renderer.prototype.setCurrentModel = function (model) {
            var builder = new DrawableBuilder.DrawableBuilder(this.gl);
            this.currentDrawable = builder.loadModel(model);
        };
        return Renderer;
    })();
    exports.Renderer = Renderer;
});
//# sourceMappingURL=Renderer.js.map
