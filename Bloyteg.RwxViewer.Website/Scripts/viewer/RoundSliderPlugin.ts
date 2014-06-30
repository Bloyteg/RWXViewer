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

            function setValue(angle: number, notify: boolean) {
                slider.val(angle);

                if (notify) {
                    slider.change();
                }

                sliderDisplay.html(angle + '&deg;');

                var angleInRadians = angle * (Math.PI / 180);

                sliderHandle.css({
                    top: Math.sin(angleInRadians) * 56 + (sliderOuterCircle.height() / 2 - sliderHandle.height() / 2 + 4),
                    left: -Math.cos(angleInRadians) * 56 + (sliderOuterCircle.width() / 2 - sliderHandle.width() / 2 + 4)
                });
            }

            slider.change(() => {
                setValue(slider.val(), false);
            });

            setValue(0, true);

            sliderHandle.mousedown(() => {
                event.preventDefault();
                mouseDown = true;
            });

            $(document).mouseup(() => {
                mouseDown = false;
            });

            $(document).mousemove(event => {
                if (mouseDown) {
                    event.preventDefault();

                    var offset = sliderOuterCircle.offset();
                    var newPosition = {
                        left: event.pageX - offset.left - (sliderOuterCircle.width() / 2),
                        top: event.pageY - offset.top - (sliderOuterCircle.height() / 2)
                    };

                    var angle = Math.floor(Math.atan2(newPosition.top, -newPosition.left) * 180 / Math.PI);
                    angle = angle < 0 ? 360 + (angle % 360) : (angle % 360);

                    setValue(angle, true);
                }
            });

        });
    }
})(jQuery);