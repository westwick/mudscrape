<template>
  <div>
    <highcharts :options="chartOptions" :updateArgs="[true, true]"></highcharts>
  </div>
</template>

<script>
import { Chart } from 'highcharts-vue'

export default {
  props: ['graphdata'],
  components: { highcharts: Chart },
  data() {
    return {
      data: [],
    }
  },
  computed: {
    chartOptions() {
      return {
        credits: { enabled: false },
        title: { text: undefined },
        chart: { backgroundColor: 'transparent' },
        yAxis: { title: false, gridLineColor: '#131313' },
        xAxis: { visible: false },
        colors: [
          '#34ADAB',
          '#90ee7e',
          '#f45b5b',
          '#aaeeee',
          // '#aaeeee',
          '#E5B25D',
          '#DF1DB5',
          // '#55BF3B',
          // '#DF5353',
          // '#7798BF',
          // '#aaeeee',
        ],
        legend: {
          itemStyle: {
            color: '#eeeeee',
          },
          itemHoverStyle: {
            color: '#ffffff',
          },
        },
        series: this.graphdata,
      }
    },
  },
}
</script>
