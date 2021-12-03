<template>
  <div class="text-center">
    <h1 class="text-2xl mt-8 mb-1 font-bold">GreaterMUD Exp Tracker</h1>
    <p class="text-xl mb-1">
      <nuxt-link to="/">PVP Realm</nuxt-link> -
      <span class="tgl-active">PVE Realm</span>
    </p>
    <p class="text-gray-420 mb-8">Last updated {{ lastUpdateString }}</p>
    <p>
      Exp/hr over last:
      <span
        :class="{ tgl: graphType !== 1, 'tgl-active': graphType === 1 }"
        @click="setGraphType(1)"
        >24 hours</span
      >
      -
      <span
        :class="{ tgl: graphType !== 2, 'tgl-active': graphType === 2 }"
        @click="setGraphType(2)"
        >3 days</span
      >
      -
      <span
        :class="{ tgl: graphType !== 3, 'tgl-active': graphType === 3 }"
        @click="setGraphType(3)"
        >1 week</span
      >
    </p>

    <client-only>
      <graphy :graphdata="graphdata" :lastUpdate="lastUpdate"></graphy>
    </client-only>

    <table class="main-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th class="text-left">Exp</th>
          <th>Name</th>
          <th>Last Hour</th>
          <th>Last 24h</th>
          <th>Last 3 days</th>
          <th>Last 7 days</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(player, idx) in sortedPlayers" :key="player.name">
          <td>{{ idx + 1 }}</td>
          <td class="text-left">{{ totalFormat(player.currentExp) }}</td>
          <td
            width="30%"
            :class="{
              empty: player.lastHour === 0 && player.time2total === 'no data',
            }"
          >
            <span class="player-name" @click="setGraph(player)">{{
              player.name
            }}</span>
          </td>
          <td :class="{ empty: player.lastHour === 0 }">
            {{ expFormat(player.lastHour) }}
          </td>
          <td>
            <div v-if="player.time1total > 0">
              <span>{{ expFormat(player.time1avg) }}/hr</span><br />
              <span class="text-gray-420 text-sm">
                ({{ expFormat(player.time1total) }} total)
              </span>
            </div>
            <div v-else class="empty">0</div>
          </td>
          <td>
            <div v-if="player.time2total > 0">
              <span>{{ expFormat(player.time2avg) }}/hr</span><br />
              <span class="text-gray-420 text-sm">
                ({{ expFormat(player.time2total) }} total)
              </span>
            </div>
            <div v-else class="empty">0</div>
          </td>
          <td>
            <div v-if="player.time3total > 0">
              <span>{{ expFormat(player.time3avg) }}/hr</span><br />
              <span class="text-gray-420 text-sm">
                ({{ expFormat(player.time3total) }} total)
              </span>
            </div>
            <div v-else class="empty">0</div>
          </td>
        </tr>
      </tbody>
    </table>
    <p class="mt-4 mb-4 text-gray-800 text-xs">
      Whazzis? Whazzat? Hrglflmnblg... (v0.2.2)
    </p>
  </div>
</template>

<script>
import { DateTime } from 'luxon'

