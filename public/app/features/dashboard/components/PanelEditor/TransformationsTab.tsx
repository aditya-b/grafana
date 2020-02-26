import React, { FC } from 'react';
import { css } from 'emotion';
import { GrafanaTheme, PanelData, DataTransformerConfig } from '@grafana/data';
import { useTheme, stylesFactory, TransformationsEditor } from '@grafana/ui';
import { PanelModel } from '../../state/PanelModel';

interface Props {
  panel: PanelModel;
  data: PanelData;
}

export const TransformationsTab: FC<Props> = ({ panel, data }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const onTransformersChange = (transformers: DataTransformerConfig[]) => {
    panel.setTransformations(transformers);
  };

  return (
    <div className={styles.wrapper}>
      <TransformationsEditor
        transformations={panel.transformations || []}
        onChange={onTransformersChange}
        dataFrames={data.series}
      />
    </div>
  );
};

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    wrapper: css`
      padding: ${theme.spacing.md};
    `,
  };
});
