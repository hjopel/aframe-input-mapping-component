/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.inputMappings = {};

/**
 * Input Mapping component for A-Frame.
 */
AFRAME.registerSystem('input-mapping', {
  schema: {},
  mappings: {},
  mappingsPerControllers: {},
  currentMapping: 'default',
  _handlers: {},

  /**
   * Set if component needs multiple instancing.
   */
  multiple: false,

  keyboardHandler: function (event) {
    var mappings = AFRAME.inputMappings[this.currentMapping];

    if (mappings && mappings.keyboard) {
      mappings = mappings.keyboard;

      var mapEvent = mappings[event.key + '_' + event.type.substr(3)];
      if (mapEvent) {
        this.sceneEl.emit(mapEvent);
      }
    }
  },

  removeListeners: function () {
    for (var controllerType in this.mappingsPerControllers) {
      const mappingPerController = this.mappingsPerControllers[controllerType];
      for (var eventName in mappingPerController) {
        const key = `${controllerType}->${eventName}`;
        this.sceneEl.removeEventListener(eventName, this._handlers[key]);
      }
    }

    this._handlers = {};
    this.mappingsPerControllers = {};
  },

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    var self = this;

    this.keyboardHandler = this.keyboardHandler.bind(this);

    this.sceneEl.addEventListener('inputmappingregistered', function () {
      // @todo React to runtime input mappings register
    });

    // Controllers
    this.sceneEl.addEventListener('controllerconnected', function (evt) {
      if (!AFRAME.inputMappings) {
        console.warn('controller-mapping: No mappings defined');
        return;
      }

      for (var mappingName in AFRAME.inputMappings) {
        var mapping = AFRAME.inputMappings[mappingName];
        var controllerType = evt.detail.name;

        if (!self.mappingsPerControllers[controllerType]) {
          self.mappingsPerControllers[controllerType] = {};
        }

        var mappingsPerController = self.mappingsPerControllers[controllerType];

        var controllerMappings = mapping[controllerType];
        if (!controllerMappings) {
          console.warn('controller-mapping: No mappings defined for controller type: ', controllerType);
          return;
        }

        /*
          Generate a mapping for each controller:
          {
            'vive-controls': {
              triggerdown: {
                default: 'paint',
                task1: 'selectMenu'
              },
              menudown: {
                default: 'toggleMenu'
              }
            },
            'oculus-touch-controls': {
            ...
            }
          }
         */
        for (var eventName in controllerMappings) {
          mapping = controllerMappings[eventName];
          if (!mappingsPerController[eventName]) {
            mappingsPerController[eventName] = {};
          }

          mappingsPerController[eventName][mappingName] = mapping;
        }
      }

      // Create the listener for each event
      self.removeListeners();

      for (var eventName in mappingsPerController) {
        const key = `${controllerType}->${eventName}`;

        if (!self._handlers[key]) {
          const handler = (event) => {
            var mapping = mappingsPerController[event.type];
            var mappedEvent = mapping[self.currentMapping] ? mapping[self.currentMapping] : mapping.default;
            if (mappedEvent) {
              evt.detail.target.emit(mappedEvent, event.detail);
            }
          };
          self.sceneEl.addEventListener(eventName, handler);
          self._handlers[key] = handler;
        }
      }
    });

    // Keyboard
    document.addEventListener('keyup', this.keyboardHandler);
    document.addEventListener('keydown', this.keyboardHandler);
    document.addEventListener('keypress', this.keyboardHandler);
  },

  getActiveMapping: function () {
    return this.currentMapping;
  },

  setActiveMapping: function (mapping) {
    if (AFRAME.inputMappings[mapping]) {
      this.currentMapping = mapping;
    } else {
      console.warn('aframe-input-mapping-component: Trying to activate a mapping that doesn\'t exist:', mapping);
    }
  }
});

AFRAME.registerInputMappings = function(mappings, override) {
  if (override || Object.keys(AFRAME.inputMappings).length === 0) {
    AFRAME.inputMappings = mappings;
  } else {
    for (var mappingName in mappings) {
      var mapping = mappings[mappingName];
      if (!AFRAME.inputMappings[mappingName]) {
        AFRAME.inputMappings[mappingName] = mapping;
        continue;
      }

      for (var controllerName in mapping) {
        var controllerMapping = mapping[controllerName]
        if (!AFRAME.inputMappings[mappingName][controllerName]) {
          AFRAME.inputMappings[mappingName][controllerName] = controllerMapping;
          continue;
        }

        for (var eventName in controllerMapping) {
          AFRAME.inputMappings[mappingName][controllerName][eventName] = controllerMapping[eventName];
        }
      }
    }
  }

  for (var i = 0; i < AFRAME.scenes.length; i++) {
    AFRAME.scenes[i].emit('inputmappingregistered');
  }
};

if (AFRAME.DEFAULT_INPUT_MAPPINGS) {
  AFRAME.registerInputMappings(AFRAME.DEFAULT_INPUT_MAPPINGS);
}
