<template>
  <div class="text-center">
    <h1 class="text-xl mt-8 mb-1 font-bold">GreaterMUD Exp Tracker</h1>
    <p class="text-gray-420 mb-8">Last updated {{ lastUpdateString }}</p>

    <client-only>
      <graphy :graphdata="graphdata"></graphy>
    </client-only>

    <table class="main-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th class="text-left">Exp</th>
          <th>Name</th>
          <th>Last Hour</th>
          <th>Last 8h</th>
          <th>Last 24h</th>
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
        </tr>
      </tbody>
    </table>
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
    }
  },
  async asyncData({ $content }) {
    const players = await $content('players').fetch()
    const calculated = players.players.map((player) => {
      const lastHour = player.exp[1] ? player.exp[0] - player.exp[1] : 'no data'

      const time1total = player.exp[8]
        ? player.exp[0] - player.exp[8]
        : 'no data'
      const time1avg = player.exp[8] ? Math.round(time1total / 8) : 'no data'

      const time2total = player.exp[24]
        ? player.exp[0] - player.exp[24]
        : 'no data'
      const time2avg = player.exp[24] ? Math.round(time2total / 24) : 'no data'

      let graph
      if (player.exp[24]) {
        graph = []
        for (let i = 0; i < 24; i++) {
          graph.push(player.exp[i] - player.exp[i + 1])
        }
        graph.reverse()
      } else {
        graph = [0]
      }
      return {
        name: player.name,
        currentExp: player.exp[0],
        lastHour,
        time1total,
        time1avg,
        time2total,
        time2avg,
        graph,
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
    setGraph(player) {
      const hasPlayer = this.graphdata.find((gd) => gd.name === player.name)
      console.log('hasPlayer', hasPlayer)
      if (hasPlayer) {
        const filteredData = this.graphdata.filter(
          (gd) => gd.name !== player.name
        )
        console.log('filtered', filteredData)
        this.graphdata = filteredData
      } else {
        this.graphdata.push({
          name: player.name,
          data: player.graph,
        })
      }
    },
  },
  mounted() {
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
</style>
