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

  for (const property in source) {
    if (!source.hasOwnProperty(property) || (ignore && ignore[property])) {
      continue;
    }

    const sourceValue = source[property];
    const defaultValue = defaults[property];

    if (_.isEqual(sourceValue, defaultValue)) {
      continue;
    }

    if (Array.isArray(sourceValue)) {
      model[property] = _.cloneDeep(source[property]);
    } else if (_.isPlainObject(sourceValue)) {
      // for nested objects we need only include properties that diff from defaults
      model[property] = removeModelDefaults(sourceValue, defaultValue);
    } else {
      model[property] = _.cloneDeep(source[property]);
    }
  }

  return model;
}
