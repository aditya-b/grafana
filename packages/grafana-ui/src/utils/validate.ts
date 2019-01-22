import { EventsWithValidation, ValidationRule, ValidationEvents } from '..';

export const validate = (value: string, validationRules: ValidationRule[]) => {
  const errors = validationRules.reduce((acc, currentRule: ValidationRule) => {
    if (!currentRule.rule(value)) {
      return acc.concat(currentRule.errorMessage);
    }
    return acc;
  }, []);
  return errors.length > 0 ? errors : null;
};

export const hasValidationEvent = (event: EventsWithValidation, validationEvents?: ValidationEvents) => {
  return validationEvents && validationEvents[event];
};
