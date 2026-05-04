import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryTheme,
} from 'victory-native';

import { useTheme } from '../../hooks/useTheme';
import type { DailyLog } from '../../types/cycle';
import { topSymptoms } from '../../utils/cycleHelpers';
import { Card } from '../shared/Card';
import { Typography } from '../shared/Typography';

interface Props {
  logs: DailyLog[];
}

export function SymptomPattern({ logs }: Props) {
  const theme = useTheme();
  const top = topSymptoms(logs, 5);

  if (top.length === 0) {
    return (
      <Card>
        <Typography variant="h3">Top symptoms</Typography>
        <Typography
          variant="bodySmall"
          color={theme.colors.textSecondary}
          style={{ marginTop: 6 }}
        >
          Log a few symptoms to surface your most common ones here.
        </Typography>
      </Card>
    );
  }

  const data = top.map(t => ({ x: t.symptom, y: t.count }));
  const width = Dimensions.get('window').width - 64;

  return (
    <Card>
      <Typography variant="h3">Top symptoms</Typography>
      <Typography
        variant="bodySmall"
        color={theme.colors.textSecondary}
        style={{ marginBottom: 4 }}
      >
        How often each appears in your logs
      </Typography>
      <View style={styles.wrap}>
        <VictoryChart
          width={width}
          height={220}
          theme={VictoryTheme.material}
          domainPadding={{ x: 16 }}
          padding={{ top: 16, bottom: 56, left: 40, right: 16 }}
        >
          <VictoryAxis
            style={{
              tickLabels: {
                fill: theme.colors.textSecondary,
                fontSize: 9,
                angle: -25,
                textAnchor: 'end',
              },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t: number) => Math.round(t).toString()}
            style={{ tickLabels: { fill: theme.colors.textSecondary, fontSize: 10 } }}
          />
          <VictoryBar
            data={data}
            style={{ data: { fill: theme.raw.rose } }}
            cornerRadius={{ top: 4 }}
          />
        </VictoryChart>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
});
