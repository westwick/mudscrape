<template>
  <div>
    <highcharts :options="chartOptions" :updateArgs="[true, true]"></highcharts>
  </div>
</template>

<script>
import { Chart } from 'highcharts-vue'
import Highcharts from 'highcharts'
import { DateTime } from 'luxon'

export default {
  props: ['graphdata', 'lastUpdate'],
  components: { highcharts: Chart },
  data() {
    return {
      data: [],
    }
  },
  computed: {
    chartOptions() {
      let xAxisCategories = []
      console.log('hi', this.graphdata[0])
      for (let i = 0; i <= this.graphdata[0].data.length; i++) {
        const d1 = DateTime.fromISO(this.lastUpdate)
          .minus({
            hours: this.graphdata[0].data.length - i,
          })
          .toLocaleString({ weekday: 'long', hour: 'numeric' })
        const d2 = DateTime.fromISO(this.lastUpdate)
          .minus({
            hours: this.graphdata[0].data.length - i - 1,
          })
          .toLocaleString({ hour: 'numeric' })
        xAxisCategories.push(d1 + ' - ' + d2)
      }
      // xAxisCategories = xAxisCategories.reverse()
      console.log('hmm', xAxisCategories)
      console.log(this.graphdata[0].data.length)

      const dateFormatFunction = function () {
        const hour = DateTime.fromMillis(this.value)
          .toLocal()
          .toLocaleString(DateTime.TIME_24_SIMPLE)

        if (false) {
          return undefined
        } else if (hour === '00:00') {
          return DateTime.fromMillis(this.value)
            .toLocal()
            .toLocaleString({ month: 'short', day: 'numeric' })
        } else {
          return hour
        }
      }

      return {
        credits: { enabled: false },
        title: { text: undefined },
        chart: { backgroundColor: 'transparent' },
        yAxis: { title: false, gridLineColor: '#131313' },
        time: {
          useUTC: false,
        },
        tooltip: {
          xDateFormat: '%B %e, %H:00',
        },
        xAxis: {
          visible: false,
          type: 'datetime',
          categories: xAxisCategories,
          // labels: {
          //   formatter: dateFormatFunction,
          // },
        },
        colors: [
          '#34ADAB',
          '#90ee7e',
          '#f45b5b',
          '#aaeeee',
          '#E5B25D',
          '#DF1DB5',
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
