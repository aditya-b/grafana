import React, { ButtonHTMLAttributes } from 'react';
import { css, cx } from 'emotion';
import { GrafanaTheme } from '@grafana/data';
import { stylesFactory, useTheme, Tooltip, selectThemeVariant } from '@grafana/ui';

export interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
}

export const BackButton: React.FC<Props> = props => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <Tooltip content="Go back (Esc)" placement="bottom">
      <button {...props} className={cx(styles.wrapper, props.className)}>
        <i className={props.icon ?? 'gicon gicon-arrow-left'} />
      </button>
    </Tooltip>
  );
};

BackButton.displayName = 'BackButton';

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  const hoverColor = selectThemeVariant({ dark: theme.colors.gray15, light: theme.colors.gray85 }, theme.type);

  return {
    wrapper: css`
      background: transparent;
      border: none;
      padding: 0;
      margin: 0;
      outline: none;
      box-shadow: none;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      &:before {
        content: '';
        display: block;
        opacity: 1;
        position: absolute;
        transition-duration: 0.2s;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        z-index: -1;
        bottom: -10px;
        left: -10px;
        right: -10px;
        top: -10px;
        background: none;
        border-radius: 50%;
        box-sizing: border-box;
        transform: scale(0);
        transition-property: transform, opacity;
      }

      .fa,
      .gicon {
        font-size: 26px;
      }

      &:hover {
        &:before {
          background-color: ${hoverColor};
          border: none;
          box-shadow: none;
          opacity: 1;
          transform: scale(0.8);
        }
      }
    `,
  };
});
