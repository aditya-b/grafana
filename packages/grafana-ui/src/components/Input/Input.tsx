import React, { ChangeEvent, FocusEvent, FormEvent, InputHTMLAttributes, PureComponent, SyntheticEvent } from 'react';
import classNames from 'classnames';
import { validate, hasValidationEvent } from '../../utils';
import { EventsWithValidation, InputStatus, ValidationEvents, ValidationRule } from '../../types';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  validationEvents?: ValidationEvents;
  hideErrorMessage?: boolean;
  className?: string;

  // Override event props and append status as argument
  onBlur?: (event: FocusEvent<HTMLInputElement>, status?: InputStatus) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>, status?: InputStatus) => void;
  onChange?: (event: FormEvent<HTMLInputElement>, status?: InputStatus) => void;
}

interface State {
  error: string;
}

export class Input extends PureComponent<Props, State> {
  static defaultProps = {
    className: '',
  };

  state = {
    error: '',
  };

  get status() {
    return this.state.error ? InputStatus.Invalid : InputStatus.Valid;
  }

  get isInvalid() {
    return this.status === InputStatus.Invalid;
  }

  validatorAsync = (validationRules: ValidationRule[]) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const errors = validate(event.target.value, validationRules);
      this.setState(prevState => {
        return {
          ...prevState,
          error: errors ? errors[0] : null,
        };
      });
    };
  };

  populateEventPropsWithStatus = (
    restProps: InputHTMLAttributes<HTMLInputElement>,
    validationEvents?: ValidationEvents
  ) => {
    const inputElementProps = { ...restProps };
    Object.keys(EventsWithValidation).forEach((eventName: EventsWithValidation) => {
      if (hasValidationEvent(eventName, validationEvents) || restProps[eventName]) {
        inputElementProps[eventName] = async (event: SyntheticEvent) => {
          event.persist(); // Needed for async. https://reactjs.org/docs/events.html#event-pooling
          if (hasValidationEvent(eventName, validationEvents)) {
            await this.validatorAsync(validationEvents[eventName]).apply(this, [event]);
          }
          if (restProps[eventName]) {
            restProps[eventName].apply(null, [event, this.status]);
          }
        };
      }
    });
    return inputElementProps;
  };

  render() {
    const { validationEvents, className, hideErrorMessage, ...restProps } = this.props;
    const { error } = this.state;
    const inputClassName = classNames('gf-form-input', { invalid: this.isInvalid }, className);
    const inputElementProps = this.populateEventPropsWithStatus(restProps, validationEvents);

    return (
      <div className="our-custom-wrapper-class">
        <input {...inputElementProps} className={inputClassName} />
        {error && !hideErrorMessage && <span>{error}</span>}
      </div>
    );
  }
}
