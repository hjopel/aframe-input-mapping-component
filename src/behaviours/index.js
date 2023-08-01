AFRAME.inputBehaviours = {};

AFRAME.registerInputBehaviour = function (name, definition) {
  AFRAME.inputBehaviours[name] = definition;
};


export { DPad } from './dpad.js';