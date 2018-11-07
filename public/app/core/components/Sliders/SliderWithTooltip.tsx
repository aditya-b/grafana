import React, { SFC } from 'react';
import Slider, { createSliderWithTooltip } from 'rc-slider';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

const Swt = createSliderWithTooltip(Slider);

const SliderWithTooltip: SFC<Props> = ({ value, onChange }) => {
  return (
    <div
      className="width-10"
      style={{
        padding: '0 10px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #262626',
      }}
    >
      <Swt
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={onChange}
        activeDotStyle={{
          backgroundColor: '#ecbb13',
        }}
        dotStyle={{
          border: 'none',
        }}
        trackStyle={{ backgroundColor: '#ecbb13' }}
        handleStyle={{
          border: 'none',
          backgroundColor: '#eb7b18',
          width: '20px',
          height: '20px',
          marginTop: '-8px',
        }}
        railStyle={{ backgroundColor: 'white', width: '100%' }}
        tipFormatter={v => v}
      />
    </div>
  );
};

export default SliderWithTooltip;
