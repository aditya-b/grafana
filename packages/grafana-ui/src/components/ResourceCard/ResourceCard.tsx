import React, { FC, ReactNode } from 'react';
import { css } from 'emotion';
import { stylesFactory, useTheme, selectThemeVariant } from '../../themes';
import { GrafanaTheme } from '@grafana/data';

export interface Props {
  name: JSX.Element;
  description?: JSX.Element;
  figure?: JSX.Element;
  infoItems?: JSX.Element[];
  actions?: JSX.Element[];
  children?: ReactNode;
}

export const Card: FC<Props> = (props: Props) => {
  const { name, description, figure, infoItems, actions, children } = props;
  const theme = useTheme();
  const styles = getStyles(theme);

  const infoElements = infoItems && (
    <div className={styles.infoItems}>
      {React.Children.map(infoItems, item => (
        <div className={styles.infoItem}>{item}</div>
      ))}
    </div>
  );

  return (
    <div className={styles.card}>
      {figure}
      <div className={styles.rows}>
        {name}
        {description && <div className={styles.rowItem}>{description}</div>}
        {infoElements && <div className={styles.rowItem}>{infoElements}</div>}
        {children && <div className={styles.rowItem}>{children}</div>}
      </div>
      {actions && <ResourceCardActions actions={actions} />}
    </div>
  );
};

export interface ResourceCardNameProps {
  value: string;
}

export const ResourceCardName: FC<ResourceCardNameProps> = ({ value }) => {
  return <span className="resource-card-text">{value}</span>;
};

export interface ResourceCardDescriptionProps {
  value: string;
}

export const ResourceCardDescription: FC<ResourceCardDescriptionProps> = ({ value }) => {
  return <span className="resource-card-desc">{value}</span>;
};

export interface ResourceCardFigureProps {
  src: string;
  alt: string;
}

export const ResourceCardFigure: FC<ResourceCardFigureProps> = ({ src, alt }) => {
  return <img className="resource-card-logo" src={src} alt={alt} />;
};

export interface ResourceCardInfoItemProps {
  keyName: string;
  value: string;
}

export const ResourceCardInfoItem: FC<ResourceCardInfoItemProps> = ({ keyName, value }) => {
  return keyName && value ? (
    <span className="resource-card-desc">
      {keyName}: {value}
    </span>
  ) : null;
};

export interface ResourceCardActionsProps {
  actions: JSX.Element[];
}

export const ResourceCardActions: FC<ResourceCardActionsProps> = ({ actions }) => {
  return <div className="resource-card-actions">{React.Children.map(actions, (action: JSX.Element) => action)}</div>;
};

export const ResourceCard = {
  Card: Card,
  Name: ResourceCardName,
  Description: ResourceCardDescription,
  Figure: ResourceCardFigure,
  InfoItem: ResourceCardInfoItem,
  Actions: ResourceCardActions,
};

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  const hoverBgColor = `#0d2333`;
  const hoverBorderColor = theme.colors.blueLight;

  return {
    card: css`
      width: 100%;
      padding: ${theme.spacing.md};
      background: ${theme.colors.formInputBg};
      border: 1px solid ${theme.colors.formInputBorder};
      border-radius: ${theme.border.radius.md};
      display: flex;
      align-items: center;
      margin-bottom: ${theme.spacing.sm};

      &:hover {
        background: ${hoverBgColor};
        border-color: ${hoverBorderColor};
        box-shadow: 0 0 4px ${hoverBorderColor};

        .resource-card-actions {
          opacity: 1;
          transition: 0.15s opacity ease-in-out;
        }
      }
    `,
    rows: css`
      display: flex;
      flex-direction: column;
    `,
    rowItem: css``,
    infoItem: css`
      padding-right: ${theme.spacing.md};
    `,
    infoItems: css`
      display: flex;
    `,
  };
});
