import { I16Box, I16XY } from '@/ooz'
import { Card, Solitaire } from '@/solitaire'
import {
  PileConfig,
  setSpritePositionsForLayout,
  SPEnt,
  SPLayer,
  SPRunState,
} from '@/super-patience'
import { QueryEnt, Sprite, System } from '@/void'

export type CardEnt = QueryEnt<{ card: Card; sprite: Sprite }, typeof query>

const query = 'card & sprite'

interface PickState {
  readonly ents: {
    readonly ent: Partial<SPEnt>
    /** The adjustment to offset future pick inputs by. */
    readonly offset: Readonly<I16XY>
  }[]
}

export class CardSystem implements System<CardEnt, SPEnt> {
  readonly query = query

  #picked?: PickState | undefined
  piles: { pile: PileConfig; sprite: Sprite }[] = []
  vacantStock: Sprite | undefined

  // to-do: this list will need to be cut down by xy intersection anyway
  run(ents: ReadonlySet<CardEnt>, state: SPRunState): void {
    if (state.pickHandled) return

    const picked = pickClosest(ents, state)
    const isStockClick = this.vacantStock &&
      picked?.sprite.intersectsSprite(this.vacantStock, state.time)

    if (
      picked?.card.direction == 'Down' && !isStockClick &&
        state.input.isOffStart('Action') ||
      picked?.card.direction == 'Up' && !isStockClick &&
        state.input.isOnStart('Action') ||
      picked != null && isStockClick &&
        state.input.isOffStart('Action')
    ) {
      state.pickHandled = true
      this.setPickRange(state, picked.card)
    }

    if (state.input.isOn('Action') && this.#picked != null) {
      moveToPick(state, this.#picked)
    } else {
      // Only rerender if pick operation is done otherwise cards snap to fast in reserve.
      setSpritePositionsForLayout(
        state.ecs,
        state.filmByID,
        state.solitaire,
        state.time,
      )
    }

    if (
      state.solitaire.selected != null && state.input.isOffStart('Action')
    ) {
      if (this.#picked == null) {
        const picked = pickClosest(ents, state)
        if (picked != null) {
          Solitaire.point(state.solitaire, picked.card)
        } else Solitaire.deselect(state.solitaire)
        setSpritePositionsForLayout(
          state.ecs,
          state.filmByID,
          state.solitaire,
          state.time,
        )
      } else {
        // to-do: this is essentially invalidateBoard()

        const bestMatch = this.findbestmatch(state)
        if (
          bestMatch != null && state.solitaire.selected != null &&
          bestMatch.pile.pile.type != 'Waste'
        ) {
          Solitaire.build(state.solitaire, bestMatch.pile.pile)
        }
        Solitaire.deselect(state.solitaire)

        setSpritePositionsForLayout(
          state.ecs,
          state.filmByID,
          state.solitaire,
          state.time,
        )

        this.#picked = undefined
        // to-do: only allow dropping on top card. do i need invisi pile hit box?
        // const newPlayLocation = Layout.play(state.layout, intersection with)
        // update XY based on new position which may be putting back
      }
    }
  }

  setPickRange(state: SPRunState, card: Card): void {
    const selected = Solitaire.point(state.solitaire, card)
    if (selected == null) return
    const ents = selected.cards.map(
      (card) => {
        const ent = state.ecs.get(card)
        return {
          ent,
          offset: state.cursor.bounds.xy.copy().sub(ent.sprite!.bounds.xy),
        }
      },
      `Card ${card} missing sprite.`,
    )
    // to-do: free this ent on ECS remove
    this.#picked = { ents }

    for (const sprite of ents.map((data) => data.ent.sprite)) {
      sprite!.layer = SPLayer.Picked
    }
  }

  findbestmatch(update: SPRunState):
    | {
      intersection: I16Box
      pile: { pile: PileConfig; sprite: Sprite }
    }
    | undefined {
    const pointedCard = this.#picked?.ents[0]?.ent
    let bestMatch
    if (pointedCard != null && pointedCard.sprite != null) {
      for (const pile of this.piles) {
        const intersection = pointedCard.sprite.bounds.copy().intersection(
          pile.sprite.bounds,
        )
        if (intersection.flipped || intersection.areaNum <= 0) continue
        if (
          pile.pile.type == 'Waste' ||
          !Solitaire.isBuildable(update.solitaire, pile.pile)
        ) continue
        if (
          bestMatch == null ||
          intersection.areaNum > bestMatch.intersection.areaNum
        ) bestMatch = { intersection, pile }
      }
    }
    return bestMatch
  }
}

type Picked = { ent: CardEnt; card: Card; sprite: Sprite }

function pickClosest(
  ents: ReadonlySet<CardEnt>,
  state: SPRunState,
): Picked | undefined {
  if (state.input == null) return
  let picked: Picked | undefined
  for (const ent of ents) {
    const { card, sprite } = ent
    if (!sprite.intersectsSprite(state.cursor, state.time)) {
      continue
    }

    if (picked == null || sprite.isAbove(picked.sprite)) {
      picked = { ent, card, sprite }
    }
  }
  return picked
}

function moveToPick(state: SPRunState, picked: PickState): void {
  for (const ent of picked.ents) {
    // to-do: versus const sprite = ECS.get(ecs, 'Sprite', ent);
    ent.ent.sprite!.bounds.moveToTrunc(
      state.cursor.bounds.xy.copy().sub(ent.offset),
    )
  }
}
