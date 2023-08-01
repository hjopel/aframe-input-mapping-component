AFRAME.inputActivators = {};

AFRAME.registerInputActivator = function (name, definition) {
  AFRAME.inputActivators[name] = definition;
};
// require('./longpress.js');
export { LongPress } from "./longpress.js";
// require('./doubletouch.js');
export { DoubleTouch } from "./doubletouch.js";
// require('./doublepress.js');
export { DoublePress } from "./doublepress.js";
// require('./simpleactivator.js');
export { createSimpleActivator } from "./simpleactivator.js";
