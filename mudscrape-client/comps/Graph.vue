<template>
  <div>
    <highcharts :options="chartOptions"></highcharts>
  </div>
</template>

<script>
import { Chart } from 'highcharts-vue'

export default {
  props: ['graphdata'],
  components: { highcharts: Chart },
  data() {
    return {
      chartOptions: {
        credits: { enabled: false },
        title: { text: undefined },
        chart: { backgroundColor: 'transparent' },
        yAxis: { title: false, gridLineColor: '#131313' },
        xAxis: { visible: false },
        colors: [
          '#2f7ed8',
          '#8bbc21',
          '#910000',
          '#1aadce',
          '#492970',
          '#f28f43',
          '#77a1e5',
          '#c42525',
          '#a6c96a',
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
      },
    }
  },
  watch: {
    graphdata: {
      handler() {
        this.chartOptions = {
          ...this.chartOptions,
          series: this.graphdata,
        }
      },
      deep: true,
    },
  },
}
</script>
