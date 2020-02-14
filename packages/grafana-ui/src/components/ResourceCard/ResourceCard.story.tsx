import React from 'react';
import { storiesOf } from '@storybook/react';
import { withCenteredStory } from '../../utils/storybook/withCenteredStory';
import { ResourceCard } from './ResourceCard';

const ResourceCardStories = storiesOf('UI/ResourceCard', module);

ResourceCardStories.addDecorator(withCenteredStory);

interface ResourceCardItem {
  title: string;
  description?: string;
  imgUrl?: string;
  infoItems: Record<string, string>;
}

ResourceCardStories.add('default', () => {
  const items = [
    {
      title: 'Azure production instance',
      infoItems: {
        url: 'http://wwww.google.com',
        type: 'storybook',
      },
    },
    {
      title: 'Stackdriver production instance',
      infoItems: {
        url: 'http://prod.instance.us',
        type: 'stackdriver',
      },
    },
  ];

  return (
    <div style={{ maxWidth: '900px', flexGrow: '1' }}>
      {items.map(item => {
        return (
          <ResourceCard.Card
            name={<ResourceCard.Name value={item.title} />}
            description={item.description && <ResourceCard.Description value={item.description} />}
            infoItems={Object.keys(item.infoItems).map(key => {
              return <ResourceCard.InfoItem keyName={key} value={item.infoItems[key]} />;
            })}
          />
        );
      })}
    </div>
  );
});
