import _ from 'lodash';

export function assignModelProperties(target, source, defaults) {
  for (const key in defaults) {
    if (!defaults.hasOwnProperty(key)) {
      continue;
    }

    target[key] = source[key] === undefined ? defaults[key] : source[key];
  }
}

type BoolMap = { [str: string]: boolean };

export function removeModelDefaults(source: object, defaults: object, ignore?: BoolMap): object {
  const model = {};

  if (defaults === undefined) {
    return _.cloneDeep(source);
  }

  for (const property in source) {
    if (!source.hasOwnProperty(property) || (ignore && ignore[property])) {
      continue;
    }

    const sourceValue = source[property];
    const defaultValue = defaults[property];

    if (_.isEqual(sourceValue, defaultValue)) {
      continue;
    }

    let newValue: any;

    if (Array.isArray(sourceValue) && Array.isArray(defaultValue)) {
      newValue = [];
      for (let i = 0; i < sourceValue.length; i++) {
        newValue.push(removeModelDefaults(sourceValue[i], defaultValue[i]));
      }
    } else if (_.isPlainObject(sourceValue) && defaultValue) {
      // for nested objects we need only include properties that diff from defaults
      newValue = removeModelDefaults(sourceValue, defaultValue);
    } else {
      newValue = _.cloneDeep(sourceValue);
    }

    model[property] = newValue;
  }

  return model;
}