export default {
  components: {
    graphy: () => {
      if (process.client) {
        return import('../comps/Graph.vue')
      }
    },
  },
  data() {
    return {
      graphdata: [],
      graphType: 2,
    }
  },
  async asyncData({ $content }) {
    const players = await $content('players2').fetch()
    const calculated = players.players.map((player) => {
      const lastHour = player.exp[1] ? player.exp[0] - player.exp[1] : 'no data'

      const time1total = player.exp[24]
        ? player.exp[0] - player.exp[24]
        : 'no data'
      const time1avg = player.exp[24] ? Math.round(time1total / 24) : 'no data'

      const time2total = player.exp[72]
        ? player.exp[0] - player.exp[72]
        : 'no data'
      const time2avg = player.exp[72] ? Math.round(time2total / 72) : 'no data'

      const time3total = player.exp[167]
        ? player.exp[0] - player.exp[167]
        : 'no data'
      const time3avg = player.exp[167]
        ? Math.round(time3total / 167)
        : 'no data'

      let graph1, graph2, graph3

      //graph1
      if (player.exp[24]) {
        graph1 = []
        for (let i = 0; i < 24; i++) {
          graph1.push(player.exp[i] - player.exp[i + 1])
        }
        graph1.reverse()
      } else {
        graph1 = [0]
      }

      //graph2
      if (player.exp[72]) {
        graph2 = []
        for (let i = 0; i < 72; i++) {
          graph2.push(player.exp[i] - player.exp[i + 1])
        }
        graph2.reverse()
      } else {
        graph2 = [0]
      }

      //graph3
      if (player.exp[167]) {
        graph3 = []
        for (let i = 0; i < 167; i++) {
          graph3.push(player.exp[i] - player.exp[i + 1])
        }
        graph3.reverse()
      } else {
        graph3 = [0]
      }

      return {
        name: player.name,
        currentExp: player.exp[0],
        lastHour,
        time1total,
        time1avg,
        time2total,
        time2avg,
        time3total,
        time3avg,
        graph1,
        graph2,
        graph3,
      }
    })
    return { players: calculated, lastUpdate: players.lastUpdate }
  },
  computed: {
    sortedPlayers() {
      return this.players.sort((a, b) => b.currentExp - a.currentExp)
    },
    lastUpdateString() {
      return DateTime.fromISO(this.lastUpdate).toRelative()
    },
  },
  methods: {
    expFormat(num) {
      if (num > 999999) {
        return Math.round(num / 10000, 2) / 100 + 'mil'
      }
      if (num > 999) {
        return Math.round(num / 1000) + 'k'
      }
      return num
    },
    totalFormat(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    setGraphType(type) {
      this.graphType = type

      const graph =
        this.graphType === 1
          ? 'graph1'
          : this.graphType === 2
          ? 'graph2'
          : 'graph3'

      this.graphdata = this.graphdata.map((player) => {
        const foundPlayer = this.sortedPlayers.find(
          (sp) => sp.name === player.name
        )
        return { ...player, data: foundPlayer[graph] }
      })
    },
    setGraph(player) {
      const hasPlayer = this.graphdata.find((gd) => gd.name === player.name)

      const graph =
        this.graphType === 1
          ? 'graph1'
          : this.graphType === 2
          ? 'graph2'
          : 'graph3'

      if (hasPlayer) {
        const filteredData = this.graphdata.filter(
          (gd) => gd.name !== player.name
        )
        this.graphdata = filteredData
      } else {
        this.graphdata.push({
          name: player.name,
          data: player[graph],
          marker: {
            radius: 2,
            symbol: 'circle',
          },
        })
      }
      const params = { players: this.graphdata.map((p) => p.name).join(',') }
      history.pushState(
        {},
        null,
        this.$route.path +
          '?' +
          Object.keys(params)
            .map((key) => {
              return encodeURIComponent(key) + '=' + params[key]
            })
            .join('&')
      )
    },
    setGraphPlayers() {
      if (this.$route.query && this.$route.query.players) {
        const initialPlayers = this.$route.query.players.split(',')
        initialPlayers.forEach((playerName) => {
          const foundPlayer = this.sortedPlayers.find(
            (sp) => sp.name === playerName
          )
          if (foundPlayer) {
            this.setGraph(foundPlayer)
          }
        })
      } else {
        this.setGraph(this.sortedPlayers[0])
        this.setGraph(this.sortedPlayers[1])
        this.setGraph(this.sortedPlayers[2])
      }
    },
  },
  mounted() {
    this.setGraphPlayers()
  },
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Lato&display=swap');
body {
  font-family: 'Lato', sans-serif;
  background: #191919;
  color: #fff;
}
table {
  border-collapse: collapse;
  text-align: center;
  thead {
    background-color: #141414;
    th {
      font-size: 12px;
      text-transform: uppercase;
      text-align: center;
      padding: 6px 8px 8px;
    }
  }
  tbody {
    tr {
      background-color: #181818;
      td {
        height: 50px;
      }
    }
    tr:nth-child(even) {
      background-color: #161616;
    }
  }

  .button {
    margin: 0;
  }
}
.main-table {
  min-width: 1200px;
  max-width: 1200px;
  margin: auto;
}
.text-gray-420 {
  color: #3d3d3d;
}
.empty {
  color: #3d3d3d;
}
.player-name {
  cursor: pointer;
  color: rgb(34, 153, 221);
}
a,
.tgl {
  color: rgb(34, 153, 221);
  cursor: pointer;
}
.tgl-active {
  color: rgb(203, 236, 141);
  font-weight: bold;
}
</style>
