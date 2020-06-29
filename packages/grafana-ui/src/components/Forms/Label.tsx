import React, { ReactNode } from 'react';
import { useTheme, stylesFactory } from '../../themes';
import { GrafanaTheme } from '@grafana/data';
import { css, cx } from 'emotion';
import { Icon } from '../Icon/Icon';
import tinycolor from 'tinycolor2';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  description?: ReactNode;
  category?: string[];
}

export const getLabelStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    label: css`
      label: Label;
      font-size: ${theme.typography.size.sm};
      font-weight: ${theme.typography.weight.semibold};
      line-height: 1.25;
      margin: ${theme.spacing.formLabelMargin};
      padding: ${theme.spacing.formLabelPadding};
      color: ${theme.colors.formLabel};
      max-width: 480px;
    `,
    labelContent: css`
      display: flex;
      align-items: center;
    `,
    description: css`
      label: Label-description;
      color: ${theme.colors.formDescription};
      font-size: ${theme.typography.size.sm};
      font-weight: ${theme.typography.weight.regular};
      margin-top: ${theme.spacing.xxs};
      display: block;
      // Links in descriptions
      > a {
        color: ${theme.colors.formDescription};
        text-decoration: underline;

        &:hover {
          color: ${theme.colors.text};
        }
      }
    `,
    categories: css`
      label: Label-categories;
      color: ${theme.isLight
        ? tinycolor(theme.colors.formLabel)
            .lighten(10)
            .toHexString()
        : tinycolor(theme.colors.formLabel)
            .darken(10)
            .toHexString()};
      display: inline-flex;
      align-items: center;
    `,
    chevron: css`
      margin: 0 ${theme.spacing.xxs};
    `,
  };
});

const linksRegex = /\[([\w\s\d]+)\]\((https?:\/\/[\w\d./?=\-#]+)\)/;

export const Label: React.FC<LabelProps> = ({ children, description, className, category, ...labelProps }) => {
  const theme = useTheme();
  const styles = getLabelStyles(theme);
  const categories = category?.map((c, i) => {
    return (
      <span className={styles.categories} key={`${c}/${i}`}>
        <span>{c}</span>
        <Icon name="angle-right" className={styles.chevron} />
      </span>
    );
  });

  return (
    <div className={cx(styles.label, className)}>
      <label {...labelProps}>
        <div className={styles.labelContent}>
          {categories}
          {children}
        </div>
        {description && <span className={styles.description}>{renderDescription(description)}</span>}
      </label>
    </div>
  );
};

/**
 * Takes a string and replaces markdown link syntax with real react links
 */
function renderDescription(description: ReactNode): ReactNode {
  if (typeof description !== 'string') {
    return description;
  }

  let result = null;

  // reset regex index
  linksRegex.lastIndex = 0;

  if ((result = linksRegex.exec(description)) !== null) {
    let output: ReactNode[] = [];
    let index = result.index;
    let match = result[0];

    output.push(<span key="1">{description.substring(0, index)}</span>);
    output.push(
      <a key="2" href={result[2]} target="_blank">
        {result[1]}
      </a>
    );

    const remainder = description.substring(index + match.length, description.length + 1);
    output.push(<span key="3">{remainder}</span>);

    return output;
  } else {
    return description;
  }
}
