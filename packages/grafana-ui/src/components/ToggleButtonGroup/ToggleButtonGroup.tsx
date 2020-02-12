import React, { FC, ReactNode, PureComponent } from 'react';
import { Tooltip } from '../Tooltip/Tooltip';

interface ToggleButtonGroupProps {
  label?: string;
  children: JSX.Element[];
  transparent?: boolean;
  className?: string;
}

export class ToggleButtonGroup extends PureComponent<ToggleButtonGroupProps> {
  render() {
    const { children, label, transparent, className } = this.props;

    return (
      <div className={`gf-form gf-form--align-center ${className ?? ''}`}>
        {label && <label className={`gf-form-label ${transparent ? 'gf-form-label--transparent' : ''}`}>{label}</label>}
        <div className={`toggle-button-group ${transparent ? 'toggle-button-group--transparent' : ''}`}>{children}</div>
      </div>
    );
  }
}

interface ToggleButtonProps {
  onChange?: (value: any) => void;
  selected?: boolean;
  value: any;
  className?: string;
  children: ReactNode;
  tooltip?: string;
}

export const ToggleButton: FC<ToggleButtonProps> = ({
  children,
  selected,
  className = '',
  value = null,
  tooltip,
  onChange,
}) => {
  const onClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    if (!selected && onChange) {
      onChange(value);
    }
  };

  const btnClassName = `btn ${className}${selected ? ' active' : ''}`;
  const button = (
    <button className={btnClassName} onClick={onClick}>
      <span>{children}</span>
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} placement="bottom">
        {button}
      </Tooltip>
    );
  } else {
    return button;
  }
};
