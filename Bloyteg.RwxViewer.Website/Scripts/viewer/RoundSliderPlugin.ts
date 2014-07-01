interface JQuery {
    roundSlider(): JQuery;
}

($ => {
    $.fn.roundSlider = function () {
        $(this).each(function () {
            var slider = $(this);

            slider.hide();
            slider.after(
                '<div id="azimuthSlider" class="roundSlider">  \
                     <div class="outerCircle">                 \
                         <div class="innerCircle" >            \
                             <div class="valueDisplay"></div>  \
                         </div>                                \
                     </div>                                    \
                     <div class="sliderHandle" ></div>         \
                 </div>');

            var sliderRegion = slider.next('.roundSlider');
            var sliderHandle = sliderRegion.find('.sliderHandle');
            var sliderOuterCircle = sliderRegion.find('.outerCircle');
            var sliderDisplay = sliderRegion.find('.valueDisplay');
            var mouseDown = false;

            var outerCircleHeight = sliderOuterCircle.height();
            var outerCircleWidth = sliderOuterCircle.width();
            var sliderHandleHeight = sliderHandle.height();
            var sliderHandleWidth = sliderHandle.width();
            var offset = sliderOuterCircle.offset();

            function setValue(angle: number, notify: boolean) {
                slider.val(angle);

                if (notify) {
                    slider.change();
                }

                sliderDisplay.html(angle + '&deg;');

                var angleInRadians = angle * (Math.PI / 180);

                sliderHandle.css({
                    top: Math.sin(angleInRadians) * (outerCircleHeight / 2 - 4) + (outerCircleHeight / 2) - (sliderHandleHeight / 2) + 4,
                    left: -Math.cos(angleInRadians) * (outerCircleWidth / 2 - 4) + (outerCircleWidth / 2) - (sliderHandleWidth / 2) + 4
                });
            }

            slider.change(() => {
                setValue(slider.val(), false);
            });

            setValue(0, true);

            sliderHandle.mousedown(event => {
                event.preventDefault();
                mouseDown = true;
            });

            $(document).mouseup(() => {
                mouseDown = false;
            });

            $(document).mousemove(event => {
                if (mouseDown) {
                    event.preventDefault();

                    var newPosition = {
                        left: event.pageX - offset.left - (outerCircleWidth / 2),
                        top: event.pageY - offset.top - (outerCircleHeight / 2)
                    };

                    var angle = Math.floor(Math.atan2(newPosition.top, -newPosition.left) * 180 / Math.PI);
                    angle = angle < 0 ? 360 + (angle % 360) : (angle % 360);

                    setValue(angle, true);
                }
            });

        });
    }
})(jQuery);