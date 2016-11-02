Math.log2 = Math.log2 || function(x) {
        return Math.log(x) / Math.LN2;
    };

(function() {
    function VisElement(value, node) {
        this.value = value;
        this.node = node;
        this.state = {};
    }
    VisElement.prototype.toString = function() {
        return this.value;
    };

    this.AnimationQueue = function() {
        var queue = [];
        var animating = false;
        var previousDuration = 0;

        this.push = function(callback, duration) {
            if (typeof callback !== "function") return;
            queue.push({
                callback: callback,
                duration: duration,
            });
        };

        this.do = function() {
            if (!queue.length) {
                this.stop();
            }
            if (animating) return;
            
            animating = true;

            if (previousDuration > 0) {
                setTimeout(startNext, previousDuration)
            } else startNext();
        };

        this.stop = function() {
            animating = false;
        };

        this.pause = function(time) {
            this.push(function() {}, time);
        };

        function startNext() {
            if (!animating) return;

            var element = queue.shift();
            if (element) {
                previousDuration = element.duration;
                element.callback();
                setTimeout(function() {
                    startNext();
                }, element.duration)
            }
        }
    };

    this.Visualizer = function(context) {
        var queue = new AnimationQueue();
        var elements = [];
        var isRunning = false;
        var toggler = $("<div>").addClass("toggler play").prependTo("body");

        this.context = context || $("body");

        registerEvents.call(this);

        this.loadElements = function(arr) {
            for (var i = 0; i < arr.length; i++) {
                elements.push(new VisElement(arr[i], $("<div>")));
            }
        };

        this.swapElements = function(i, j) {
            var iNode = elements[i].node;
            var jNode = elements[j].node;
            var iPosition = elements[i].state.position || iNode.position();
            var jPosition = elements[j].state.position || jNode.position();
            
            // swap real dom elements
            var tmpNode = $("<div>").insertBefore(iNode);
            iNode.after(jNode);
            jNode.after(tmpNode);
            tmpNode.remove();

            // update virtual state
            elements[i].state.position = jPosition;
            elements[j].state.position = iPosition;

            // swap internal array elements
            [elements[i], elements[j]] = [elements[j], elements[i]];
            
            // add swap animation in queue
            queue.push(function() {
                iNode.animate(jPosition, 400);
                jNode.animate(iPosition, 400)
            }, 600);
        };

        this.buildRow = function() {
            for (var i = 0; i < elements.length; i++) {
                $(this.context).append(elements[i].node.addClass("node std-size circle").css("left", i * 70).text(elements[i]));
            }
        };

        this.buildBinaryTree = function(callback) {
            var treeHeight = Math.floor(Math.log2(elements.length));

            function getBases() {
                var bases = [];
                var k = 0.5;

                bases[treeHeight] = 0;
                for (var i = treeHeight - 1; i >= 0; i--) {
                    if (bases[i + 1] === undefined) bases[i] = 0;
                    else bases[i] = bases[i + 1] + 60 * k;
                    k *= 2;
                }

                return bases;
            }
            
            var yOffset = 80;
            var bases = getBases();
            for (var i = 0; i < elements.length; i++) {
                var height = Math.floor(Math.log2(i + 1));
                var position = {
                    'top': yOffset * height,
                    'left': bases[height] + ((i + 1) % Math.pow(2, height)) * (60 * Math.pow(2, treeHeight - height)),
                };
                elements[i].state.position = position;
                
                (function(node, position) {
                    queue.push(function() {
                        node.animate(position, 500);
                    }, 20);
                })(elements[i].node, position);
            }

            queue.pause(2000);
        };

        Visualizer.prototype.hightlight = function(i, color) {
            var element = elements[i].node;
            queue.push(function() {
                $(element).addClass("hightlighted");

                if (typeof color === "object") {
                    if (color.text) $(element).css("color", color.text);
                    if (color.background) $(element).css("background-color", color.background)
                } else if (typeof color === "string") {
                    $(element).css("background-color", color)
                }
            }, 300);
        };

        Visualizer.prototype.cancelHightlight = function(i) {
            var element = elements[i].node;
            queue.push(function() {
                $(element).removeClass("hightlighted");
                $(element).css("color", "");
                $(element).css("background-color", "");
            }, 300);
        };

        this.start = function() {
            queue.do();
            isRunning = true;
        };

        this.stop = function() {
            queue.stop();
            isRunning = false;
        }

        function registerEvents() {
            var self = this;

            function toggleRunning() {
                if (isRunning) {
                    self.stop();
                    toggler.addClass("play").removeClass("pause");
                } else {
                    self.start();
                    toggler.addClass("pause").removeClass("play");
                }
            }

            // pause & resume by pressing space button on the keyboard
            $(document).bind("keydown", function(e) {
                if (e.keyCode == 32) {
                    toggleRunning();
                }
            });
            toggler.click(toggleRunning);

            $()
        }
    };
})();
