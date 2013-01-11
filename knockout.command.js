// By: Hans Fjällemark and John Papa
// https://github.com/CodeSeven/KoLite
(function (factory) {
    // Module systems magic dance.

    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // CommonJS or Node: hard-coded dependency on "knockout"
        factory(require("knockout"), exports);
    } else if (typeof define === "function" && define["amd"]) {
        // AMD anonymous module with hard-coded dependency on "knockout"
        define(["knockout", "exports"], factory);
    } else {
        // <script> tag: use the global `ko` object, attaching a `mapping` property
        factory(ko, ko.mapping = {});
    }
}(function (ko, exports) {
    ko.command = function (options) {
        var
            self = ko.observable(),
            canExecuteDelegate = options.canExecute,
            executeDelegate = options.execute;

        self.canExecute = ko.computed(function () {
            return canExecuteDelegate ? canExecuteDelegate() : true;
        });

        self.execute = function (arg1, arg2) {
            // Needed for anchors since they don't support the disabled state
            if (!self.canExecute()) return

            executeDelegate.apply(this, [arg1, arg2]);
        };

        return self;
    };

    ko.asyncCommand = function (options) {
        var
            self = ko.observable(),
            canExecuteDelegate = options.canExecute,
            executeDelegate = options.execute,

            completeCallback = function () {
                self.isExecuting(false);
            };

        self.isExecuting = ko.observable();

        self.canExecute = ko.computed(function () {
            return canExecuteDelegate ? canExecuteDelegate(self.isExecuting()) : !self.isExecuting();
        });

        self.execute = function (arg1, arg2) {
            // Needed for anchors since they don't support the disabled state
            if (!self.canExecute()) return

            var args = []; // Allow for these arguments to be passed on to execute delegate

            if (executeDelegate.length >= 2) {
                args.push(arg1);
            }

            if (executeDelegate.length >= 3) {
                args.push(arg2);
            }

            args.push(completeCallback);
            self.isExecuting(true);
            executeDelegate.apply(this, args);
        };

        return self;
    };
}));

; (function (factory) {
    // Module systems magic dance.

    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // CommonJS or Node: hard-coded dependency on "knockout"
        factory(require("knockout"), exports);
    } else if (typeof define === "function" && define["amd"]) {
        // AMD anonymous module with hard-coded dependency on "knockout"
        define(["knockout", "exports"], factory);
    } else {
        // <script> tag: use the global `ko` object, attaching a `mapping` property
        factory(ko, ko.mapping = {});
    }
}(function (ko, exports) {
    ko.utils.wrapAccessor = function (accessor) {
        return function () {
            return accessor;
        };
    };

    ko.bindingHandlers.command = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var
                value = valueAccessor(),
                commands = value.execute ? { click: value } : value,

                isBindingHandler = function (handler) {
                    return ko.bindingHandlers[handler] !== undefined;
                },

                initBindingHandlers = function () {
                    for (var command in commands) {
                        if (!isBindingHandler(command)) {
                            continue;
                        };

                        ko.bindingHandlers[command].init(
                            element,
                            ko.utils.wrapAccessor(commands[command].execute),
                            allBindingsAccessor,
                            viewModel
                        );
                    }
                },

                initEventHandlers = function () {
                    var events = {};

                    for (var command in commands) {
                        if (!isBindingHandler(command)) {
                            events[command] = commands[command].execute;
                        }
                    }

                    ko.bindingHandlers.event.init(
                        element,
                        ko.utils.wrapAccessor(events),
                        allBindingsAccessor,
                        viewModel);
                };

            initBindingHandlers();
            initEventHandlers();
        },

        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var commands = valueAccessor();
            var canExecute = commands.canExecute;

            if (!canExecute) {
                for (var command in commands) {
                    if (commands[command].canExecute) {
                        canExecute = commands[command].canExecute;
                        break;
                    }
                }
            }

            if (!canExecute) {
                return;
            }

            ko.bindingHandlers.enable.update(element, canExecute, allBindingsAccessor, viewModel);
        }
    };
}));