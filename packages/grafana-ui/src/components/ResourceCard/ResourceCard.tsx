import React, { FunctionComponent, ReactNode, FC } from 'react';
import { css } from 'emotion';
import { stylesFactory, useTheme } from '../../themes';
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

  return (
    <div className={styles.card}>
      {figure}
      <div className="resource-card-text-wrapper">
        {name}
        {description}
        {infoItems}
        {children}
      </div>
      {actions && <ResourceCardActions actions={actions} />}
    </div>
  );
};

export interface ResourceCardNameProps {
  value: string;
}

export const ResourceCardName: FunctionComponent<ResourceCardNameProps> = ({ value }) => {
  return <span className="resource-card-text">{value}</span>;
};

export interface ResourceCardDescriptionProps {
  value: string;
}

export const ResourceCardDescription: FunctionComponent<ResourceCardDescriptionProps> = ({ value }) => {
  return <span className="resource-card-desc">{value}</span>;
};

export interface ResourceCardFigureProps {
  src: string;
  alt: string;
}

export const ResourceCardFigure: FunctionComponent<ResourceCardFigureProps> = ({ src, alt }) => {
  return <img className="resource-card-logo" src={src} alt={alt} />;
};

export interface ResourceCardInfoItemProps {
  keyName: string;
  value: string;
}

export const ResourceCardInfoItem: FunctionComponent<ResourceCardInfoItemProps> = ({ keyName, value }) => {
  return keyName && value ? (
    <span className="resource-card-desc">
      {keyName}: {value}
    </span>
  ) : null;
};

export interface ResourceCardActionsProps {
  actions: JSX.Element[];
}

export const ResourceCardActions: FunctionComponent<ResourceCardActionsProps> = ({ actions }) => {
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
    `,
  };
});
