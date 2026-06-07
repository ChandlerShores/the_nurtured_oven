import {
  getOrderingKillSwitchState,
  setAdminOrderingKillSwitch,
} from "../lib/admin/ordering-kill-switch"

async function main() {
  const before = await getOrderingKillSwitchState()
  const result = await setAdminOrderingKillSwitch(false)
  const after = await getOrderingKillSwitchState()

  console.log("Kill switch before:", before.active, `(${before.source})`)
  if (!result.ok) {
    console.error("Could not clear:", result.error)
    process.exit(1)
  }
  console.log("Kill switch after:", after.active, `(${after.source})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
