import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
} from 'victory-native';

import { useTheme } from '../../hooks/useTheme';
import type { CycleEntry } from '../../types/cycle';
import { Card } from '../shared/Card';
import { Typography } from '../shared/Typography';

interface Props {
  cycles: CycleEntry[];
}

export function CycleLengthChart({ cycles }: Props) {
  const theme = useTheme();
  const data = cycles
    .filter(c => c.cycleLength !== null)
    .slice(-6)
    .map((c, i) => ({
      x: i + 1,
      y: c.cycleLength as number,
      label: c.startDate.slice(5),
    }));

  if (data.length < 2) {
    return (
      <Card>
        <Typography variant="h3">Cycle length trend</Typography>
        <Typography
          variant="bodySmall"
          color={theme.colors.textSecondary}
          style={{ marginTop: 6 }}
        >
          Log at least two complete cycles to see your trend.
        </Typography>
      </Card>
    );
  }

  const width = Dimensions.get('window').width - 64;

  return (
    <Card>
      <Typography variant="h3">Cycle length trend</Typography>
      <Typography
        variant="bodySmall"
        color={theme.colors.textSecondary}
        style={{ marginBottom: 4 }}
      >
        Last {data.length} cycles
      </Typography>
      <View style={styles.chartWrap}>
        <VictoryChart
          width={width}
          height={220}
          theme={VictoryTheme.material}
          padding={{ top: 16, bottom: 32, left: 40, right: 16 }}
        >
          <VictoryAxis
            dependentAxis
            style={{ tickLabels: { fill: theme.colors.textSecondary, fontSize: 10 } }}
          />
          <VictoryAxis
            style={{ tickLabels: { fill: theme.colors.textSecondary, fontSize: 10 } }}
          />
          <VictoryLine
            data={data}
            style={{ data: { stroke: theme.raw.rose, strokeWidth: 2 } }}
            interpolation="monotoneX"
          />
          <VictoryScatter
            data={data}
            size={4}
            style={{ data: { fill: theme.raw.rose } }}
          />
        </VictoryChart>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  chartWrap: {
    alignItems: 'center',
  },
});
