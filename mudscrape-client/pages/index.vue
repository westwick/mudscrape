<template>
  <div>
    <h1>GreaterMUD Exp Tracker</h1>
    <div class="player" v-for="player in players" :key="player.name">
      {{ player.name }} -- {{ player.currentExp }} -- {{ player.lastHour }} --
      {{ player.eightHoursTotal }} ({{ player.eightHoursAvg }}/hr)
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ $content }) {
    const players = await $content('players').fetch()
    const calculated = players.players.map((player) => {
      const lastHour = player.exp[1] ? player.exp[0] - player.exp[1] : 'no data'
      const eightHoursTotal = player.exp[8]
        ? player.exp[0] - player.exp[8]
        : 'no data'
      const eightHoursAvg = eightHoursTotal / 8
      return {
        name: player.name,
        currentExp: player.exp[0],
        lastHour,
        eightHoursTotal,
        eightHoursAvg,
      }
    })
    return { players: calculated }
  },
}
</script>
